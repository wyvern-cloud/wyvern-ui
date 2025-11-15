import m from 'mithril';
import {UserPFP, UserName} from "./user";
import w from '../agent';
import styles from "../server-list.module.css";
import { GLOBAL_PREFIX } from '../utils/constants';


var Servers = [
	{ id: 1, name: "Wyvrn Official Server"},
	{ id: 2, name: "Wyvrn Test Server"},
]

var ServerList = {
	view: () => (
		<div class={styles.serverList}>
			{Servers.map((item, index) => (
				<div key={item.id}>
					<div class={styles.serverIcon}>
						<img src="https://placecats.com/100/100" />
						<span></span>
					</div>
					<div class={styles.serverTooltip}>
						<div class={styles.text}>
							{item.name}
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

var SubList = {
	view: (vnode) => (
		<div class={styles.subList}>
			{vnode.children}
		</div>
	)
};

var PeerDMView = {
	view: () => {
		//console.log(users);
		//console.log(Object.values(users));
		let users = w.getPeers();
		return (
			<>
				<div class={styles.userList}>
					<div class={styles.systemEntry} onclick={(e) => {
						m.route.set("/w/friends", null, {replace: false, state: {term: "friends"}})
					}}> Friends </div>
					<div class={styles.systemEntry} onclick={(e) => {
						m.route.set("/w/requests", null, {replace: false, state: {term: "requests"}})
					}}> Message Requests </div>
				</div>
				<div class={styles.userList}>
					{Object.values(users).map((item, index) => (
						<div key={item.username} class={styles.userListEntry} onclick={(e) => {
							m.route.set("/w/did/:did", {did: item.did}, {replace: false, state: {term: item.did}})
						}}>
							<UserPFP user={item} />
							<UserName user={item} />
						</div>
					))}
				</div>
			</>
		)
	}
}

const users = {
	"jake" : {
		"username": "jake",
		"displayname": "Jake Smith",
		"roles": ["Admin", "User"],
		"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=jake",
	},
	"jane" : {
		"username": "jane",
		"displayname": "Jane Doe",
		"roles": ["User"],
		"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=jane",
	},
	"lila" : {
		"username": "lila",
		"displayname": "Lila Barnes",
		"roles": ["User"],
		"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=lila",
	},
}


var MyUserInfo = {
	oninit: (vnode) => {
		vnode.state.profile = JSON.parse(localStorage.getItem(`${GLOBAL_PREFIX}profile`) || '{}');
	},
	view: (vnode) => {
		let item = {
			displayname: vnode.state.profile.displayName,
			username: "test",
			pfp: vnode.state.profile.profilePicture,
			roles: ["Admin", "User"],
		};
		return (
			<div class={styles.myUserInfo}>
				<div class={styles.userList}>
						<div key={item.username} class={styles.userListEntry} onclick={(e) => {
							m.route.set("/w/settings", null, {replace: false, state: {prevRoute: m.route.get()}});
						}}>
							<UserPFP user={item} />
							<UserName user={item} />
						</div>
				</div>
			</div>
		)
	}
}

var page = () => {
	//oninit: User.loadList,
	let serverView = 'dms';
	return {
		view: function() {
			if (m.route.get() === '/w/requests')
				serverView = 'server';
			else
				serverView = 'dms';
			return (
				<div class={styles.leftSidebar}>
					<div class={styles.top}>
						<ServerList />
						<SubList>
						{serverView === 'server' ? (
						<div>
						Server Channels
						<m.route.Link href="/w"> Back</m.route.Link>
						</div>) :
						(
						<PeerDMView />
						)
						}
						</SubList>
					</div>
					<MyUserInfo />
				</div>
			)
		}
	}
}

export default page;
