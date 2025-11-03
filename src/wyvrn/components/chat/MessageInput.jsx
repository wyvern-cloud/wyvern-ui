import m from "mithril";
import styles from "../../server-list.module.css";
import w from "../../agent";

const MessageInput = {
  view: ({ attrs }) => (
    <div class={styles.red}>
      <form class={styles.textbox}>
        <textarea class={styles.red}></textarea>
        <button type="submit" value="Submit" onclick={async (e) => {
          e.preventDefault();
          const form = e.target.form;
          const textbox = form.getElementsByTagName("textarea")[0];
          const message = textbox.value;
          textbox.disabled = true;
          if (attrs.sendMessage && !(await attrs.sendMessage(message))) {
            textbox.disabled = false;
            return;
          }
          textbox.value = '';
          textbox.disabled = false;
          return;
          worker.postMessage({
            action: 'demo',
          });
        }}>Send</button>
      </form>
    </div>
  )
};

export default MessageInput;
