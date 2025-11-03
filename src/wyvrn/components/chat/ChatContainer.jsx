import m from "mithril";
import styles from "../../server-list.module.css";
import ChatArea from "./ChatArea";
import MessageInput from "./MessageInput";
import w from "../../agent";
import { agentService } from "../../services/agentService";
import { eventBus } from "../../utils/eventBus";

const ChatContainer = {
  oninit: function(vnode) {
    vnode.state.callActive = false;
    vnode.state.connectionId = null;

    // Listen for call state changes
    w.webrtcManager.onCallStateChange = ({ did, connectionId, active }) => {
      if (did === vnode.attrs.did) {
        vnode.state.callActive = active;
        vnode.state.connectionId = active ? connectionId : null;
        m.redraw(); // Trigger re-render
      }
    };
  },
  view: ({ attrs, state }) => {
    const { did } = attrs;
    const activeCall = w.webrtcManager.getActiveCall();

    const isCallActiveForCurrentDid = activeCall && activeCall.did === did;
    const peer = w.getPeers()[did];
    const truncated_did = did && did.length > 10 ? `${did.slice(0, 10)}...` : did;

    const sendMessage = async (message) => {
      // Implement your message sending logic here
      const msg = {
        type: "https://didcomm.org/basicmessage/2.0/message",
        body: {
          content: message
        },
        to: [did],
        from: w.getMyDID(),
      }
      agentService.processMessage(msg);
      w.sendMessage(did, msg);
      eventBus.emit("WYVRN::MESSAGE_SENT", msg);
      return true; // Return true if successful, false otherwise
    };

    return (
      <div class={styles.chatBox}>
        <h2>Chat with {peer ? peer.displayname : truncated_did}</h2>
        <input
          type="text"
          placeholder="MISSING DID"
          value={did}
          readonly
          onfocus={(e) => {
            e.target.select();
          }}
          />
        {did && (
          <button
            class={styles.callButton}
            onclick={() => {
              if (isCallActiveForCurrentDid) {
                w.endVoiceCall(did, activeCall.connectionId);
              } else {
                const connectionId = w.startVoiceCall(did);
                state.callActive = true;
                state.connectionId = connectionId;
              }
            }}
          >
            {isCallActiveForCurrentDid ? "End Call" : "Call"}
          </button>
        )}
        <ChatArea did={did} />
        <MessageInput sendMessage={sendMessage} />
      </div>
    );
  },
};

export default ChatContainer;
