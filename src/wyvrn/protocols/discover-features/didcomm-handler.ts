
class DiscoverFeaturesHandler implements ProtocolHandler {
    async handle(uri: string, messageEvent: any): Promise<void> {
        const message = messageEvent;
        const IMPLEMENTED_PROTOCOLS = [
            "https://didcomm.org/trust-ping/2.0",
            "https://didcomm.org/discover-features/2.0",
        ];
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
                this.agent.sendMessage(message.from, response);
                break;
        }
    }
}
export default DiscoverFeaturesHandler;