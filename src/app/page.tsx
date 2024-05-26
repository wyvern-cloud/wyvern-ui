"use client";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
	const router = useRouter();
	const [name, setName] = useState();
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		const local_profile = JSON.parse(localStorage.getItem('profile'));
		if( local_profile )
			router.push('/wyvern');
	}, []);

	const onSubmit = e => {
		e.preventDefault();
		localStorage.setItem('profile', JSON.stringify({name: name}));
		router.push('/wyvern');
	};

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
			<form onSubmit={onSubmit}>
				<input type="text" name="name" placeholder="Your Name" onChange={(e) => setName(e.target.value)} />
				<button type="submit" disabled={isLoading || !name}>
					{isLoading ? 'Loading...' : 'Get Started'}
				</button>
			</form>
    </main>
  );
}
