import { createContext, useState, useEffect, Suspense } from 'react';
import { generateProfile } from "./lib/profile.ts";
import { Agent } from "./lib/agent.ts";
import { default as ContactService, Contact, Message } from "./lib/contacts";

export const AgentContext = createContext(null)

function initializeAgent() {
	//import("./lib/agent.ts").then((module) => {
		//let my_agent = new module.default();
		let my_agent = new Agent()
		if (my_agent?.profile) return;
		const openRequest = window.indexedDB.open("notes_db", 1);
		const local_profile = JSON.parse(localStorage.getItem('profile'));
		console.log("Found Profile!", local_profile);
		console.log("Pass Profile!", { label: local_profile?.name });
		const profile = generateProfile({ label: local_profile?.name })
		console.log("Create Profile!", my_agent.profile);
		const new_username = profile.label
		//profile.label = `${new_username} (Wyvern Client)`;
		if (!my_agent.profile) my_agent.setupProfile(profile)
			console.log("Set Profile!", my_agent.profile);
		//setUsername(new_username);
		console.log("profile", profile)
		let onDidGenerated = (did: string) => {
			my_agent.profile.did = did
			console.log("My mediated DID", did);
			//setDid(did);
		}
		my_agent.ondid = onDidGenerated
		my_agent.onconnect = () => {
			let connected = true
		}
		my_agent.ondisconnect = () => {
			let connected = false
		}
		//setAgent(my_agent);
	//});
		return {
			agent: my_agent,
			did: my_agent.profile.did,
			username: new_username,
		};
}
let initialAgent: Record<string, Any>;
if (typeof window !== "undefined") {
	initialAgent = initializeAgent();
}

export const AgentProvider = (props: object) => {
	const [onload, setOnload] = useState([]);
	const [username, setUsername] = useState("");
	const [did, setDid] = useState("No DID found")
	const [agent, setAgent] = useState(false);
	function setupUsername(agent, new_username) {
		agent.profile.label = `${new_username} (Wyvern Client)`
		let contacts = ContactService.getContacts()
		for (let contact of contacts) {
			agent.sendProfile(contact as Contact)
		}
		return;

		if (!ContactService.getContact(did)) {
			ContactService.addContact(newContact as Contact)
			agent.sendProfile(newContact as Contact)
			agent.requestProfile(newContact as Contact)
			agent.sendFeatureDiscovery(newContact as Contact)
		}

	}
	useEffect(() => {
		if (agent)
			return;
	initialAgent.agent.onMessage("didGenerated", (did) => setDid(did));
	setUsername(initialAgent.username);
	setDid(initialAgent.did);
	setAgent(initialAgent.agent);
	}, []);
	useEffect(() => {
		if (username.length <= 2)
			return;
		localStorage.setItem('profile', JSON.stringify({name: username}));
		if (!agent)
			return;
		setupUsername(agent, username);
	}, [username]);

	const value = {
		username, setUsername,
		did,
		agent,
		onload, setOnload,
	}

	return <AgentContext.Provider value={value}>{props.children}</AgentContext.Provider>;
};
