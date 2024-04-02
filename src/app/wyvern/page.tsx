'use client'
import ServerList from "./server-list.tsx";
import ServerChat from "./server-chat.tsx";
import UserList from "./user-list.tsx";
import { AgentProvider, AgentContext } from "./contexts.tsx";
import { useRouter } from 'next/navigation';
import { useState, useContext, useRef, Suspense } from 'react';
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

	const [userList, setUserList] = useState([])
	let boundAgent = false;
	const { agent } = useContext(AgentContext);
	let roleList = [];
	function getUsers(msg) {
		let users = msg.message.body.users.map(user => {
			user.roles = user?.roles.map(role => {
				if(roleList.includes(role))
					return role;
				let matchedRole = roleList.filter(rl => rl.id == role );
				if(!matchedRole)
					return null;
				return matchedRole[0];
			}).filter(r => r) ?? [];
			return user;
		});
		users = users.sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0));
		setUserList({
			serverId: serverId,
			users: users,
		});
	}

	if (!boundAgent && agent) {
		agent.onMessage("https://developer.wyvrn.app/protocols/serverinfo/1.0/user-list", getUsers.bind(this));
		agent.onMessage("https://developer.wyvrn.app/protocols/serverinfo/1.0/role-list", (msg) => { roleList = msg.message.body.roles });
		//agent.onMessage("contactsIndexed", getUsers.bind(this));
		boundAgent = true;
	}


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
				<UserList serverId={serverId} users={userList.serverId == serverId ? userList.users : []} /> : <></>
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

