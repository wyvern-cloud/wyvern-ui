
class TrustPingHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/trust-ping/2.0";
    public goalCodes: string[] = ["app.wyvrn", "org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/trust-ping/2.0/ping":
                if (messageEvent.body?.response_requested !== false) {
                    this.agent.sendMessage(messageEvent.from, {
                        type: "https://didcomm.org/trust-ping/2.0/ping-response",
                        thid: messageEvent.id,
                    });
                }
                break;
        }
    }
}
export default TrustPingHandler;