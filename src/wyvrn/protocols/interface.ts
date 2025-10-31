
interface ProtocolHandler {
    agent: any;
    handle(uri: string, messageEvent: any): Promise<void> | void;
}