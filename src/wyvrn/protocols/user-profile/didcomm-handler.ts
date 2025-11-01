
class UserProfileHandler implements ProtocolHandler {
    public routeName: string = "https://didcomm.org/user-profile/1.0";
    public goalCodes: string[] = ["org.didcomm"];
    public async handle(uri: string, messageEvent: any): Promise<void> {
        switch (uri) {
            case "https://didcomm.org/user-profile/1.0/request-profile":
                console.log("User profile request received:", messageEvent);
                this.agent.handle_profile(messageEvent.from)
                break;
        }
    }
}
export default UserProfileHandler;