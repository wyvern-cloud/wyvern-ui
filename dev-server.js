require('esbuild-server')
.createServer(
	{
		bundle: true,
		entryPoints: ['src/app.js'],
	},
	{
		static: 'public',
	}
)
.start();
