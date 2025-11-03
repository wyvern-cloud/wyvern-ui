import m from "mithril";
import styles from "../../server-list.module.css";
import { eventBus } from "../../utils/eventBus";
import { MessageServiceFactory, MessageServiceType } from "../../services/messageServiceFactory";
import { exampleService } from "../../services/exampleService";
import { agentService } from "../../services/agentService";
import MessageGroup from "./MessageGroup";
import { on } from "events";

const ChatArea = {
  oninit: (vnode) => {
    vnode.state.messages = [];
    vnode.state.service = MessageServiceFactory.getService();
    vnode.state.currentDID = vnode.attrs.did;
    vnode.state.domScroll = true;
    
    // Initial load of messages
    vnode.state.loadMessages = () => {
      const currentDID = vnode.state.currentDID;
      let messages = vnode.state.service.getMessages();
      messages = messages.filter(msg => msg.to.includes(currentDID) || msg.from === currentDID);
      vnode.state.messages = messages;
      m.redraw();
    };
    
    // Load initial messages
    vnode.state.loadMessages();
    
    // Listen for message service changes
    vnode.state.serviceListener = (e) => {
      vnode.state.service = e.detail.service;
      vnode.state.loadMessages();
    };
    
    window.addEventListener('message-service-changed', vnode.state.serviceListener);

    // Subscribe to demo messages
    eventBus.on("message:demo", (message) => {
      // Only add if using example service
      if (MessageServiceFactory.getCurrentType() === MessageServiceType.EXAMPLE) {
        vnode.state.messages.push(message);
        m.redraw();
      }
    });

    eventBus.on("DIDCOMM::AGENT::INITIALIZED", () => {
      vnode.state.loadMessages();
    });
    
    // Subscribe to agent messages
    eventBus.on("DIDCOMM::PROTOCOL::BASICMESSAGE::MESSAGE", async (message) => {
      // Only add if using agent service
      if (MessageServiceFactory.getCurrentType() === MessageServiceType.AGENT) {
        try {
          const processedMessage = await agentService.processMessage(message);
          vnode.state.service.refreshCache();
          // vnode.state.messages.push(processedMessage);
          vnode.state.loadMessages();
          // m.redraw();
        } catch (error) {
          console.error("Error processing message:", error);
        }
      }
    });
    eventBus.on("WYVRN::MESSAGE_SENT", async (message) => {
      if (MessageServiceFactory.getCurrentType() === MessageServiceType.AGENT) {
        // const processedMessage = await agentService.processMessage(message);
        await vnode.state.service.refreshCache();
        vnode.state.loadMessages();
        vnode.state.domScroll = true;
      }
    });
  },

  onupdate: (vnode) => {
    if (vnode.state.domScroll) {
      console.debug("Scrolling to bottom");
      vnode.state.domScroll = false;
      vnode.dom.scrollTo(0, vnode.dom.scrollHeight, 'instant');
    }
    if (vnode.attrs.did !== vnode.state.currentDID) {
      console.debug("Switching DID to", vnode.attrs.did);
      vnode.state.currentDID = vnode.attrs.did;
      vnode.state.domScroll = true;
      vnode.state.loadMessages();
    }
  },

  onremove: (vnode) => {
    window.removeEventListener('message-service-changed', vnode.state.serviceListener);
  },
  
  view: (vnode) => {
    let messageGroups = [];
    let lastUser = undefined;
    
    for (const message of vnode.state.messages) {
      let lastGroup = messageGroups.length && messageGroups[messageGroups.length - 1];
      if (message.username != lastUser || 
          (lastGroup && lastGroup[0].timestamp < (message.timestamp - 1000 * 60 * 5))) {
        messageGroups.push([]);
        lastUser = message.username;
      }
      messageGroups[messageGroups.length-1].push(message);
    }
    
    return (
      <div class={`${styles.blue} ${styles.chatArea}`} style="padding: 0.3rem">
        {messageGroups.map((item, index) => {
          let user = vnode.state.service.getUser(item[0].username) || { 
            username: item[0].username,
            displayname: item[0].displayname,
            pfp: `https://api.dicebear.com/7.x/personas/svg?seed=${item[0].username}`
          };
          
          return (
            <MessageGroup key={user.username} user={user} messages={item} />
          );
        })}
      </div>
    );
  }
};

export default ChatArea;
