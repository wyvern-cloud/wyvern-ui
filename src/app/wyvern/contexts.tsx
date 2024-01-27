import { createContext, useState, useEffect, Suspense } from 'react';
import { generateProfile } from "./lib/profile.ts";

export const AgentContext = createContext(null)

export const AgentProvider = (props) => {
	const [username, setUsername] = useState("");
	const [did, setDid] = useState("")
	const [agent, setAgent] = useState();
	const [onload, setOnload] = useState([]);
	useEffect(() => {
		import("./lib/agent.ts").then((module) => {
			let my_agent = module.default;
			if (my_agent?.profile) return;
			const profile = generateProfile({ label: null })
			profile.label = `${profile.label} (Wyvern Client)`;
			if (!my_agent.profile) my_agent.setupProfile(profile)
			setUsername(my_agent.profile.label);
			console.log("profile", profile)
			let onDidGenerated = (did: string) => {
				my_agent.profile.did = did
				console.log("My mediated DID", did);
				setDid(did);
			}
			my_agent.ondid = onDidGenerated
			my_agent.onconnect = () => {
				let connected = true
			}
			my_agent.ondisconnect = () => {
				let connected = false
			}
			setAgent(my_agent);
		});
	});

	const value = {
		username,
		did,
		agent,
		onload, setOnload,
	}

	return <AgentContext.Provider value={value}>{props.children}</AgentContext.Provider>;
};
