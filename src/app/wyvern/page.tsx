'use client'
import ServerList from "./server-list.tsx";
import ServerChat from "./server-chat.tsx";
import UserList from "./user-list.tsx";
import { AgentProvider } from "./contexts.tsx";
import { useRouter } from 'next/navigation';
import { useState, useRef, Suspense } from 'react';
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

const isMobile = typeof navigator !== "undefined" ? navigator.userAgentData?.mobile : false; //resolves true/false

function RenderChat() {
	//const searchParams = useSearchParams()
	//const serverId = searchParams.get('id')
	const [serverId, setServerId] = useQueryState('id', {defaultValue: null})
	const [showUserList, setShowUserList] = useState(false)

	  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe || isRightSwipe)
      console.log('swipe', isLeftSwipe ? 'left' : 'right');
			// add your conditional logic here
		if (isLeftSwipe || isRightSwipe) setShowUserList(isLeftSwipe)
	}
/*
 * if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  // true for mobile device
  document.write("mobile device");
}else{
  // false for not mobile device
  document.write("not mobile device");
}
 */

	return (
		<div
		onTouchStart={onTouchStart}
		onTouchMove={onTouchMove}
		onTouchEnd={onTouchEnd}
		className="flex max-h-screen"
		>
			<ServerList setServerId={setServerId} />
			<ServerChat serverId={serverId} />
			{serverId && !(isMobile && !showUserList) ?
				<UserList serverId={serverId} /> : <></>
			}
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

