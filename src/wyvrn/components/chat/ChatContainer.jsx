import m from "mithril";
import styles from "../../server-list.module.css";
import ChatArea from "./ChatArea";
import MessageInput from "./MessageInput";
import w from "../../agent";

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

    return (
      <div class={styles.chatBox}>
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
        <ChatArea />
        <MessageInput />
      </div>
    );
  },
};

export default ChatContainer;
