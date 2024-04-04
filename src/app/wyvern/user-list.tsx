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
			<Tooltip placement="left" content={<>{(getHoistRole(server.roles)?.name ?? "No Role")} <br />---<br /> {server.roles.map(r=><>{r.name}<br /></>)}</>}>
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

function getHoistRole(roles) {
	let sortedRoles = roles.map((x) => x);
	sortedRoles.sort((a, b) => {
		if(a.id < b.id)
			return -1;
		if(b.id < a.id)
			return 1;
		return 0;
	});
	for (let r of sortedRoles) {
		if (r.hoist)
			return r;
	}
	return roles[0];
}

function renderUserList(servers) {
	let seenHoistedRoles = [];
	let elements = []
	servers.sort((a,b) => {
		// Sort by name
		if(a.name > b.name)
			return 1;
		if(b.name > a.name)
			return -1;
		return 0;
	}).sort((a, b) => {
		// Put hoisted roles at the top
		let ar = getHoistRole(a.roles);
		let br = getHoistRole(b.roles);
		if (ar?.hoist)
			return -1;
		if (br?.hoist)
			return 1;
		return 1;
	}).sort((a, b) => {
		let ar = getHoistRole(a.roles);
		let br = getHoistRole(b.roles);
		// is this needed?
		if (!br && ar?.hoist)
			return -1;
		if (!ar && br?.hoist)
			return 1;

		// Sort by hoist role ID/order
		if (ar?.hoist && br?.hoist) {
			if (ar.id < br.id)
				return -1;
			if (ar.id > br.id)
				return 1;
		}
		// Sort by name
		//if(a.name > b.name)
		//	return 1;
		//if(b.name > a.name)
		//	return -1;
		return 0;
	}).map((server) => {
		let role = getHoistRole(server.roles);
		if (role && role.hoist && !seenHoistedRoles.includes(role.id)) {
			elements.push(<div key={`role-${role.id}`} className="content-center text-center"><span>{role.name}</span></div>);
			seenHoistedRoles.push(role.id);
		} else if ((!role || !role.hoist) && !seenHoistedRoles.includes(-1)) {
			elements.push(<div key="role-empty" className="content-center text-center"><span>Online</span></div>);
			seenHoistedRoles.push(-1);
		}
		elements.push(<div dataUserId={server.id}><Server key={server.id} server={server} /></div>);
	})
	return elements;
}

export default function UserList({ serverId, users }) {
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);

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
				{renderUserList(users)}
			</ul>
		</nav>
	);
}
