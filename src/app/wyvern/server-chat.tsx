import { useContext, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";
import { Button, TextInput } from 'flowbite-react';
import TextareaAutosize from 'react-textarea-autosize';
import { marked } from "marked";
import DOMPurify from 'dompurify'
import Editor from '@/components/editor'

function MessageElem({ message }) {
	console.log(message)
	let sender = message.raw?.body?.author ?? message.sender
	return (
		<div className="inline-block chat-message" style={{textIndent: "-1em", paddingLeft: "1em"}}>
			<div className="inline indent-[initial] prefix">
				<span className="text-ellipsis overflow-hidden max-w-80 text-nowrap whitespace-nowrap shrink-0 username">{sender}</span>
				<span className="inline shrink-0 pr-1">:</span>
			</div>
			<span className="message">{message.content}</span>
		</div>
	)
}

function RichMessageElem({ message }) {
	console.log(message)
	let sender = message.raw?.body?.author ?? message.sender
	let time = new Date(message.raw?.body?.timestamp * 1000);
	return (
		<div className="inline-block chat-message" style={{textIndent: "-1em", paddingLeft: "1em"}}>
			<div className="inline indent-[initial] prefix">
				<span className="shrink-1 pr-1 tooltip timestamp">
					{time.toLocaleTimeString()}
					<span className="tooltiptext">{time.toString()}</span>
				</span>
				<span className="text-ellipsis overflow-hidden max-w-80 text-nowrap whitespace-nowrap shrink-0 username">{sender}</span>
				<span className="inline shrink-0 pr-1">:</span>
			</div>
			<span className="message" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked.parseInline(message.content, {breaks: true}))}}></span>
		</div>
	)
}

function Chatbox({ sendMessage, serverName, text, setText }) {
				// <TextareaAutosize minRows="1" maxRows="6" className="pl-1 pr-1 grow" disabled={!serverName} value={text} onChange={(e) => setText(e.target.value)} />
	return (
		<form className="" onSubmit={event => {
			event.preventDefault();
			sendMessage(text)
			setText("");
		}}>
			<div className="min-h-12 bg-slate-500 flex items-center">
				<Editor onSubmit={sendMessage} />
				<Button type="submit" gradientDuoTone="purpleToBlue">Send</Button>
			</div>
		</form>
	)
}

export default function Chat({ serverId }) {
	const [text, setText] = useState("");
	const [server, setServer] = useState("");
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
	let contacts = ContactService.getContacts();
	let boundAgent = false;
  let contact = ContactService.getContact(serverId)
	let server_name = serverId
	const router = useRouter();

	const { username, did, agent } = useContext(AgentContext);

	function getMessages(force: boolean) {
		let mc = ContactService.getMessageHistory(serverId)
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

	function sendMessage(msg) {
    const message = {
      type: "https://didcomm.org/basicmessage/2.0/message",
      lang: "en",
      body: {
        content: msg,
      },
    }
    agent.sendMessage(serverId, message)
		getMessages();
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
			className="flex flex-col min-h-svh max-h-svh dark:bg-slate-900 justify-end "
			>
				<div className="overflow-x-hidden">
					<div className="p-4 flex flex-col">
						{ serverId ?
							<>
								<div className="text-ellipsis overflow-hidden text-nowrap">
									Welcome to server: {server_name ?? "Not connected to a server"}
								</div>
								<div>
									User: {username}
									<br />
									<div className="flex">
										<div className="grow shrink-0 pr-2">did:</div>
										<div className="grow-0 shrink relative w-full">
											<input className="dark:bg-slate-800 relative w-full block w-full rounded-md border-0 p-1 text-orange-700 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm text-ellipsis" value={did ?? "Missing DID"} readOnly />
										</div>
									</div>
								</div>
								{messages.map((message) => {
									if (message.type === "https://didcomm.org/basicmessage/2.0/message")
										return <MessageElem key={message.raw.id} message={message} />
									if (message.type === "https://developer.wyvrn.app/protocols/groupmessage/1.0/message")
										return <RichMessageElem key={message.raw.id} message={message} />
								})}
							</> : <>
								<h1 className="text-4xl font-bold mb-10 text-center">Welcome to Wyvrn!</h1>
								Welcome to Wyvrn, the free and open-source communication platform. To get started,&nbsp;
								{ contacts.length == 0 ?
									<>
										join a Wyvrn server via the plus icon in the top left-hand corner to join a Wyvrn Community.
									</> :
									<>
										click on a Wyvrn Community via it's community icon on the left-hand side of the screen.
									</>
								}
								<br />
								<br />
								Welcome {username} to Wyvrn.
								<br />
								<div className="flex">
									<div className="grow shrink-0 pr-2">Your Decentralized ID is:</div>
									<div className="grow-0 shrink relative w-full">
										<input className="dark:bg-slate-800 relative w-full block w-full rounded-md border-0 p-1 text-orange-700 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm text-ellipsis" value={did ?? "Missing DID"} readOnly />
									</div>
								</div>
							</>
						}
						<div ref={messagesEndRef} />
					</div>
				</div>
				{server_name && (
					<Chatbox sendMessage={sendMessage} serverName={server_name} text={text} setText={setText} />
				)}
			</div>
		</div>
	);
}
