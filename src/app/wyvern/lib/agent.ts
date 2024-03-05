import { DEFAULT_MEDIATOR } from "../constants"
import logger from "./logger"
import { Profile } from "./profile"
import { default as ContactService, Contact, Message } from "./contacts"
import { WorkerCommand, WorkerMessage } from "./workerTypes"
import eventbus, { EventListenerHandle } from "./eventbus"
import { IMessage } from "didcomm"
import { DIDCommMessage, DID } from "./didcomm"
import {v4 as uuidv4} from 'uuid';

export interface AgentMessage {
  sender: Contact
  receiver: Contact
  message: IMessage
}

const IMPLEMENTED_PROTOCOLS = [
  "https://didcomm.org/discover-features/2.0",
  "https://didcomm.org/trust-ping/2.0",
  "https://didcomm.org/basicmessage/2.0",
  "https://didcomm.org/user-profile/1.0",
  "https://developer.wyvrn.app/protocols/groupmessage/1.0",
]

export class Agent {
  public profile: Profile
  private worker: Worker

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url))
    this.worker.onmessage = this.handleWorkerMessage.bind(this)
		this.onAnyMessage(this.onNewMessageReceived.bind(this))
    this.onAnyMessage(this.handleCoreProtocolMessage.bind(this))

    this.onMessage(
      "https://didcomm.org/user-profile/1.0/profile",
      this.onProfileUpdate.bind(this)
    )
    this.onMessage(
      "https://didcomm.org/user-profile/1.0/request-profile",
      this.onProfileRequest.bind(this)
    )
  }

  async onNewMessageReceived(message: AgentMessage) {
    if (message.message.to[0] != this.profile.did) return
    if (!ContactService.getContact(message.message.from)) {
      let newContact = { did: message.message.from }
      ContactService.addContact(newContact as Contact)
      const transaction = this.db.transaction(["contacts"], "readwrite");
      const objectStore = transaction.objectStore("contacts")
      ContactService.getContacts().forEach((contact) => {
        const request = objectStore.put(contact);
        request.onsuccess = (event) => {
          // event.target.result === customer.ssn;
        };
      });
      let msgToSave = {
        raw: message.message,
        type: message.message.type,
        sender: newContact.did,
        receiver: message.receiver?.label || message.receiver.did,
        timestamp: new Date(),
        content: message.message.body?.content
      };
      ContactService.addMessage(newContact.did, msgToSave)
      const transaction2 = this.db.transaction(["messages"], "readwrite");
      const objectStore2 = transaction2.objectStore("messages")
      const request = objectStore2.put({contact_did: newContact.did, messages: ContactService.getMessageHistory(newContact.did)});
      request.onsuccess = (event) => {
        // event.target.result === customer.ssn;
      };
      if (
        message.message.type != "https://didcomm.org/user-profile/1.0/profile"
      ) {
        await this.requestProfile(newContact)
      }
    }
  }

  setupProfile(profile: Profile) {
    this.profile = profile
  }

  private postMessage<T>(message: WorkerCommand<T>) {
    console.log("Posting message: ", message)
    this.worker.postMessage(message)
  }

  private checkExistingSecrets(): boolean {
    const did = localStorage.getItem("wyvrn-did");
    const mediatedDid = localStorage.getItem("wyvrn-relayed-did");
    const secrets = localStorage.getItem("wyvrn-secrets");
    if(!did)
      return false;
    this.postMessage({
      type: "establishSecrets",
      payload: {
        did: did,
        mediatedDid: mediatedDid,
        savedSecrets: JSON.parse(secrets),
      }
    });
    this.onDidGenerated(mediatedDid)
    return true;
  }

  private setSecretsFromLocalStorage({did, mediatedDid, secrets}): void {
    localStorage.setItem("wyvrn-did", did)
    localStorage.setItem("wyvrn-relayed-did", mediatedDid)
    localStorage.setItem("wyvrn-secrets", JSON.stringify(Object.values(secrets)))
  }

  private handleWorkerMessage(e: MessageEvent<WorkerMessage<any>>) {
    console.log("Agent received message: ", e.data.type)
    switch (e.data.type) {
      case "log":
        logger.log(e.data.payload.message)
        break
      case "init":
        const request = indexedDB.open("MyTestDatabase", 1);
        request.onerror = (event) => {
          console.error("Why didn't you allow my web app to use IndexedDB?!");
          console.error(`Database error: ${event.target.errorCode}`);
        };
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.warn(this.db);
          this.db.transaction("contacts").objectStore("contacts").getAll().onsuccess = (event) => {
            console.warn(event)
            event.target.result.forEach(contact => {
              console.error({c: contact})
              ContactService.addContact(contact);
            });
            this.db.transaction("messages").objectStore("messages").getAll().onsuccess = (event) => {
              event.target.result.forEach(message => {
                let did = message.contact_did
                console.warn("messages", message);
                ContactService.saveMessageHistory(did, message.messages);
              });
              console.error(event.target.result)
              eventbus.emit("contactsImported", {})
            };
          };
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          this.contactStore = db.createObjectStore("contacts", { keyPath: "did" });
          this.messageStore = db.createObjectStore("messages", { keyPath: "contact_did" });
        };

        if(this.checkExistingSecrets())
          break;

        this.postMessage({
          type: "establishMediation",
          payload: { mediatorDid: DEFAULT_MEDIATOR },
        })
        break
      case "didSecrets":
        this.setSecretsFromLocalStorage(e.data.payload);
        break
      case "didGenerated":
        this.onDidGenerated(e.data.payload)
        this.postMessage({
          type: "getDidSecrets",
          payload: {},
        });
        break
      case "messageReceived":
        this.onMessageReceived(e.data.payload)
        break
      case "connected":
        eventbus.emit("connected")
        break
      case "disconnected":
        eventbus.emit("disconnected")
        break
      case "error":
      default:
        logger.log("Unhandled message: ", e.data.type)
        console.log("Unhandled message: ", e.data)
    }
  }

  private onDidGenerated(did: string) {
    logger.log("DID Generated:", did)
    eventbus.emit("didGenerated", did)

    this.postMessage({
      type: "connect",
      payload: { mediatorDid: DEFAULT_MEDIATOR },
    })
  }

  set ondid(callback: (did: string) => void) {
    eventbus.on("didGenerated", callback)
  }

  private handleDiscoverFeatures(message: IMessage) {
    const regexEscape = (s: string) =>
      s.replace(/([.*+?$^=!:{}()|\[\]\/\\])/g, "\\$1")
    const createRegex = (query: string) =>
      new RegExp(`^${query.split("*").map(regexEscape).join(".*")}$`)
    let protocolResponse: object[] = []

    // Loop through all queries, then all implemented protocols and build up a
    // list of supported protocols that match the user's request
    for (let query of message.body.queries) {
      // Rudimentary implementation, ignoring all except protocol requests
      if (query["feature-type"] != "protocol") continue

      for (let protocol of IMPLEMENTED_PROTOCOLS) {
        if (createRegex(query["match"]).test(protocol)) {
          protocolResponse.push({
            "feature-type": "protocol",
            id: protocol,
          })
        }
      }
    }
    const response = {
      type: "https://didcomm.org/discover-features/2.0/disclose",
      thid: message.id,
      body: {
        disclosures: protocolResponse,
      },
    }
    return response
  }

  private handleCoreProtocolMessage(message: AgentMessage) {
    const msg = message.message
    switch (msg.type) {
      case "https://didcomm.org/trust-ping/2.0/ping":
        if (msg.body?.response_requested !== false) {
          this.sendMessage(msg.from, {
            type: "https://didcomm.org/trust-ping/2.0/ping-response",
            thid: msg.id,
          })
        }
        break
      case "https://didcomm.org/discover-features/2.0/queries":
        const discloseMessage = this.handleDiscoverFeatures(msg)
        this.sendMessage(msg.from, discloseMessage)
        break
    }
  }

  private onMessageReceived(message: IMessage) {
    const from =
      message.from == this.profile.did
        ? (this.profile as Contact)
        : ContactService.getContact(message.from)
    let to =
      message.to[0] == this.profile.did
        ? (this.profile as Contact)
        : ContactService.getContact(message.to[0])
		console.log("METOOOO", to);
		console.log("METEEEE", message);

    const did = localStorage.getItem("wyvrn-did");
    const mediatedDid = localStorage.getItem("wyvrn-relayed-did");
    if(message.to[0] == did)
      return;

    if(!to) {
      to = {did: message.to[0]} as Contact;
      debugger;
      ContactService.addContact(to);
      const transaction = this.db.transaction(["contacts"], "readwrite");
      const objectStore = transaction.objectStore("contacts")
      ContactService.getContacts().forEach((contact) => {
        const request = objectStore.put(contact);
        request.onsuccess = (event) => {
          // event.target.result === customer.ssn;
        };
      });
    }

    if (ContactService.getContact(message.from)) {
      let fromName = message.from
      if (from) {
        fromName = from.label || from.did
      }
      ContactService.addMessage(message.from, {
        sender: fromName,
        id: uuidv4(),
        receiver: to.label || to.did,
        timestamp: new Date(),
        content: message.body.content,
        type: message.type,
        raw: message,
      })
      const transaction = this.db.transaction(["messages"], "readwrite");
      const objectStore = transaction.objectStore("messages")
      const request = objectStore.put({contact_did: from.did, messages: ContactService.getMessageHistory(from.did)});
      request.onsuccess = (event) => {
        // event.target.result === customer.ssn;
      };
    }
    eventbus.emit("messageReceived", { sender: from, receiver: to, message })
    eventbus.emit(message.type, { sender: from, receiver: to, message })
  }

  public onMessage(
    type: string,
    callback: (message: AgentMessage) => void
  ): EventListenerHandle {
    return eventbus.on(type, callback)
  }

  public onAnyMessage(
    callback: (message: AgentMessage) => void
  ): EventListenerHandle {
    return eventbus.on("messageReceived", callback)
  }

  public async sendMessage(to: Contact | DID, message: DIDCommMessage) {
    const contact: Contact =
      typeof to == "string" ? ContactService.getContact(to) : to
    const internalMessage = {
      sender: this.profile.label,
      receiver: contact.label || contact.did,
      timestamp: new Date(),
      type: message.type,
      content: message.body?.content ?? "",
      raw: message,
    }
    this.postMessage({
      type: "sendMessage",
      payload: { to: contact.did, message },
    })
    if(message.type == "https://didcomm.org/basicmessage/2.0/message") {
      internalMessage.type = "https://developer.wyvrn.app/protocols/groupmessage/1.0/message";
      internalMessage.raw = {
        ...message,
        type: "https://developer.wyvrn.app/protocols/groupmessage/1.0/message",
        body: {
          author: this.profile.label,
          timestamp: Date.now() / 1000,
          content: message.body.content,
        }
      }
    }
    internalMessage.raw.from = this.profile.did
    ContactService.addMessage(contact.did, internalMessage)
    const transaction = this.db.transaction(["messages"], "readwrite");
    const objectStore = transaction.objectStore("messages")
    const request = objectStore.put({contact_did: contact.did, messages: ContactService.getMessageHistory(contact.did)});
    request.onsuccess = (event) => {
      // event.target.result === customer.ssn;
    };
  }

  public async refreshMessages() {
    this.postMessage({
      type: "pickupStatus",
      payload: { mediatorDid: DEFAULT_MEDIATOR },
    })
  }

  public async sendProfile(contact: Contact) {
    const message = {
      type: "https://didcomm.org/user-profile/1.0/profile",
      body: {
        profile: {
          displayName: this.profile.label,
        },
      },
    }
    await this.sendMessage(contact, message as IMessage)
  }

  public async requestProfile(contact: Contact) {
    const message = {
      type: "https://didcomm.org/user-profile/1.0/request-profile",
      body: {
        query: ["displayName"],
      },
    }
    await this.sendMessage(contact, message as IMessage)
  }

  async onProfileUpdate(message: AgentMessage) {
    let contact = ContactService.getContact(message.message.from)
    if (!contact) {
      return
    }

    let label = message.message.body?.profile?.displayName
    if (!label) {
      return
    }

    contact.label = label
    ContactService.addContact(contact)
    const transaction = this.db.transaction(["contacts"], "readwrite");
    const objectStore = transaction.objectStore("contacts")
    ContactService.getContacts().forEach((contact) => {
      const request = objectStore.put(contact);
      request.onsuccess = (event) => {
        // event.target.result === customer.ssn;
      };
    });
  }

  async onProfileRequest(message: AgentMessage) {
    let contact = ContactService.getContact(message.message.from)
		console.log("OnProfileRequest1:", contact);
    if (!contact) {
      return
    }
		console.log("OnProfileRequest2:", contact);
    await this.sendProfile(contact)
  }

  public async sendFeatureDiscovery(contact: Contact) {
    const message = {
      type: "https://didcomm.org/discover-features/2.0/queries",
      body: {
        queries: [
          {
            "feature-type": "protocol",
            match: "https://didcomm.org/*",
          },
        ],
      },
    }
    await this.sendMessage(contact, message as IMessage)
  }

  public async connect() {
    this.worker.postMessage({
      type: "connect",
      payload: { mediatorDid: DEFAULT_MEDIATOR },
    })
  }

  set onconnect(callback: () => void) {
    eventbus.on("connected", callback)
  }

  public async disconnect() {
    this.worker.postMessage({ type: "disconnect" })
  }

  set ondisconnect(callback: () => void) {
    eventbus.on("disconnected", callback)
  }
}

export default Agent
