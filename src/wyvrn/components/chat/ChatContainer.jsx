import m from "mithril";
import styles from "../../server-list.module.css";
import ChatArea from "./ChatArea";
import MessageInput from "./MessageInput";

const ChatContainer = {
  view: () => (
    <div class={styles.chatBox}>
      <ChatArea />
      <MessageInput />
    </div>
  )
};

export default ChatContainer;
