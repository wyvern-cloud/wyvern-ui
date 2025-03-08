// https://flowbite.com/docs/components/avatar/
import "./colors.scss";
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
			className="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-1 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-stone-50 hover:text-inherit hover:outline-none focus:bg-stone-50 focus:text-inherit focus:outline-none active:bg-stone-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
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

function Channel({ server }) {
	const router = useRouter();
			// <ServerIcon picture={server.icon} name={server.name} />
	return (
			<div
			style={{color: server?.selected ? "#fafafa" : "#acacac"}}
			className={`flex flex-wrap gap-2 items-center py-0.5 pl-3 ${server?.selected && 'dark:bg-stone-700'}`}
			>
				<span>{ server.type == "text" ? "#" : "?" } {server.name}</span>
			</div>
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

function renderChannelList(channels) {
	let seenHoistedRoles = [];
	let elements = []
	channels.sort((a, b) => {
		if(a.position < b.position)
			return -1;
		if(a.position > b.position)
			return 1;
		return 0;
	}).map((channel) => {
		elements.push(<div key={channel.id} data-channel-id={channel.id}><Channel server={channel} /></div>);
	})
	return elements;
}

export default function ChannelList({ serverId }) {
	const [messages, setMessages] = useState([]);
	const messagesEndRef = useRef(null);
  let contact = ContactService.getContact(serverId)
	let server_name = serverId

	const { username, did, agent } = useContext(AgentContext);

	function getChannels(force: boolean) {
		let mc = ContactService.getMessageHistory(serverId)
		//if (messages.length != mc.length || force)
			//setMessages([...mc])
	}
	let channels = [
		{
			id: "1",
			type: "text",
			name: "general",
			position: 0,
			selected: true,
		},
		{
			id: "2",
			type: "voice",
			name: "Team Speak",
			position: 1,
		},
		{
			id: "3",
			type: "text",
			name: "manga",
			position: 4,
		},
		{
			id: "4",
			type: "text",
			name: "anime",
			position: 3,
		},
		{
			id: "5",
			type: "text",
			name: "meme-dump",
			position: 5,
		},
	];

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
		<div
		className="ps-14"
		>
			<div
			style={{width: "240px"}}
			className="fixed sm:relative left-0 top-0 z-[1035] h-dvh max-h-dvh overflow-y-auto overflow-hidden bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.5)] data-[te-sidebar-hidden='false']:translate-x-0 dark:bg-stone-800"
			>
				<div className="flex pl-3">
					<h2 className="mb-5 grow pt-4">Demo Server</h2>
					<div
					className="content-center p-4"
					>
						<svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
					</div>
				</div>
				<nav
				id="user-list"
				>
					<ul className="relative m-0 list-none flex flex-col">
						{renderChannelList(channels)}
					</ul>
				</nav>
			</div>
		</div>
	);
}
