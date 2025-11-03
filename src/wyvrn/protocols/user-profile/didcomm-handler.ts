
import { eventBus } from '../../utils/eventBus';
import { ConnectionService, ConnectionType, ConnectionStatus } from "../../connections";
class UserProfileHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/user-profile/1.0";
    public goalCodes: string[] = ["org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/user-profile/1.0/request-profile":
                // body > query > [displayName, pic, etc], if not specified, send whole profile
                console.log("User profile request received:", messageEvent);
                this.agent.handle_profile(messageEvent.from)
                break;
            case "https://didcomm.org/user-profile/1.0/profile":
                const msg = messageEvent;
                const peer = {
                    did: msg.from,
                    username: msg.body?.profile?.displayName,
                    displayname: msg.body?.profile?.displayName,
                    description: msg.body?.profile?.description,
                    pfp: msg.body?.profile?.displayPicture,
                };

                this.agent.peers[msg.from] = peer;
                this.agent.savePeerToDatabase(peer); // Save peer to the database
                console.log("NEW PEER", this.agent.peers)
                eventBus.emit("DIDCOMM::PROTOCOL::USER_PROFILE::PROFILE_UPDATE", peer);
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
}
export default UserProfileHandler;