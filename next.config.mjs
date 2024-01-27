/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	webpack: (config, options) => {
		config.experiments = { ...config.experiments, asyncWebAssembly: true };
		config.module.rules.push({
			test: /\.wasm/,
			type: "webassembly/async",
		});
		return config;
	},
	async rewrites() {
		return [
			{
				source: "/wyvern/server/:id",
				destination: "/wyvern/",
			}
		];
	},
};

export default nextConfig;
