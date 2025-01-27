import { existsSync } from 'node:fs';
import { build } from 'esbuild';

const CLIENT_RUNTIME_PATH = 'packages/astro/src/runtime/client/';

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default async function checkBundleSize({ github, context }) {
	const PR_NUM = context.payload.pull_request.number;
	const SHA = context.payload.pull_request.head.sha;

	const { data: files } = await github.rest.pulls.listFiles({
		...context.repo,
		pull_number: PR_NUM,
	});
	const clientRuntimeFiles = files.filter((file) => {
		return file.filename.startsWith(CLIENT_RUNTIME_PATH) && file.status !== 'removed';
	});
	if (clientRuntimeFiles.length === 0) return;

	const table = [
		'| File | Old Size | New Size | Change |',
		'| ---- | -------- | -------- | ------ |',
	];
	const output = await bundle(clientRuntimeFiles);

	for (let [filename, { oldSize, newSize, sourceFile }] of Object.entries(output)) {
		filename = ['idle', 'load', 'media', 'only', 'visible'].includes(filename)
			? `client:${filename}`
			: filename;
		const prefix = newSize - oldSize === 0 ? '' : newSize - oldSize > 0 ? '+ ' : '- ';
		const change = `${prefix}${formatBytes(newSize - oldSize)}`;
		table.push(
			`| [\`${filename}\`](https://github.com/${context.repo.owner}/${context.repo.repo}/tree/${context.payload.pull_request.head.ref}/${sourceFile}) | ${formatBytes(oldSize)} | ${formatBytes(newSize)} | ${change} |`,
		);
	}

	const { data: comments } = await github.rest.issues.listComments({
		...context.repo,
		issue_number: PR_NUM,
	});
	const comment = comments.find(
		(comment) =>
			comment.user.login === 'github-actions[bot]' && comment.body.includes('Bundle Size Check'),
	);
	const method = comment ? 'updateComment' : 'createComment';
	const payload = comment ? { comment_id: comment.id } : { issue_number: PR_NUM };
	await github.rest.issues[method]({
		...context.repo,
		...payload,
		body: `###  ⚖️  Bundle Size Check

Latest commit: ${SHA}

${table.join('\n')}`,
	});
}

async function bundle(files) {
	const { metafile } = await build({
		entryPoints: [
			...files.map(({ filename }) => filename),
			...files.map(({ filename }) => `main/${filename}`).filter((f) => existsSync(f)),
		],
		bundle: true,
		minify: true,
		sourcemap: false,
		target: ['es2018'],
		outdir: 'out',
		external: ['astro:*', 'aria-query', 'axobject-query'],
		metafile: true,
	});

	return Object.entries(metafile.outputs).reduce((acc, [filename, info]) => {
		filename = filename.slice('out/'.length);
		if (filename.startsWith('main/')) {
			filename = filename.slice('main/'.length).replace(CLIENT_RUNTIME_PATH, '').replace('.js', '');
			const oldSize = info.bytes;
			return Object.assign(acc, {
				[filename]: Object.assign(acc[filename] ?? { oldSize: 0, newSize: 0 }, { oldSize }),
			});
		}
		filename = filename.replace(CLIENT_RUNTIME_PATH, '').replace('.js', '');
		const newSize = info.bytes;
		return Object.assign(acc, {
			[filename]: Object.assign(acc[filename] ?? { oldSize: 0, newSize: 0 }, {
				newSize,
				sourceFile: Object.keys(info.inputs).find((src) => src.endsWith('.ts')),
			}),
		});
	}, {});
}
