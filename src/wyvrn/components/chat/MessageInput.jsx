import m from "mithril";
import styles from "../../server-list.module.css";
import w from "../../agent";

const MessageInput = {
  view: () => (
    <div class={styles.red}>
      <form class={styles.textbox}>
        <textarea class={styles.red}></textarea>
        <button type="submit" value="Submit" onclick={(e) => {
          let form = e.target.form;
          form.getElementsByTagName("textarea")[0].value = '';
          e.preventDefault();
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
