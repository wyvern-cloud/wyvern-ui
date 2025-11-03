import { eventBus } from "../../utils/eventBus";

class BasicMessageHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/basicmessage/2.0";
    public goalCodes: string[] = ["org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/basicmessage/2.0/message":
                console.log("Basic message received:", messageEvent);
                eventBus.emit("DIDCOMM::PROTOCOL::BASICMESSAGE::MESSAGE", messageEvent);
                break;
        }
    }
}
export default BasicMessageHandler;