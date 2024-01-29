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

  return (
    <>
      <Modal dismissible show={openModal} size="md" onClose={onCloseModal} initialFocus={didInputRef}>
        <Modal.Header>Join a new Wyvern</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="did" value="Wyvern Address" />
              </div>
              <TextInput
                id="did"
                placeholder="did:web:frostyfrog.net"
								ref={didInputRef}
                value={did}
                onChange={(event) => setDid(event.target.value)}
                required
              />
            </div>
            <div className="w-full">
              <Button onClick={onJoin}>Join Wyvern</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

const SERVERS = [
	{
		id: 1,
		name: "Frosty's Kitty Farm",
		icon: "https://frostyfrog.net/images/blog/9066978b31dc68e9ce772e4e09d4785e/banner.295a207a951f494ff6670910f4d5e3cab05cb737fe5395e3b9bb4dc1ef2ab7249df706179bfa7ce482d3a33d870644338f609e6f0213165de479948064cc689a.webp",
	},
	{
		id: 2,
		name: "Discord"
	},
];

function addServer() {
	// <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
	setOpenModal(true);
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

function ServerLink({ id, children, name }) {
	const router = useRouter();
	return (
		<li className="relative">
			<Link
			className="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-1 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
			alt={name}
			onClick={id ? openServer(id) : addServer}
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
		return {id: contact.did, name: contact.label};
	});
	const [servers, setServers] = useState(ss)
	const { agent } = useContext(AgentContext);
	useEffect(() => {
		if (!agent) return;
		agent.onMessage(
			"https://didcomm.org/user-profile/1.0/profile",
			() => {
				let contacts = ContactService.getContacts()
				let ss = contacts.map((contact) => {
					return {id: contact.did, name: contact.label};
				});
				setServers(ss);
			}
		)
	});
	//if (!onload.includes(funcToOnload))
	//	setOnload(onload.concat(funcToOnload));
	return (
		<nav
		id="server-list"
		className="absolute left-0 top-0 z-[1035] h-full w-14 overflow-visible bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.5)] data-[te-sidebar-hidden='false']:translate-x-0 dark:bg-slate-500"
		>
			<ul className="relative m-0 list-none px-[0.2rem]">
				{servers.map((server) => {
					return <Server key={server.id} id={server.id} name={server.name} picture={server.icon} />
				})}
				<ServerLink name="New Server">
					<Tooltip content="Add a server" placement="right">
						<Avatar placeholderInitials="+" rounded />
					</Tooltip>
				</ServerLink>
			</ul>
			<AddServer />
		</nav>
	);
}
