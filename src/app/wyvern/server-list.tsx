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

function Server({ id, picture, name }) {
	const router = useRouter();
	return (
		<ServerLink id={id} name={name}>
			<ServerIcon picture={picture} name={name} />
		</ServerLink>
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

export default function ServerList() {
	let contacts = ContactService.getContacts()
	let ss = contacts.map((contact) => {
		return {id: contact.did, name: contact.label, icon: contact.icon};
	});
	const [servers, setServers] = useState(ss)
	const { agent } = useContext(AgentContext);
	useEffect(() => {
		if (!agent) return;
		let updateContacts = () => {
			let contacts = ContactService.getContacts()
			let ss = contacts.map((contact) => {
				return {id: contact.did, name: contact.label, icon: contact.icon};
			});
			setServers(ss);
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
	//if (!onload.includes(funcToOnload))
	//	setOnload(onload.concat(funcToOnload));
	return (
		<nav
		id="server-list"
		className="absolute left-0 top-0 z-[1035] h-full w-14 overflow-visible bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.5)] data-[te-sidebar-hidden='false']:translate-x-0 dark:bg-slate-500"
		>
			<ul className="relative m-0 list-none px-[0.2rem] h-full flex flex-col">
				{servers.map((server) => {
					return <Server key={server.id} id={server.id} name={server.name} picture={server.icon} />
				})}
				<ServerLink name="New Server" callback={addServer}>
					<Tooltip content="Add a server" placement="right">
						<Avatar placeholderInitials="+" rounded />
					</Tooltip>
				</ServerLink>
				<div className="grow" />
				<Settings />
			</ul>
			<AddServer />
			<SettingsMenu />
		</nav>
	);
}
