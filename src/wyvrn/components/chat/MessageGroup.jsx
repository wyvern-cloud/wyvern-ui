import m from "mithril";
import { UserPFP, UserName } from "../user";
import ChatMessage from "./ChatMessage";

const MessageGroup = {
  showTimeStamp: (ts) => {
    let timestamp = new Date(ts);
    return Intl.DateTimeFormat(
      'default',
      { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).format(timestamp);
  },
  view: (vnode) => (
    <div style="display:flex; flex-direction: row; margin: 0.5rem 0;">
      <div>
        <UserPFP user={vnode.attrs.user} />
      </div>
      <div style="display: flex; flex-direction: column;margin-left: 1rem;">
        <div style="display: flex;margin-bottom: 0.3rem;">
          <UserName user={vnode.attrs.user} />
          &nbsp;{MessageGroup.showTimeStamp(vnode.attrs.messages[0]?.timestamp)} 
        </div>
        {vnode.attrs.messages.map((msg, index) => {
          return (
            <ChatMessage key={msg.id} message={msg} ts={MessageGroup.showTimeStamp(msg.timestamp)} />
          )
        })}
      </div>
    </div>
  )
};

export default MessageGroup;
