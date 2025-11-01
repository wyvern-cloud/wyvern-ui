
interface ProtocolHandler {
    agent: any;
    public routeName: string;
    public goalCodes: string[];
    public async handle(uri: string, messageEvent: any): Promise<void> | void;
}