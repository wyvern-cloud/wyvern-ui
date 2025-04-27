import m from "mithril";
import styles from "../../server-list.module.css";
import ChatArea from "./ChatArea";
import MessageInput from "./MessageInput";
import w from "../../agent";

const ChatContainer = {
  oninit: function(vnode) {
    vnode.state.callActive = false;
    vnode.state.connectionId = null;
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
                state.callActive = false;
                state.connectionId = null;
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
