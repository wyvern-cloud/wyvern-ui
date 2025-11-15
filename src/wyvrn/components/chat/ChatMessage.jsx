import m from "mithril";
import { MessageServiceFactory, MessageServiceType } from "../../services/messageServiceFactory";
import { exampleService } from "../../services/exampleService";

const ChatMessage = {
  view: (vnode) => {
    let msg = vnode.attrs.message;
    let user;
    
    // Get user from the appropriate service
    if (MessageServiceFactory.getCurrentType() === MessageServiceType.EXAMPLE) {
      user = exampleService.getUser(msg.username);
    } else {
      // Get user from agent service
      // user = agentService.getUser(msg.username);
    }
    
    return (
      <div>
        {msg?.message} <i style="font-size: 0.8em; color: lightgray;">{vnode.attrs.ts}</i>
      </div>
    );
  }
};

export default ChatMessage;
