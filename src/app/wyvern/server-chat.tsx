import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";

export default function Chat({ serverId }) {
  let contact = ContactService.getContact(serverId)
	let server_name = serverId
	const router = useRouter();
  if (!contact && serverId) {
		router.push("/wyvern/")
  } else if (contact) {
		server_name = contact.label ? `${contact.label} - ${contact.did.substr(0,110)}...` : `Unknown Server Name: ${contact.did}`;
	}

	const { username, did, agent } = useContext(AgentContext);
	console.log("Agent", agent);
	return (
		<div
		className="ps-14 h-full relative min-h-screen"
		>
			<div className="p-4">
				Welcome to server: {server_name}
				<br />
				User: {username}
				<br />
				did: <input value={did} />
			</div>
		</div>
	);
}
