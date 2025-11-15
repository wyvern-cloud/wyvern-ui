
class MessagePickupHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/message-pickup/3.0";
    public goalCodes: string[] = ["org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/messagepickup/3.0/delivery":
                console.log("Message pickup response received:", messageEvent);
                break;
        }
    }
}
export default MessagePickupHandler;