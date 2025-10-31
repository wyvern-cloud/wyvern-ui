import { v4 as uuidv4 } from 'uuid';
import { eventBus } from './utils/eventBus';
import logger from "./worker/logger"
import { ConnectionService, ConnectionType, ConnectionStatus } from "./connections";
import { WebRTCManager } from './webrtcManager';
import { GLOBAL_PREFIX } from './utils/constants';

/*
 * RELAY_DID = 'did:web:dev.cloudmediator.indiciotech.io'
 * RELAY_DID = 'did:web:us-east.public.mediator.indiciotech.io'
 */
const DEFAULT_MEDIATOR = 'did:web:dev.cloudmediator.indiciotech.io';

const IMPLEMENTED_PROTOCOLS = [
  "https://didcomm.org/discover-features/2.0",
  "https://didcomm.org/trust-ping/2.0",
  "https://didcomm.org/basicmessage/2.0",
  "https://didcomm.org/user-profile/1.0",
  "https://developer.wyvrn.app/protocols/groupmessage/1.0",
  "https://didcomm.org/webrtc-negotiation/1.0",
]

export class WyvrnAgent {
	private my_did: string;
	private worker: Worker;
	private connectionService: ConnectionService;
	private peers = {};
  private webrtcManager: WebRTCManager;

	constructor() {
		this.connectionService = new ConnectionService();
    this.webrtcManager = new WebRTCManager(this.handleSignalingMessage.bind(this));

    // Handle remote call termination
    this.webrtcManager.onCallStateChange = ({ did, connectionId, active }) => {
      if (!active) {
        console.log(`Call with DID ${did} and connection ID ${connectionId} has ended.`);
      }
    };
	}
	public initWorker() {
		this.worker = new Worker(
			/* webpackChunkName: "didcomm-worker" */ new URL(
				"./worker/worker.ts",
				import.meta.url
			),
			{ type: "module" }
		);

		// Handle incoming messages from the worker
		const me = this;
		this.worker.onmessage = function(event) {
			const { type, payload } = event.data;

			console.log("WYVRN-DEBUG", event.data);
			me.handleMessage(type, payload);
		};
	}

	public waitForStartup() {
		let agent = this;
		function wait(resolve) {
			if (agent.my_did && agent.my_did.length > 4)
				resolve(agent.my_did);
			else
				setTimeout(wait, 1000, resolve);
		}
		return new Promise((resolve) => {
			wait(resolve);
		})
	}
	public getMyDID() {
		return this.my_did;
	}
	public send_request(did) {
		const message = {
			"id": uuidv4(),
			"type": "https://didcomm.org/user-profile/1.0/profile",
			"body": {
				"profile": {
					"displayName": "Wyvrn Alpha",
					"displayPicture": "#item1",
					"description": "This is my bio",
				},
				"send_back_yours": true,
			},
			"attachments": [{
				"id": "item1",
				"byte_count": 1386,
				"media_type": "image/png",
				"filename": "image1.png",
				"data": {
					"base64": "iVBORw0KGgoAAAANSUhEUgAAAFgAAAAfCAYAAABjyArgAAAAAXNSR0IArs4c6QAABSRJREFUaIHtWkFrG0cU/jargG8B+dJDLAsi0xLTQh2pcjABX0LSU6gvvTdqcH6ECcU/wiZRc8kppTTkFIdeDMGNhVQVCgoF6SDZhfZiQeklYG+mB/mN38y+2Z0VCnHjfGBYz7yZefPN997MzipQSuEY+uEDJoIAAHLH/6ggCN6hL+8f1Ei5QaCU0uQyNZ9p+IrNxRfnM5dmfJZAxMwudjLZ29wppXRdLtbqjCIIAm9iCWQfBIFbzZQibAMpTN4Hlbd6kfF/uRTG5ppG9GB3PmY72J03+CFODQW3epEeUBqEGklOnmbY/nLQXIm02cUO+i8vJ/ZXvNoxSE6CVnCze5RILoFWyuX0aSGbq9Llb2Uup+eaRqoLxauv9DORTjk4pmAJfGV9wCfyrsi2ReKKPGB8Ynl7IpnnZMI5epDUS2pVSmGwO5+qXglBEHgde8iO/2VFFr8qczlxT5H8SPPLXiTOoVPBNpnkjEuhrs3D3mnJjrdNy/kSJDJ9UlxlLmfMh8Yh+Gzkkj1XMof3MS1p9816uvBtO7vYSQzvLJDOuOP6Ly2OUkokOfM5mJRn7762DVcSjwZJ2dyOQGW+JKep1y7n0THu4pVLoe6D+uu/vGwo3JtgTqzkcLkUpjq6uR2iXkoep9k9AmDu8OMoOW1zpnFavQgL5xtefdpo9aqaF35y4PAimIe07TBNngYB4qpUSqFWB+o1uY7KZhc7qMzl0Oweodk9Mkj28Y/3ay/UYHde1//46GMtCCI3LC7p/qL+TmwMXk82C+cbIskcqQQnhR457fPK6AsimZ4lfwB3WHNypboRzPqwuISLX/wOANhvfIo3g19ibXk9MJqrRLKNTDnYzpH2GxCpOYt6a3UYKqa+bPBIAeIbDW9LC2QTPYnNMg0UeQT9ZE+U5z07v9hhYBOUFRLJQDyP+p4AyM6VYmy1Rf0dhMXPAABvBvH0AACDH/5FWFwCTV1KIxLOJVXa+bVWd9vSy0hW9RKIZNdFCv3xOjtiuC1vb8+FxuOI+juppJFNKrn5Nf1opAiXkiSHfFGv+du60gW/qUq6s/W1GxevD/YwNV0wytqH7vwLCDk4KVVkga2YJPUmjS/VAXEC7X6lE40PXh/sedtyv1xC8trkXGTZg/hsVj5IWmQ+maT+kyZN2NwOsbpcjZ2DD//4PGb716s9FFYOjLL2YRWb2+Z1QaX6nWEjEjwuWUnqA9LVOy7G6bdek9Pe1HQB+OQ37P00bZQXVg6M9KBTwzawuhwBYGliuK4fnQrmZAFxgvndp7RZub6IpJHwfGMLADCz4VZx2obpAn+RKZdCrC5HuPT3Q7Q/+sZQ8dR0AYUVM1VI5LZ6EVaXk69lYwTTBPkkAfloBgAzV0b2N+7e1HU8V3IkkcDHnRTSIgoA8rf2MXz6EP8AuDBzckqxNzNC+7AK4CQdNBv3TIPhOm4/UPj+W+ujp2uCRKBNGJXb7YnoSaSBmStbRjQopZxlHHyxk1AuhWg27iF/nDeHT4H8tTsAzHMuvSYPX9zHJXSQv7UPDNfR7B7p+5VWL0JlLofbD8a4i6DJ+uD5xpb3BHmbpHHtaJHKpP5u3L0ZS1m0IE8eXz8J7eE6kF9D/todI2KHL+7HypBfM8llG+nFhWcxX/Q3OalyEkgj+22kBgn7v478oAXhBJP6pC/rUplNbqsX4auvfzbs/mx/OVpY/suet0XyacWTx9f1c5bvh/Z9hkQuAE0w8OG3aRPHMa9BwELg//+rktOFAAD+A6SeyxzbazMZAAAAAElFTkSuQmCC"
				},
			}]
		}
    this.postMessage({
      type: "sendMessage",
      payload: { to: did, message },
    })
    // if(message.type == "https://didcomm.org/basicmessage/2.0/message") {
    //   if(message.body.content.startsWith("/"))
    //     return;
    //   internalMessage.type = "https://developer.wyvrn.app/protocols/groupmessage/1.0/message";
    //   internalMessage.raw = {
    //     ...message,
    //     type: "https://developer.wyvrn.app/protocols/groupmessage/1.0/message",
    //     body: {
    //       author: this.profile.label,
    //       timestamp: Date.now() / 1000,
    //       content: message.body.content,
    //     }
    //   }
    // }
    // internalMessage.raw.from = this.profile.did
    // ContactService.addMessage(contact.did, internalMessage)
    // const transaction = this.db.transaction(["messages"], "readwrite");
    // const objectStore = transaction.objectStore("messages")
    // const request = objectStore.put({contact_did: contact.did, messages: ContactService.getMessageHistory(contact.did)});
    // request.onsuccess = (event) => {
    //   // event.target.result === customer.ssn;
    // };
  
  }
	public sendMessage(did, message) {
    this.postMessage({
      type: "sendMessage",
      payload: { to: did, message },
    })
	}

  public startVoiceCall(did: string) {
    const message = {
      id: uuidv4(),
      type: 'https://didcomm.org/webrtc-negotiation/1.0/request',
      body: {
        capabilities: {
          audio: true,
          video: false,
          screen_share: false,
          data_channel: false,
        },
        connection_id: uuidv4(),
        description: 'Voice call request',
      },
    };
    this.sendMessage(did, message);
  }

  public endVoiceCall(did: string, connectionId: string) {
    const message = {
      id: uuidv4(),
      type: 'https://didcomm.org/webrtc-negotiation/1.0/terminate',
      body: {
        reason: 'Call ended by user',
        connection_id: connectionId,
      },
    };
    this.sendMessage(did, message);
  }

	private postMessage<T>(message: WorkerCommand<T>) {
    console.log("Agent->DIDCommWorker: ", message)
    this.worker.postMessage(message)
  }
	private checkExistingSecrets(): boolean {
    const did = localStorage.getItem(`${GLOBAL_PREFIX}did`);
    const mediatedDid = localStorage.getItem(`${GLOBAL_PREFIX}relayed-did`);
    const secrets = localStorage.getItem(`${GLOBAL_PREFIX}secrets`);
    if (!did) return false;
    this.postMessage({
      type: "establishSecrets",
      payload: {
        did: did,
        mediatedDid: mediatedDid,
        savedSecrets: JSON.parse(secrets),
      },
    });
    this.onDidGenerated(mediatedDid);
    return true;
  }

  private setSecretsFromLocalStorage({did, mediatedDid, secrets}): void {
    localStorage.setItem(`${GLOBAL_PREFIX}did`, did);
    localStorage.setItem(`${GLOBAL_PREFIX}relayed-did`, mediatedDid);
    localStorage.setItem(`${GLOBAL_PREFIX}secrets`, JSON.stringify(Object.values(secrets)));
  }

  public DEVELOPER_clearDataBase() {
    const request = indexedDB.deleteDatabase(`${GLOBAL_PREFIX}MyTestDatabase`);
    localStorage.removeItem(`${GLOBAL_PREFIX}did`);
    localStorage.removeItem(`${GLOBAL_PREFIX}relayed-did`);
    localStorage.removeItem(`${GLOBAL_PREFIX}secrets`);
    localStorage.removeItem(`${GLOBAL_PREFIX}profile`);
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

	public async sendFeatureDiscovery(contact: string) {
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
    await this.sendMessage(contact, message)
  }

	public handle_profile(did) {
		const message = {
			"id": uuidv4(),
			"type": "https://didcomm.org/user-profile/1.0/profile",
			"body": {
				"profile": {
					"displayName": "Wyvrn Alpha",
					"displayPicture": "#item1",
					"description": "This is my bio",
				},
				"send_back_yours": true,
			},
			"attachments": [{
				"id": "item1",
				"byte_count": 1386,
				"media_type": "image/png",
				"filename": "image1.png",
				"data": {
					"base64": "iVBORw0KGgoAAAANSUhEUgAAAFgAAAAfCAYAAABjyArgAAAAAXNSR0IArs4c6QAABSRJREFUaIHtWkFrG0cU/jargG8B+dJDLAsi0xLTQh2pcjABX0LSU6gvvTdqcH6ECcU/wiZRc8kppTTkFIdeDMGNhVQVCgoF6SDZhfZiQeklYG+mB/mN38y+2Z0VCnHjfGBYz7yZefPN997MzipQSuEY+uEDJoIAAHLH/6ggCN6hL+8f1Ei5QaCU0uQyNZ9p+IrNxRfnM5dmfJZAxMwudjLZ29wppXRdLtbqjCIIAm9iCWQfBIFbzZQibAMpTN4Hlbd6kfF/uRTG5ppG9GB3PmY72J03+CFODQW3epEeUBqEGklOnmbY/nLQXIm02cUO+i8vJ/ZXvNoxSE6CVnCze5RILoFWyuX0aSGbq9Llb2Uup+eaRqoLxauv9DORTjk4pmAJfGV9wCfyrsi2ReKKPGB8Ynl7IpnnZMI5epDUS2pVSmGwO5+qXglBEHgde8iO/2VFFr8qczlxT5H8SPPLXiTOoVPBNpnkjEuhrs3D3mnJjrdNy/kSJDJ9UlxlLmfMh8Yh+Gzkkj1XMof3MS1p9816uvBtO7vYSQzvLJDOuOP6Ly2OUkokOfM5mJRn7762DVcSjwZJ2dyOQGW+JKep1y7n0THu4pVLoe6D+uu/vGwo3JtgTqzkcLkUpjq6uR2iXkoep9k9AmDu8OMoOW1zpnFavQgL5xtefdpo9aqaF35y4PAimIe07TBNngYB4qpUSqFWB+o1uY7KZhc7qMzl0Oweodk9Mkj28Y/3ay/UYHde1//46GMtCCI3LC7p/qL+TmwMXk82C+cbIskcqQQnhR457fPK6AsimZ4lfwB3WHNypboRzPqwuISLX/wOANhvfIo3g19ibXk9MJqrRLKNTDnYzpH2GxCpOYt6a3UYKqa+bPBIAeIbDW9LC2QTPYnNMg0UeQT9ZE+U5z07v9hhYBOUFRLJQDyP+p4AyM6VYmy1Rf0dhMXPAABvBvH0AACDH/5FWFwCTV1KIxLOJVXa+bVWd9vSy0hW9RKIZNdFCv3xOjtiuC1vb8+FxuOI+juppJFNKrn5Nf1opAiXkiSHfFGv+du60gW/qUq6s/W1GxevD/YwNV0wytqH7vwLCDk4KVVkga2YJPUmjS/VAXEC7X6lE40PXh/sedtyv1xC8trkXGTZg/hsVj5IWmQ+maT+kyZN2NwOsbpcjZ2DD//4PGb716s9FFYOjLL2YRWb2+Z1QaX6nWEjEjwuWUnqA9LVOy7G6bdek9Pe1HQB+OQ37P00bZQXVg6M9KBTwzawuhwBYGliuK4fnQrmZAFxgvndp7RZub6IpJHwfGMLADCz4VZx2obpAn+RKZdCrC5HuPT3Q7Q/+sZQ8dR0AYUVM1VI5LZ6EVaXk69lYwTTBPkkAfloBgAzV0b2N+7e1HU8V3IkkcDHnRTSIgoA8rf2MXz6EP8AuDBzckqxNzNC+7AK4CQdNBv3TIPhOm4/UPj+W+ujp2uCRKBNGJXb7YnoSaSBmStbRjQopZxlHHyxk1AuhWg27iF/nDeHT4H8tTsAzHMuvSYPX9zHJXSQv7UPDNfR7B7p+5VWL0JlLofbD8a4i6DJ+uD5xpb3BHmbpHHtaJHKpP5u3L0ZS1m0IE8eXz8J7eE6kF9D/todI2KHL+7HypBfM8llG+nFhWcxX/Q3OalyEkgj+22kBgn7v478oAXhBJP6pC/rUplNbqsX4auvfzbs/mx/OVpY/suet0XyacWTx9f1c5bvh/Z9hkQuAE0w8OG3aRPHMa9BwELg//+rktOFAAD+A6SeyxzbazMZAAAAAElFTkSuQmCC"
				},
			}]
		}
    this.postMessage({
      type: "sendMessage",
      payload: { to: did, message },
    })
	}

	private handleCoreProtocolMessage(msg) {
		switch(msg.type) {
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
			case "https://didcomm.org/user-profile/1.0/request-profile":
				// body > query > [displayName, pic, etc], if not specified, send whole profile
				break
			case "https://didcomm.org/user-profile/1.0/profile":
				let pfp;
				let pfp_name = msg.body?.profile?.displayPicture;
				if (pfp_name && pfp_name.startsWith('#')) {
					let img_mime, img_data;
					let pfp_name_2 = pfp_name.slice(1)
					for (const attachment of msg.attachments) {
						if (attachment.id === pfp_name_2) {
							img_mime = attachment.media_type;
							img_data = attachment.data?.base64;
						}
					}
					if (img_data)
						pfp = `data:${img_mime};base64,${img_data}`
				}
				else
					pfp = pfp_name;
				this.peers[msg.from] = {
					did: msg.from,
					username: msg.body?.profile?.displayName,
					displayname: msg.body?.profile?.displayName,
					description: msg.body?.profile?.description,
					pfp,
				}
				console.log("NEW PEER", this.peers)
    // ContactService.addMessage(contact.did, internalMessage)
    // const transaction = this.db.transaction(["messages"], "readwrite");
    // const objectStore = transaction.objectStore("messages")
    // const request = objectStore.put({contact_did: contact.did, messages: ContactService.getMessageHistory(contact.did)});
    // request.onsuccess = (event) => {
    //   // event.target.result === customer.ssn;
    // };
				// this.connectionService.addConnection({
				// 	did: msg.from,
				// 	connectionType: ConnectionType.Peer,
				// 	status: ConnectionStatus.Pending,
				// 	displayName: msg.body?.profile?.displayName,
				// 	icon: pfp,
				// 	description: msg.body?.profile?.description,
				// });
				/*
				ContactService.addContact(frm);
				const transaction = this.db.transaction(["contacts"], "readwrite");
				const objectStore = transaction.objectStore("contacts")
				if(to.did != did && to.did != mediatedDid)
					ContactService.getContacts().forEach((contact) => {
						const request = objectStore.put(contact);
						request.onsuccess = (event) => {
							// event.target.result === customer.ssn;
						};
					});
				// */

				break
      case 'https://didcomm.org/webrtc-negotiation/1.0/offer':
        this.webrtcManager.handleOffer(msg, { type: 'offer', sdp: msg.body.sdp }, msg.from, msg.body.connection_id);
        break;
      case 'https://didcomm.org/webrtc-negotiation/1.0/answer':
        this.webrtcManager.handleAnswer(msg, { type: 'answer', sdp: msg.body.sdp });
        break;
      case 'https://didcomm.org/webrtc-negotiation/1.0/candidate':
        this.webrtcManager.handleCandidate(msg, msg.body.candidate);
        break;
      case 'https://didcomm.org/webrtc-negotiation/1.0/terminate':
        this.webrtcManager.endCall();
        break;
      case 'https://didcomm.org/webrtc-negotiation/1.0/request':
        const { capabilities, connection_id } = msg.body;
        if (capabilities.audio) {
          this.webrtcManager.startCall(msg.from).then((connectionId) => {
            if (false && connectionId) {
              const localDescription = this.webrtcManager.getPeerConnection().localDescription;
              if (localDescription) {
                this.sendMessage(msg.from, {
                  id: uuidv4(),
                  type: 'https://didcomm.org/webrtc-negotiation/1.0/offer',
                  thid: msg.id,
                  body: {
                    sdp: localDescription.sdp,
                    connection_id: connectionId,
                  },
                });
              }
            }
          });
        } else {
          this.sendMessage(msg.from, {
            id: uuidv4(),
            type: 'https://didcomm.org/webrtc-negotiation/1.0/decline',
            thid: msg.id,
            body: {
              reason: 'Audio capability not supported',
              connection_id,
            },
          });
        }
        break;
		}
	}

  private handleSignalingMessage(message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'offer':
        this.sendMessage(message.to, {
          id: uuidv4(),
          type: 'https://didcomm.org/webrtc-negotiation/1.0/offer',
          body: {
            sdp: message.sdp,
            connection_id: message.connectionId,
          },
        });
        break;
      case 'answer':
        this.sendMessage(message.to, {
          id: uuidv4(),
          type: 'https://didcomm.org/webrtc-negotiation/1.0/answer',
          body: {
            sdp: message.sdp,
            connection_id: message.connectionId,
          },
        });
        break;
      case 'candidate':
        this.sendMessage(message.to, {
          id: uuidv4(),
          type: 'https://didcomm.org/webrtc-negotiation/1.0/candidate',
          body: {
            candidate: message.candidate,
            mid: message.mid,
            connection_id: message.connectionId,
          },
        });
        break;
      case 'terminate':
        this.sendMessage(message.to, {
          id: uuidv4(),
          type: 'https://didcomm.org/webrtc-negotiation/1.0/terminate',
          body: {
            reason: message.reason,
            connection_id: message.connectionId,
          },
        });
        break;
      default:
        console.warn('Unknown signaling message type:', type);
    }
  }

	private handleMessage(type, payload) {
		let eventName;
		switch (type) {
			case 'init':
				const request = indexedDB.open(`${GLOBAL_PREFIX}MyTestDatabase`, 1);
        request.onerror = (event) => {
          console.error("Why didn't you allow my web app to use IndexedDB?!");
          console.error(`Database error: ${event.target.errorCode}`);
        };
        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.db.transaction("contacts").objectStore("contacts").getAll().onsuccess = (event) => {
            event.target.result.forEach(contact => {
              ContactService.addContact(contact);
            });
            this.db.transaction("messages").objectStore("messages").getAll().onsuccess = (event) => {
              event.target.result.forEach(message => {
                let did = message.contact_did;
                ContactService.saveMessageHistory(did, message.messages);
              });
            };
          };
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          this.contactStore = db.createObjectStore("contacts", { keyPath: "did" });
          this.messageStore = db.createObjectStore("messages", { keyPath: "contact_did" });
        };

        if (this.checkExistingSecrets()) break;
				this.worker.postMessage({
					type: 'establishMediation',
					payload: { mediatorDid: DEFAULT_MEDIATOR },
				});
				break;
			case 'messageReceived':
				// Determine the event name based on message type
				console.log("AGENT-DBG", type, payload);
				this.handleCoreProtocolMessage(payload);
				if (type === 'p2p') {
					eventName = `message:p2p:${message.to}`; // Unique per peer
				} else if (type === 'server') {
					eventName = `message:server:${message.channel}`; // Unique per channel
				}

				// Emit the message to subscribed components
				if (eventName) {
					eventBus.emit(eventName, message);
				}
				break;
			case 'didSecrets':
				this.setSecretsFromLocalStorage(payload);
				break;
			case 'didGenerated':
				this.onDidGenerated(payload);
				this.postMessage({
					type: 'getDidSecrets',
					payload: {},
				});
				break;
			case 'log':
				console.log(payload.message, payload.data);
				break;
			default:
				console.log("UNKNOWN MESSAGE FROM WORKER", type, payload);
		}
	}
	private onDidGenerated(did: string) {
    logger.log("DID Generated:", did)
    //eventbus.emit("didGenerated", did)

		this.my_did = did;
    this.postMessage({
      type: "connect",
      payload: { mediatorDid: DEFAULT_MEDIATOR },
    })
  }
	// public getServers() {
	public getPeers() {
		return this.peers;
		return {
			"neo" : {
				"username": "neo",
				"did": "did:example:neo",
				"displayname": "NeoSaki",
				"pfp": "https://pbs.twimg.com/profile_images/1802351709911453696/AXkramb8_400x400.jpg",
			},
			"nori" : {
				"username": "nori",
				"did": "did:example:chiori",
				"displayname": "Chiori Nouveau",
				"pfp": "https://pbs.twimg.com/profile_images/1421605654863745028/OMl5gZ5P_400x400.jpg",
			},
		};
	}
}

export default (() => {console.log("creating agent"); return new WyvrnAgent();})();
