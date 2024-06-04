"use client";
import Image from "next/image";
import Link from 'next/link';
import styles from "@/app/home.module.css";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite, Button, Navbar } from "flowbite-react";

const customTheme: CustomFlowbiteTheme = {
	navbar: {
		root: {
			base: "bg-white border-gray-200 dark:bg-gray-900 z-40 relative",
			inner: {
				base: "max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative",
			},
		},
		collapse: {
			list: "flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700",
		},
		link: {
			active: {
				on: "block py-2 px-3 md:p-0 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:dark:text-blue-500",
				off: "block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700",
			},
		},
	},
  button: {
		base: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    color: {
      info: "bg-red-500 hover:bg-red-600",
    },
		inner: {
			base: "",
		},
		size: {
			nav: "text-base",
			cta: "text-sm",
		},
  },
};

export default function Home() {
	const router = useRouter();

  return (
		<div className="flex flex-col">
			<header>
				

				<Flowbite theme={{ theme: customTheme }}>
					<Navbar fluid rounded className="fixed w-full">
						<Navbar.Brand href="https://wyvrn.app">
							<img src="/pwa/icons-vector.svg" style={{filter: "invert(56%) sepia(44%) saturate(4724%) hue-rotate(160deg) brightness(92%) contrast(101%)"}} className="mr-3 h-8 sm:h-8" alt="Wyvrn Logo" />
							<span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">Wyvrn</span>
						</Navbar.Brand>
						<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
							<Button as={Link} href="/onboard" className="" size="cta">
								Open Wyvrn
							</Button>
							<Navbar.Toggle />
						</div>
						<Navbar.Collapse>
							<Navbar.Link href="#top" active>
								Home
							</Navbar.Link>
							<Navbar.Link href="#content">About</Navbar.Link>
							<Navbar.Link href="https://github.com/wyvern-cloud/wyvern-ui">Github</Navbar.Link>
						</Navbar.Collapse>
					</Navbar>
				</Flowbite>

				{/* Octo Banner */}
				<div className="z-30 relative">
					<div className="min-h-16 min-w-full"></div>
					<a href="https://github.com/wyvern-cloud/wyvern-ui" className="github-corner relative min-w-full block" aria-label="View source on GitHub">
						<svg width="80" height="80" viewBox="0 0 250 250" style={{fill: "#151513", color: "#fff", position: "absolute", top: 0, border: 0, right: 0 }} aria-hidden="true">
							<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
							<path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{transformOrigin: "130px 106px"}} className="octo-arm"></path>
							<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"></path>
						</svg>
					</a>
					<style dangerouslySetInnerHTML={{__html: `.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}`}} />
				</div>

				<div className={`min-h-[50dvh] ${styles["hero-image"]}`}>
					<div className={styles["hero-text"]}>
						<h1 className="text-8xl font-extrabold pb-8">Wyvrn</h1>
						<p className="text-lg italic">Taking communities back</p>
					</div>
				</div>
			</header>

			<main className="flex flex-col items-center justify-between p-8" id="content">
				<div className="flex flex-wrap gap-16 justify-evenly border-4 border-slate-500 rounded-xl p-16">
					<div>
						<h2 className="text-2xl">A new Era of Messaging</h2>
						<br />
						<p className="max-w-xs">
							<b>Wyvrn</b> is not just another chat application. It’s a new way to connect with your friends, family, and communities. Wyvrn brings you the power of end-to-end encryption and full control over your data, all without relying on centralized servers.
						</p>
					</div>
					<div className="min-w-max">
					Image of chibi wyvern here
					</div>
				</div>
				<h2 className="text-4xl font-extrabold p-8">Why Wyvrn is Different</h2>
				<div className="flex max-w-full gap-16 justify-evenly p-16 flex-wrap">

					<div className="w-80 border-4 border-slate-500 rounded-xl flex flex-col">
						<div>
						Image of chibi wyvern here
						</div>
						<h3 className="text-2xl text-extrabold text-center">Privacy First</h3>
						<p className="max-w-xs">
							Wyvrn ensures that your messages are <b>end-to-end encrypted</b>. This means only you and the person you're communicating with can read the messages. Not even Wyvrn can see your conversations.
						</p>
					</div>

					<div className="w-80 border-4 border-slate-500 rounded-xl flex flex-col">
						<div>
						Image of chibi wyvern here
						</div>
						<h3 className="text-2xl text-extrabold text-center">Total Control</h3>
						<p className="max-w-xs">
							With Wyvrn, your information stays in your browser. You decide who you share your data with and when. There's no big server in the sky storing all your personal information.
						</p>
					</div>

					<div className="w-80 border-4 border-slate-500 rounded-xl flex flex-col">
						<div>
						Image of chibi wyvern here
						</div>
						<h3 className="text-2xl text-extrabold text-center">Self-Hostable Communities</h3>
						<p className="max-w-xs">
							Wyvrn is designed to be <b>self-hostable</b>. This means you can run your own community on your own server if you want to. You don’t have to depend on any company to keep your community running.
						</p>
					</div>

					<div className="w-80 border-4 border-slate-500 rounded-xl flex flex-col">
						<div>
						Image of chibi wyvern here
						</div>
						<h3 className="text-2xl text-extrabold text-center">No More Usernames and Passwords</h3>
						<p className="max-w-xs">
							Forget about managing usernames and passwords. Wyvrn keeps everything securely stored in your browser, making it simple and hassle-free to start chatting.
						</p>
					</div>

					<div className="w-80 border-4 border-slate-500 rounded-xl flex flex-col">
						<div>
						Image of chibi wyvern here
						</div>
						<h3 className="text-2xl text-extrabold text-center">Open Source</h3>
						<p className="max-w-xs">
							Wyvrn’s code is open for everyone to see, use, and improve. This transparency means you can trust what the app does with your data. You can even contribute to making Wyvrn better.
						</p>
					</div>

				</div>
				<div className="flex max-w-full gap-16 justify-evenly p-16 flex-wrap">
					<h2 className="text-4xl font-extrabold p-8">Why This Matters</h2>
					<p>
						Most messaging platforms today are centralized. They store your data on their servers and control how it's used. With Wyvrn, you reclaim your privacy and control over your data. It's like having a personal chat app that's tailored just for you and your needs.
					</p>
					<h2 className="text-4xl font-extrabold p-8">The Future of Communication</h2>
					<p>
						Wyvrn embraces <b>decentralization</b>, a modern approach that harks back to the original vision of the internet. It's about creating a more secure, private, and user-controlled web experience.
					</p>
					<h2 className="text-4xl font-extrabold p-8">Join the Wyvrn Community</h2>
					<p>
						Wyvrn is currently in a <b>tech-preview</b> state, meaning it's still under development and getting better every day. We invite you to join our community, try out the app, and share your feedback. Together, we can build a better way to communicate.
					</p>
					<p>
						Checkout Wyvrn by heading over to our <Link className="text-blue-600 underline" href="/onboard">Getting Started page</Link> and see how you can be part of the future of messaging.
					</p>
					
				</div>
			</main>
		</div>
  );
}
