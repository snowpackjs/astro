import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename } from 'node:path';
import {
	MISSING_SESSION_ID_ERROR,
	PROJECT_ID_FILE,
	getAstroStudioUrl,
	getSessionIdFromFile,
} from '@astrojs/studio';
import { slug } from 'github-slugger';
import { bgRed, cyan } from 'kleur/colors';
import prompts from 'prompts';
import yoctoSpinner from 'yocto-spinner';
import { safeFetch } from '../../../../runtime/utils.js';
import type { Result } from '../../../utils.js';

export async function cmd() {
	const sessionToken = await getSessionIdFromFile();
	if (!sessionToken) {
		console.error(MISSING_SESSION_ID_ERROR);
		process.exit(1);
	}
	await promptBegin();
	const isLinkExisting = await promptLinkExisting();
	if (isLinkExisting) {
		const workspaceId = await promptWorkspace(sessionToken);
		const existingProjectData = await promptExistingProjectName({ workspaceId });
		return await linkProject(existingProjectData.id);
	}

	const isLinkNew = await promptLinkNew();
	if (isLinkNew) {
		const workspaceId = await promptWorkspace(sessionToken);
		const newProjectName = await promptNewProjectName();
		const newProjectRegion = await promptNewProjectRegion();
		const spinner = yoctoSpinner({ text: 'Creating new project...' }).start();
		const newProjectData = await createNewProject({
			workspaceId,
			name: newProjectName,
			region: newProjectRegion,
		});
		// TODO(fks): Actually listen for project creation before continuing
		// This is just a dumb spinner that roughly matches database creation time.
		await new Promise((r) => setTimeout(r, 4000));
		spinner.success('Project created!');
		return await linkProject(newProjectData.id);
	}
}

async function linkProject(id: string) {
	await mkdir(new URL('.', PROJECT_ID_FILE), { recursive: true });
	await writeFile(PROJECT_ID_FILE, `${id}`);
	console.info('Project linked.');
}

async function getWorkspaces(sessionToken: string) {
	const linkUrl = new URL(getAstroStudioUrl() + '/api/cli/workspaces.list');
	const response = await safeFetch(
		linkUrl,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${sessionToken}`,
				'Content-Type': 'application/json',
			},
		},
		(res) => {
			// Unauthorized
			if (res.status === 401) {
				throw new Error(
					`${bgRed('Unauthorized')}\n\n  Are you logged in?\n  Run ${cyan(
						'astro login',
					)} to authenticate and then try linking again.\n\n`,
				);
			}
			throw new Error(`Failed to fetch user workspace: ${res.status} ${res.statusText}`);
		},
	);

	const { data, success } = (await response.json()) as Result<{ id: string; name: string }[]>;
	if (!success) {
		throw new Error(`Failed to fetch user's workspace.`);
	}
	return data;
}

/**
 * Get the workspace ID to link to.
 * Prompts the user to choose if they have more than one workspace in Astro Studio.
 * @returns A `Promise` for the workspace ID to use.
 */
async function promptWorkspace(sessionToken: string) {
	const workspaces = await getWorkspaces(sessionToken);
	if (workspaces.length === 0) {
		console.error('No workspaces found.');
		process.exit(1);
	}

	if (workspaces.length === 1) {
		return workspaces[0].id;
	}

	const { workspaceId } = await prompts({
		type: 'autocomplete',
		name: 'workspaceId',
		message: 'Select your workspace:',
		limit: 5,
		choices: workspaces.map((w) => ({ title: w.name, value: w.id })),
	});
	if (typeof workspaceId !== 'string') {
		console.log('Canceled.');
		process.exit(0);
	}
	return workspaceId;
}

export async function createNewProject({
	workspaceId,
	name,
	region,
}: {
	workspaceId: string;
	name: string;
	region: string;
}) {
	const linkUrl = new URL(getAstroStudioUrl() + '/api/cli/projects.create');
	const response = await safeFetch(
		linkUrl,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${await getSessionIdFromFile()}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ workspaceId, name, region }),
		},
		(res) => {
			// Unauthorized
			if (res.status === 401) {
				console.error(
					`${bgRed('Unauthorized')}\n\n  Are you logged in?\n  Run ${cyan(
						'astro login',
					)} to authenticate and then try linking again.\n\n`,
				);
				process.exit(1);
			}
			console.error(`Failed to create project: ${res.status} ${res.statusText}`);
			process.exit(1);
		},
	);

	const { data, success } = (await response.json()) as Result<{ id: string; idName: string }>;
	if (!success) {
		console.error(`Failed to create project.`);
		process.exit(1);
	}
	return { id: data.id, idName: data.idName };
}

export async function promptExistingProjectName({ workspaceId }: { workspaceId: string }) {
	const linkUrl = new URL(getAstroStudioUrl() + '/api/cli/projects.list');
	const response = await safeFetch(
		linkUrl,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${await getSessionIdFromFile()}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ workspaceId }),
		},
		(res) => {
			if (res.status === 401) {
				console.error(
					`${bgRed('Unauthorized')}\n\n  Are you logged in?\n  Run ${cyan(
						'astro login',
					)} to authenticate and then try linking again.\n\n`,
				);
				process.exit(1);
			}
			console.error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
			process.exit(1);
		},
	);

	const { data, success } = (await response.json()) as Result<
		{ id: string; name: string; idName: string }[]
	>;
	if (!success) {
		console.error(`Failed to fetch projects.`);
		process.exit(1);
	}
	const { projectId } = await prompts({
		type: 'autocomplete',
		name: 'projectId',
		message: 'What is your project name?',
		limit: 5,
		choices: data.map((p) => ({ title: p.name, value: p.id })),
	});
	if (typeof projectId !== 'string') {
		console.log('Canceled.');
		process.exit(0);
	}
	const selectedProjectData = data.find((p: any) => p.id === projectId)!;
	return selectedProjectData;
}

export async function promptBegin(): Promise<void> {
	// Get the current working directory relative to the user's home directory
	const prettyCwd = process.cwd().replace(homedir(), '~');

	// prompt
	const { begin } = await prompts({
		type: 'confirm',
		name: 'begin',
		message: `Link "${prettyCwd}" with Astro Studio?`,
		initial: true,
	});
	if (!begin) {
		console.log('Canceled.');
		process.exit(0);
	}
}

/**
 * Ask the user if they want to link to an existing Astro Studio project.
 * @returns A `Promise` for the user’s answer: `true` if they answer yes, otherwise `false`.
 */
export async function promptLinkExisting(): Promise<boolean> {
	// prompt
	const { linkExisting } = await prompts({
		type: 'confirm',
		name: 'linkExisting',
		message: `Link with an existing project in Astro Studio?`,
		initial: true,
	});
	return !!linkExisting;
}

/**
 * Ask the user if they want to link to a new Astro Studio Project.
 * **Exits the process if they answer no.**
 * @returns A `Promise` for the user’s answer: `true` if they answer yes.
 */
export async function promptLinkNew(): Promise<boolean> {
	// prompt
	const { linkNew } = await prompts({
		type: 'confirm',
		name: 'linkNew',
		message: `Create a new project in Astro Studio?`,
		initial: true,
	});
	if (!linkNew) {
		console.log('Canceled.');
		process.exit(0);
	}
	return true;
}

export async function promptNewProjectName(): Promise<string> {
	const { newProjectName } = await prompts({
		type: 'text',
		name: 'newProjectName',
		message: `What is your new project's name?`,
		initial: basename(process.cwd()),
		format: (val) => slug(val),
	});
	if (!newProjectName) {
		console.log('Canceled.');
		process.exit(0);
	}
	return newProjectName;
}

export async function promptNewProjectRegion(): Promise<string> {
	const { newProjectRegion } = await prompts({
		type: 'select',
		name: 'newProjectRegion',
		message: `Where should your new database live?`,
		choices: [
			{ title: 'North America (East)', value: 'NorthAmericaEast' },
			{ title: 'North America (West)', value: 'NorthAmericaWest' },
			{ title: 'Europe (Amsterdam)', value: 'EuropeCentral' },
			{ title: 'South America (Brazil)', value: 'SouthAmericaEast' },
			{ title: 'Asia (India)', value: 'AsiaSouth' },
			{ title: 'Asia (Japan)', value: 'AsiaNorthEast' },
		],
		initial: 0,
	});
	if (!newProjectRegion) {
		console.log('Canceled.');
		process.exit(0);
	}
	return newProjectRegion;
}
