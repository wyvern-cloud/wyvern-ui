import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AgentContext } from "./contexts.tsx";
import { default as ContactService, Contact, Message } from "./lib/contacts";

export default function About() {
	const router = useRouter();

	const { username, did, agent } = useContext(AgentContext);
	console.log("Agent", agent);
	return (
		<div
		className="ps-14 h-full relative min-h-screen"
		>
			<div className="p-4">
				<br />
				User: {username}
				<br />
				did: <input value={did} />
			</div>
		</div>
	);
}
