
import { eventBus } from '../../utils/eventBus';
import { ConnectionService, ConnectionType, ConnectionStatus } from "../../connections";
import { ProtocolHandler } from '../interface';
import { WyvrnAgent } from '@/wyvrn/agent';
import { v4 as uuidv4 } from 'uuid';

class UserProfileHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/user-profile/1.0";
    public goalCodes: string[] = ["org.didcomm"];
    public agent: WyvrnAgent;
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/user-profile/1.0/request-profile":
                // body > query > [displayName, pic, etc], if not specified, send whole profile
                console.log("User profile request received:", messageEvent);
                await this.send_profile(messageEvent.from, true);
                break;
            case "https://didcomm.org/user-profile/1.0/profile":
                const msg = messageEvent;
                console.warn("Received user profile:", msg);
                const pfp = this.getProfilePicture(msg);
                const peer = {
                    did: msg.from,
                    username: msg.body?.profile?.displayName,
                    displayname: msg.body?.profile?.displayName,
                    description: msg.body?.profile?.description,
                    pfp: pfp,
                };

                this.agent.peers[msg.from] = peer;
                this.agent.savePeerToDatabase(peer); // Save peer to the database
                console.log("NEW PEER", this.agent.peers)
                eventBus.emit("DIDCOMM::PROTOCOL::USER_PROFILE::PROFILE_UPDATE", peer);

                if (msg.body?.profile?.send_back_yours) {
                    await this.agent.send_profile(msg.from);
                }
                // this.agent.connectionService.addConnection({
                //     did: msg.from,
                //     connectionType: ConnectionType.Peer,
                //     status: ConnectionStatus.Pending,
                //     displayName: peer.displayname,
                //     icon: peer.pfp,
                //     description: peer.description,
                // });
                /*
                // ContactService.addMessage(contact.did, internalMessage)
                // const transaction = this.db.transaction(["messages"], "readwrite");
                // const objectStore = transaction.objectStore("messages")
                // const request = objectStore.put({contact_did: contact.did, messages: ContactService.getMessageHistory(contact.did)});
                // request.onsuccess = (event) => {
                //   // event.target.result === customer.ssn;
                // };
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
                break;
        }
    }

    private async send_profile(to: string, send_back_yours: boolean = false): Promise<void> {
        const pfp = this.agent.profile.displayPicture;
        const b64pfp = pfp.split(",")[1];
        const message = {
            "id": uuidv4(),
            "type": "https://didcomm.org/user-profile/1.0/profile",
            "body": {
                "profile": {
                    "displayName": this.agent.profile.displayName,
                    "displayPicture": "#item1",
                    "description": this.agent.profile.description,
                },
                "send_back_yours": send_back_yours,
            },
            "attachments": [{
                "id": "item1",
                "byte_count": 1386,
                "media_type": "image/png",
                "filename": "image1.png",
                "data": {
                    "base64": b64pfp
                },
            }]
        };
        // this.agent.handle_profile(messageEvent.from)
        this.agent.sendMessage(to, message);
    }

    private getProfilePicture(msg: any): string | undefined {
        const ident: string = msg.body?.profile?.displayPicture;
        let pfp: string | undefined = undefined;
        if (!ident)
            return undefined;

        const attachmentId = ident.split("#").pop();
        const attachments = msg.attachments || [];
        const attachment = attachments.find((att: any) => att.id === attachmentId);
        if (attachment) {
            // Convert base64 blob to data uri
            pfp = `data:${attachment.media_type};base64,${attachment.data.base64}`;
        }

        return pfp;
    }

}
export default UserProfileHandler;