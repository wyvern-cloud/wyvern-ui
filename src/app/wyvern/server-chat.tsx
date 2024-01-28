import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";
import { Button, TextInput } from 'flowbite-react';

export default function Chat({ serverId }) {
	const [text, setText] = useState("");
  let contact = ContactService.getContact(serverId)
	let server_name = serverId
	const router = useRouter();
  if (!contact && serverId) {
		router.push("/wyvern/")
  } else if (contact) {
		server_name = contact.label ? `${contact.label} - ${contact.did.substr(0,110)}...` : `Unknown Server Name: ${contact.did}`;
	}

	const { username, did, agent } = useContext(AgentContext);

	function sendMessage(event) {
		event.preventDefault();
    const message = {
      type: "https://didcomm.org/basicmessage/2.0/message",
      lang: "en",
      body: {
        content: text,
      },
    }
		setText("");
    agent.sendMessage(serverId, message)
	}
	console.log("Agent", agent);
	return (
		<div
		className="ps-14 h-full relative min-h-screen"
		>
			<div
			className="flex flex-col min-h-screen"
			>
				<div className="p-4 grow flex flex-col justify-end">
					<div>
						Welcome to server: {server_name}
					</div>
					<div>
						User: {username}
						<br />
						did: <input value={did} />
					</div>
				</div>
				<form className="" onSubmit={sendMessage}>
					<div className="h-12 bg-slate-500 flex items-center">
						<TextInput className="pl-1 pr-1 grow" rounded disabled={!server_name} value={text} onChange={(e) => setText(e.target.value)} />
						<Button type="submit" gradientDuoTone="purpleToBlue">Send</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
