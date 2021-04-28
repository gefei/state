module.exports = {
	entryPoints: ["./src/index.ts"],
	out: './docs/api/v8',
	readme: 'none',
	excludeExternals: false,
	excludePrivate: true,
	excludeProtected: true,
	exclude: [
		'**/*Strategy.ts'
	]
};