import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    //"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    //"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    //"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/flowbite-react/lib/**/*.js",
  ],
	darkMode: 'media',
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
	safelist: [
		'bg-red-500',
		'hover:bg-red-600',
		'z-30',
	],
  plugins: [
		require('flowbite/plugin'),
	],
};
export default config;
