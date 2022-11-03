export function getProcessEnvProxy() {
	return new Proxy(
		{},
		{
			get: (target, prop) => {
				console.warn(
					`Unable to access \`import.meta.env.${prop.toString()}\` on initialization ` +
						`as the Cloudflare platform only provides the environment variables per request. ` +
						`Please move the environment variable access inside a function ` +
						`that's only called after a request has been received.`
				);
			},
		}
	);
}
