
class DiscoverFeaturesHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/discover-features/2.0";
    public goalCodes: string[] = ["app.wyvrn", "org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        const message = messageEvent;
        const PROTOCOLS = this.agent.router.protocols as Map<string, ProtocolHandler>;
        switch (uri) {
            case "https://didcomm.org/discover-features/2.0/queries":
                
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

                    const match = createRegex(query["match"])
                    for (let protocol of Array.from(PROTOCOLS.values())) {
                        console.log("Testing protocol:", match, match.test(protocol.routeName), protocol.routeName);
                        if (match.test(protocol.routeName)) {
                            protocolResponse.push({
                                "feature-type": "protocol",
                                id: protocol.routeName,
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
                this.agent.sendMessage(message.from, response);
                break;
        }
    }
}
export default DiscoverFeaturesHandler;