import { useContext, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";
import { Button, TextInput } from 'flowbite-react';

function MessageElem({ message }) {
	console.log(message)
	let sender = message.raw?.body?.author ?? message.sender
	return (
		<div className="inline-block" style={{textIndent: "-1em", paddingLeft: "1em"}}>
			<div className="inline">
				<span className="text-ellipsis overflow-hidden max-w-80 text-nowrap whitespace-nowrap shrink-0">{sender}</span>
				<span className="inline shrink-0 pr-1">:</span>
			</div>
			<span className="inline">{message.content}</span>
		</div>
	)
}

function RichMessageElem({ message }) {
	console.log(message)
	let sender = message.raw?.body?.author ?? message.sender
	let time = new Date(message.raw?.body?.timestamp * 1000);
	return (
		<div className="inline-block" style={{textIndent: "-1em", paddingLeft: "1em"}}>
			<div className="inline">
				<span className="shrink-1 pr-1 tooltip">
					{time.toLocaleTimeString()}
					<span className="tooltiptext">{time.toString()}</span>
				</span>
				<span className="text-ellipsis overflow-hidden max-w-80 text-nowrap whitespace-nowrap shrink-0">{sender}</span>
				<span className="inline shrink-0 pr-1">:</span>
			</div>
			<span>{message.content}</span>
		</div>
	)
}

export default function Chat({ serverId }) {
	const [text, setText] = useState("");
	const [server, setServer] = useState("");
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
	let boundAgent = false;
  let contact = ContactService.getContact(serverId)
	let server_name = serverId
	const router = useRouter();

	const { username, did, agent } = useContext(AgentContext);

	function getMessages(force: boolean) {
		let mc = ContactService.getMessageHistory(serverId)
		console.log("Frosty messages", mc, messages);
		if (messages.length != mc.length || force)
			setMessages([...mc])
	}

  if (!contact && serverId) {
		console.log(serverId);
		router.push("/wyvern/")
  } else if (contact) {
		server_name = contact.label ? `${contact.label} - ${contact.did.substr(0,110)}...` : `Unknown Server Name: ${contact.did}`;
		if(server != serverId) {
			setServer(serverId)
		}
		getMessages(server != serverId)
	}
	if (!boundAgent && agent) {
		agent.onAnyMessage(getMessages.bind(this));
		agent.onMessage("contactsIndexed", getMessages.bind(this));
		boundAgent = true;
	}

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
		className="ps-14 relative min-h-svh grow min-w-0"
		>
			<div
			className="flex flex-col min-h-svh max-h-svh dark:bg-slate-900"
			>
				<div className="grow flex flex-col justify-end overflow-hidden ">
					<div className="p-4 overflow-y-scroll grow flex flex-col justify-end">
						<div className="text-ellipsis overflow-hidden text-nowrap">
							Welcome to server: {server_name ?? "Not connected to a server"}
						</div>
						<div>
							User: {username}
							<br />
							did: <input className="dark:bg-slate-800" value={did} readOnly />
						</div>
						{messages.map((message) => {
							if (message.type === "https://didcomm.org/basicmessage/2.0/message")
								return <MessageElem key={message.raw.id} message={message} />
							if (message.type === "https://developer.wyvrn.app/protocols/groupmessage/1.0/message")
								return <RichMessageElem key={message.raw.id} message={message} />
						})}
						<div ref={messagesEndRef} />
					</div>
				</div>
				<form className="" onSubmit={sendMessage}>
					<div className="h-12 bg-slate-500 flex items-center">
						<TextInput className="pl-1 pr-1 grow" disabled={!server_name} value={text} onChange={(e) => setText(e.target.value)} />
						<Button type="submit" gradientDuoTone="purpleToBlue">Send</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
