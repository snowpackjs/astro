import { execSync } from 'node:child_process';
import type { BinaryLike } from 'node:crypto';
import { createHash } from 'node:crypto';
import detectPackageManager from 'which-pm-runs';

/**
 * Astro Telemetry -- Project Info
 *
 * To better understand our telemetry insights, Astro attempts to create an anonymous identifier
 * for each Astro project. This value is meant to be unique to each project but common across
 * multiple different users on the same project.
 *
 * To do this, we generate a unique, anonymous hash from your working git repository data. This is
 * ideal because git data is shared across all users on the same repository, but the data itself
 * that we generate our hash from does not contain any personal or otherwise identifying information.
 *
 * We do not use your repository's remote URL, GitHub URL, or any other personally identifying
 * information to generate the project identifier hash. In this way it is almost completely anonymous.
 *
 * If you are running Astro outside of a git repository, then we will generate a unique, anonymous project
 * identifier by hashing your project's file path on your machine.
 *
 * ~~~
 *
 * Q: Can this project identifier be traced back to me?
 *
 * A: If your repository is private, there is no way for anyone to trace your unique
 * project identifier back to you, your organization, or your project. This is because it is itself
 * a hash of a commit hash, and a commit hash does not include any identifying information.
 *
 * If your repository is publicly available, then it is possible for someone to generate this unique
 * project identifier themselves by cloning your repo. Specifically, someone would need access to run
 * the `git rev-list` command below to generate this hash. Without this access, it is impossible to
 * trace the project identifier back to you or your project.
 *
 * If you are running Astro outside of a git repository, then the project identifier could be matched
 * back to the exact file path on your machine. It is unlikely (but still possible) for this to happen
 * without access to your machine or knowledge of your machine's file system.
 *
 * ~~~
 *
 * Q: I don't want Astro to collect a project identifier. How can I disable it?
 *
 * A: You can disable telemetry completely at any time by running `astro telemetry disable`. There is
 * currently no way to disable just this identifier while keeping the rest of telemetry enabled.
 */

export interface ProjectInfo {
	/* Your unique project identifier. This will be hashed again before sending. */
	anonymousProjectId: string | undefined;
	/* true if your project is connected to a git repository. false otherwise. */
	isGit: boolean;
	/* The package manager used to run Astro */
	packageManager: string | undefined;
	/* The version of the package manager used to run Astro */
	packageManagerVersion: string | undefined;
}

function createAnonymousValue(payload: BinaryLike): string {
	// We use empty string to represent an empty value. Avoid hashing this
	// since that would create a real hash and remove its "empty" meaning.
	if (payload === '') {
		return payload;
	}
	// Otherwise, create a new hash from the payload and return it.
	const hash = createHash('sha256');
	hash.update(payload);
	return hash.digest('hex');
}

function getProjectIdFromGit(): string | null {
	try {
		const originBuffer = execSync(`git rev-list --max-parents=0 HEAD`, {
			timeout: 500,
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		return String(originBuffer).trim();
	} catch (_) {
		return null;
	}
}

function getProjectId(isCI: boolean): Pick<ProjectInfo, 'anonymousProjectId' | 'isGit'> {
	const projectIdFromGit = getProjectIdFromGit();
	if (projectIdFromGit) {
		return {
			isGit: true,
			anonymousProjectId: createAnonymousValue(projectIdFromGit),
		};
	}
	// If we're running in CI, the current working directory is not unique.
	// If the cwd is a single level deep (ex: '/app'), it's probably not unique.
	const cwd = process.cwd();
	const isCwdGeneric = (cwd.match(/[/|\\]/g) || []).length === 1;
	if (isCI || isCwdGeneric) {
		return {
			isGit: false,
			anonymousProjectId: undefined,
		};
	}
	return {
		isGit: false,
		anonymousProjectId: createAnonymousValue(cwd),
	};
}

export function getProjectInfo(isCI: boolean): ProjectInfo {
	const projectId = getProjectId(isCI);
	const packageManager = detectPackageManager();
	return {
		...projectId,
		packageManager: packageManager?.name,
		packageManagerVersion: packageManager?.version,
	};
}
//
