import m from "mithril";
import styles from "../../server-list.module.css";
import w from "../../agent";

const submitOnEnter = async (e, sendMessage) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    await submitMessage(e, sendMessage);
  }
}

const submitMessage = async (e, sendMessage) => {
  const form = e.target.form;
  const textbox = form.getElementsByTagName("textarea")[0];
  const message = textbox.value;
  textbox.disabled = true;
  if (sendMessage && !(await sendMessage(message))) {
    textbox.disabled = false;
    textbox.focus();
    return;
  }
  textbox.value = '';
  textbox.disabled = false;
  textbox.focus();
  return;
  worker.postMessage({
    action: 'demo',
  });
}

const MessageInput = {
  view: ({ attrs }) => (
    <div class={styles.red}>
      <form class={styles.textbox}>
        <textarea class={styles.userinput} placeholder="Message Goes Here" onkeydown={async (e) => submitOnEnter(e, attrs.sendMessage)}></textarea>
        <button type="submit" value="Submit" onclick={async (e) => {
          e.preventDefault();
          await submitMessage(e, attrs.sendMessage);
        }}>Send</button>
      </form>
    </div>
  )
};

export default MessageInput;
