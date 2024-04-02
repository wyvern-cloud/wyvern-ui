// https://flowbite.com/docs/components/avatar/
import { Alert } from "flowbite-react";
import { Avatar } from 'flowbite-react';
import { Tooltip } from 'flowbite-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useContext, useState } from 'react';
import { AgentContext } from './contexts.tsx';
import { AgentMessage } from './lib/agent.ts';
import { default as ContactService, Contact, Message } from "./lib/contacts";

import { Button, Checkbox, Label, Modal, TextInput } from 'flowbite-react';

let setOpenModal, openModal
function AddServer() {
  [openModal, setOpenModal] = useState(false);
  const [did, setDid] = useState('');
	const didInputRef = useRef<HTMLInputElement>(null);
	const { agent } = useContext(AgentContext);
	function onAddContact() {
    if (did) {
			let newContact = {did: did};
      if (!ContactService.getContact(did)) {
        ContactService.addContact(newContact as Contact)
				agent.sendProfile(newContact as Contact)
				agent.requestProfile(newContact as Contact)
				agent.sendFeatureDiscovery(newContact as Contact)
			}
      //this.requestFeatures(this.newContact)
    }
  }


  function onCloseModal() {
    setOpenModal(false);
    setDid('');
  }

	function onJoin() {
		onAddContact();
		onCloseModal();
	}

	function onDefault() {
		setDid('did:web:wyvrn.app');
	}

  return (
    <>
      <Modal className="z-[1038]" dismissible show={openModal} size="md" onClose={onCloseModal} initialFocus={didInputRef}>
        <Modal.Header>Join a new Wyvern</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="did" value="Wyvern Address" />
              </div>
              <TextInput
                id="did"
                placeholder="did:web:wyvrn.app"
								ref={didInputRef}
                value={did}
                onChange={(event) => setDid(event.target.value)}
                required
              />
            </div>
            <div className="w-full">
              <Button onClick={onJoin}>Join Wyvern</Button>
              <Button color="dark" onClick={onDefault}>Prefill</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

let setSettingsModal, settingsModal

function Settings() {
	return (
		<ServerLink name="Preferences" styles="justify-self-end" callback={openSettings}>
			<Tooltip content="Change Settings" placement="right">
				<Avatar placeholderInitials="⚙️" rounded />
			</Tooltip>
		</ServerLink>
	)
}

function SettingsMenu() {
	const { agent, username, setUsername } = useContext(AgentContext);
  [settingsModal, setSettingsModal] = useState(false);
  const [displayName, setDisplayName] = useState(username);
  const [validName, setValidName] = useState(displayName.length > 3);
	const didInputRef = useRef<HTMLInputElement>(null);
	function onUpdateDisplayName() {
    if (displayName) {
			setUsername(displayName);
			return;
			agent.profile.label = `${displayName} (Wyvern Client)`
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
      //this.requestFeatures(this.newContact)
    }
  }


  function onCloseModal() {
    setSettingsModal(false);
    //setDid('');
  }

	function onSave(event) {
		if (!validName)
			return
		onUpdateDisplayName();
		onCloseModal();
	}

  return (
    <>
      <Modal className="z-[1038]" dismissible show={settingsModal} size="md" onClose={onCloseModal} initialFocus={!displayName ? didInputRef : undefined}>
        <Modal.Header>Settings</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label
									htmlFor="displayName"
									value="Display Name"
									color={validName ? "success" : "failure"}
								/>
              </div>
              <TextInput
                id="displayName"
                placeholder="Johnny Appleseed"
								ref={didInputRef}
                value={displayName}
								color={validName ? "success" : "failure"}
                onChange={(event) => {
									let name = event.target.value;
									setValidName(name.length > 3)
									setDisplayName(name)
								}}
                required
              />
            </div>
            <div className="w-full">
              <Button onClick={onSave} disabled={!validName}>Update Settings</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

function addServer() {
	// <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
	setOpenModal(true);
}

function openSettings() {
	// <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
	setSettingsModal(true);
}

function openServer(id) {
	return () => console.log(id);
}

function ServerIcon({ id, picture, name }) {
	if(picture)
		return (
			<Tooltip content={name} placement="right">
				<Avatar img={picture} rounded status="online" statusPosition="bottom-right" />
			</Tooltip>
		)
	return (
		<Tooltip content={name} placement="right">
			<Avatar rounded status="busy" statusPosition="bottom-right" />
		</Tooltip>
	)
}

function ServerLink({ id, children, name, callback, styles }) {
	const router = useRouter();
	const call_callback = (event) => {
		if(callback) {
			event.preventDefault();
			event.stopPropagation();
		}
		return id ? openServer(id) : callback()
	}
	return (
		<li className={["relative", styles].join(" ")}>
			<Link
			className="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-1 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
			alt={name}
			onClick={call_callback}
			//href={id ? ("/wyvern/server/" + id) : "#"}
			href={id ? ("?id=" + id) : ""}
			>
				{children}
			</Link>
		</li>
	);
}

function Server({ server }) {
	const router = useRouter();
			// <ServerIcon picture={server.icon} name={server.name} />
	return (
			<Tooltip placement="left" content={server.roles.map(r=><>{r.name}<br /></>)}>
				<div className="flex flex-wrap gap-2 items-center">
					<Avatar rounded status="busy" statusPosition="bottom-right" />
					<span style={{color: server.roles[0]?.color ?? "gray"}}>{server.name}</span>
				</div>
			</Tooltip>
	);
}

async function onProfileUpdate(message: AgentMessage) {
  let contact = ContactService.getContact(message.message.from)
  if (!contact) {
    return
  }

  let label = message.message.body?.profile?.displayName
  if (!label) {
    return
  }

  contact.label = label
  ContactService.addContact(contact)
}

//function updateServers() {
//	let contacts = ContactService.getContacts()
//	let ss = contacts.map((contact) => {
//		return {id: contact.did, name: contact.label};
//	});
//	setServers(ss);
//}

const defaultActors: string[] = [
  "Alice",
  "Bob",
  "Carol",
  "Dave",
  "Eve",
  "Faythe",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Karl",
  "Lloyd",
  "Mallory",
  "Nia",
  "Oscar",
  "Peggy",
  "Quentin",
  "Rupert",
  "Sybil",
  "Trent",
  "Ursula",
  "Victor",
  "Walter",
  "Xavier",
  "Yvonne",
  "Zoe",
]

let roleList = [{
	id: 1,
	color: '#5555cc',
	name: 'Owner',
	hoist: true
},{
	id: 2,
	color: '#c3c3c3',
	name: 'Bot',
	hoist: false,
},{
	id: 3,
	color: '#cc5555',
	name: 'Administrators',
	hoist: true,
},{
	id: 4,
	color: '#55cc55',
	name: 'Moderators',
	hoist: true,
},{
	id: 5,
	color: '#dd00aa',
	name: 'Subscribers',
	hoist: true,
},{
	id: 6,
	color: '#454545',
	name: 'Visitors',
	hoist: false,
}]

function getRoles(count) {
	if (count == 0)
		return [roleList[roleList.length-1]];
	let roles = roleList.slice(0, roleList.length-1);
	roles = roles.sort((a, b) => 0.5 - Math.random());
	roles = roles.slice(0, count);
	roles = roles.sort((a, b) => {
		if (a.id < b.id) return -1;
		if (a.id > b.id) return 1;
		return 0;
	});
	roles.push(roleList[roleList.length-1]);
	return roles;
}

const genUserList = defaultActors.map(actor => {
	return {
		id: actor,
		name: actor,
		username: `@${actor}`,
		icon: '',
		roles: getRoles(Math.floor(Math.random()*(roleList.length-1)))
	}
});

function getHoistRole(roles) {
	for (let r of roles) {
		if (r.hoist)
			return r;
	}
	return roles[0];
}

function renderUserList(servers) {
	let seenHoistedRoles = [];
	let elements = []
	servers.sort((a, b) => {
		let ar = getHoistRole(a.roles);
		let br = getHoistRole(b.roles);
		if (!ar || !br) {
			if(ar)
				return -1;
			if(br)
				return 1;
			return 0;
		}
		if (ar?.hoist && br?.hoist) {
			if (ar.id < br.id)
				return -1;
			if (ar.id > br.id)
				return 1;
		}
		else if (ar?.hoist)
			return -1;
		else if (br?.hoist)
			return 1;
		if(ar.name > br.name)
			return -1;
		if(ar.name < br.name)
			return 1;
		return 0;
	}).map((server) => {
		let role = getHoistRole(server.roles);
		if (role && role.hoist && !seenHoistedRoles.includes(role.id)) {
			elements.push(<div className="content-center text-center"><span>{role.name}</span></div>);
			seenHoistedRoles.push(role.id);
		} else if ((!role || !role.hoist) && !seenHoistedRoles.includes(-1)) {
			elements.push(<div className="content-center text-center"><span>Online</span></div>);
			seenHoistedRoles.push(-1);
		}
		elements.push(<Server key={server.id} server={server} />);
	})
	return elements;
}

export default function UserList({ serverId }) {
	const [server, setServer] = useState("");
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
	let boundAgent = false;
	const [servers, setServers] = useState(genUserList)
	const { agent } = useContext(AgentContext);

	//const { username, did, agent } = useContext(AgentContext);

	function getUsers(msg) {
		console.log("FWOsTY-1", msg.message.body.users, roleList);
		let users = msg.message.body.users.map(user => {
			console.log("user", user, user.roles);
			user.roles = user?.roles.map(role => {
				console.log("role", role)
				if(roleList.includes(role))
					return role;
				let matchedRole = roleList.filter(rl => {
					console.log("matching", rl, rl.id, role, rl.id == role);
					return rl.id == role;
				});
				console.log("matchedRole", matchedRole, roleList);
				if(!matchedRole)
					return null;
				return matchedRole[0];
			}).filter(r => r) ?? [];
			return user;
		});
		console.log("FWOsTY-2", users, roleList);
		setServers(users);
		return;
		let mc = ContactService.getMessageHistory(serverId)
		if (messages.length != mc.length || force)
			setMessages([...mc])
	}

	if (!boundAgent && agent) {
		agent.onMessage("https://developer.wyvrn.app/protocols/serverinfo/1.0/user-list", getUsers.bind(this));
		agent.onMessage("https://developer.wyvrn.app/protocols/serverinfo/1.0/role-list", (msg) => { roleList = msg.message.body.roles });
		//agent.onMessage("contactsIndexed", getUsers.bind(this));
		boundAgent = true;
	}



	let contacts = ContactService.getContacts()
	let ss = contacts.map((contact) => {
		return {id: contact.did, name: contact.label, icon: contact.icon};
	});
	useEffect(() => {
		//setServers(genUserList);
		if (!agent) return;
		let updateContacts = () => {
			let contacts = ContactService.getContacts()
			let ss = contacts.map((contact) => {
				return {id: contact.did, name: contact.label, icon: contact.icon};
			});
			//setServers(ss);
		};
		agent.onMessage(
			"https://didcomm.org/user-profile/1.0/profile",
			updateContacts
		)
		agent.onMessage(
			"contactsImported",
			updateContacts
		)
	});
	useEffect(() => {
		let $body = document.getElementById("user-list");
		let toggle_menu = (ev) => {
			console.log("DEBUG-1", ev);
			//$body.className = ( $body.className == 'menu-active' )? '' : 'menu-active';
		};
		document.body.addEventListener("dragleft",   function(ev){console.log("DEBUG-2") ;return toggle_menu(ev);});
		document.body.addEventListener("dragright",  function(ev){console.log("DEBUG-3") ;return toggle_menu(ev);});
		document.body.addEventListener("swipeleft",  function(ev){console.log("DEBUG-4") ;return toggle_menu(ev);});
		document.body.addEventListener("swiperight", function(ev){console.log("DEBUG-5") ;return toggle_menu(ev);});
	}, []);
	//if (!onload.includes(funcToOnload))
	//	setOnload(onload.concat(funcToOnload));
	return (
		<nav
		id="user-list"
		className="fixed md:relative right-0 top-0 z-[1035] h-dvh max-h-dvh overflow-y-auto w-dvw md:w-80 overflow-hidden bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.5)] data-[te-sidebar-hidden='false']:translate-x-0 dark:bg-slate-500"
		>
			<ul className="relative m-0 list-none px-[0.2rem] flex flex-col">
				{renderUserList(servers)}
			</ul>
		</nav>
	);
}
