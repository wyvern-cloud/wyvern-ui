// import { DidCommHandler } from './didcomm/didcomm-handler';
// import { OtherHandler } from './otherProtocol/other-handler';
import { ProtocolHandler } from './interface';

// /home/frosty/tmp/wyvern/web/src/wyvrn/protocols/router.ts


class Router {
    private protocols: Map<string, ProtocolHandler> = new Map();

    constructor(agent: any) {
        // Optionally initialize with default protocols
        // this.register('didcomm', new DidCommHandler(agent));
        this.agent = agent;
    }

    register(protocolName: string, handler: ProtocolHandler): void {
        this.protocols.set(protocolName, handler);
    }

    async route(uri: string, messageEvent: any): Promise<void> {
        // Split the URI from the right to get the last 3 segments: protocol, version, method
        const segments = uri.split('/').slice(-3);
        if (segments.length < 3) {
            throw new Error('Invalid URI format: insufficient segments');
        }
        const [protocolName, version, method] = segments;
        if (!/^\d+\.\d+$/.test(version)) {
            throw new Error('Invalid URI format: version not found or invalid');
        }
        const handler = this.protocols.get(protocolName);
        if (!handler) {
            throw new Error(`No handler registered for protocol: ${protocolName}`);
        }
        await handler.handle(uri, messageEvent);
    }
}

// Example of loading protocols from subfolders
// Assuming subfolders like ./didcomm/, ./otherProtocol/
// You can import them statically or dynamically

// Static imports (ensure they are loaded at module load time)

// Register them
// const router = new Router();
// router.register('didcomm', new DidCommHandler());
// router.register('other', new OtherHandler());

async function loadProtocol(router: Router, protocolName: string): Promise<ProtocolHandler> {
  const protocolModule = await import(`./${protocolName}/didcomm-handler`);
//   router.register(protocolName, new protocolModule[`${protocolName.charAt(0).toUpperCase() + protocolName.slice(1)}Handler`]());
  const handlerInstance = new protocolModule.default();
  handlerInstance.agent = router.agent; // Assign the agent object here
  router.register(protocolName, handlerInstance);
}

// For dynamic loading, you could use import() in an async function
async function loadProtocols(router: Router) {
  await loadProtocol(router, 'trust-ping');
  await loadProtocol(router, 'discover-features');
  await loadProtocol(router, 'messagepickup');
  await loadProtocol(router, 'user-profile');
  await loadProtocol(router, 'basicmessage');
}

export { Router, loadProtocols };