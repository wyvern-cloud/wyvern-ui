import { useContext, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";
import { Button, TextInput } from 'flowbite-react';

function MessageElem({ message }) {
	console.log(message)
	let sender = message.sender
	return (
		<div className="flex">
			<span className="text-ellipsis overflow-hidden max-w-80 inline-block text-nowrap whitespace-nowrap shrink-0">{sender}</span>
			<span className="inline-block shrink-0 pr-1">:</span>
			<span className="inline-block">{message.content}</span>
		</div>
	)
}

export default function Chat({ serverId }) {
	const [text, setText] = useState("");
	const [server, setServer] = useState("");
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
  let contact = ContactService.getContact(serverId)
	let server_name = serverId
	const router = useRouter();

	function getMessages(force: boolean) {
		let mc = ContactService.getMessageHistory(serverId)
		if (messages.length != mc.length || force)
			setMessages([...mc])
	}

  if (!contact && serverId) {
		router.push("/wyvern/")
  } else if (contact) {
		server_name = contact.label ? `${contact.label} - ${contact.did.substr(0,110)}...` : `Unknown Server Name: ${contact.did}`;
		if(server != serverId) {
			setServer(serverId)
		}
		getMessages(server != serverId)
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

	function scrollToBottom(ref) {
		//ref.current?.scrollTo(0, ref.current?.scrollHeight);
		ref.current?.scrollIntoView({ behavior: "smooth" });
	}

	useEffect(() => {
		scrollToBottom(messagesEndRef);
	}, [messages]);

	return (
		<div
		className="ps-14 h-full relative min-h-screen"
		>
			<div
			className="flex flex-col min-h-screen max-h-screen"
			>
				<div className="grow flex flex-col justify-end overflow-hidden ">
					<div className="p-4 overflow-y-scroll">
						<div>
							Welcome to server: {server_name}
						</div>
						<div>
							User: {username}
							<br />
							did: <input value={did} />
						</div>
						{messages.map((message) => {
							if (message.type === "https://didcomm.org/basicmessage/2.0/message")
								return <MessageElem key={message.raw.id} message={message} />
						})}
						<div ref={messagesEndRef} />
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
