'use client'
import ServerList from "./server-list.tsx";
import ServerChat from "./server-chat.tsx";
import { AgentProvider } from "./contexts.tsx";
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

/*
  oninit(vnode: m.Vnode<ProfileAttributes>) {
    const profile = generateProfile({ label: vnode.attrs.actor })
    m.route.set("/:actor", { actor: profile.label })
    agent.setupProfile(profile)
    agent.ondid = this.onDidGenerated.bind(this)
    agent.onconnect = () => {
      this.connected = true
      m.redraw()
    }
    agent.ondisconnect = () => {
      this.connected = false
      m.redraw()
    }
  }

  onDidGenerated(did: string) {
    agent.profile.did = did
    m.redraw()
  }
 */

export default function Home(props) {
	const router = useRouter();
	return (
		<Suspense>
			<AgentProvider>
				<ServerList />
				<ServerChat serverId={props.searchParams.id} />
			</AgentProvider>
		</Suspense>
	);
}

