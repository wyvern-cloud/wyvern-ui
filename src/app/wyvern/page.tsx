'use client'
import ServerList from "./server-list.tsx";
import ServerChat from "./server-chat.tsx";
import { AgentProvider } from "./contexts.tsx";
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
export const dynamic = 'force-dynamic'
import { useSearchParams } from 'next/navigation'
import { useQueryState } from 'next-usequerystate'

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

function RenderChat() {
	//const searchParams = useSearchParams()
	//const serverId = searchParams.get('id')
	const [serverId, setServerId] = useQueryState('id', {defaultValue: null})
	return (
		<div
		className="flex max-h-screen"
		>
			<ServerList setServerId={setServerId} />
			<ServerChat serverId={serverId} />
		</div>
	)
}

export default function Home(props) {
	const router = useRouter();
	return (
		<Suspense>
			<AgentProvider>
				<RenderChat />
			</AgentProvider>
		</Suspense>
	);
}

