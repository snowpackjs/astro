import type { Result } from 'tinyexec';
import { exec } from '../exec.js';

/**
 *  Credit: Azhar22
 *  @see https://github.com/azhar22k/ourl/blob/master/index.js
 */
const getPlatformSpecificCommand = (): [string] | [string, string[]] => {
	const isGitPod = Boolean(process.env.GITPOD_REPO_ROOT);
	const platform = isGitPod ? 'gitpod' : process.platform;

	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (platform) {
		case 'android':
		case 'linux':
			return ['xdg-open'];
		case 'darwin':
			return ['open'];
		case 'win32':
			return ['cmd', ['/c', 'start']];
		case 'gitpod':
			return ['/ide/bin/remote-cli/gitpod-code', ['--openExternal']];
		default:
			throw new Error(
				`It looks like your platform ("${platform}") isn't supported!\nTo view Astro's docs, please visit https://docs.astro.build`,
			);
	}
};

export async function openInBrowser(url: string): Promise<Result> {
	const [command, args = []] = getPlatformSpecificCommand();
	return exec(command, [...args, encodeURI(url)]);
}
