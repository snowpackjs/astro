import * as path from 'path';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

let docClient: lsp.LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
    docClient = createLanguageService(context, 'doc', 'astro-doc', 'Astro - Document', 6040, true);

    startEmbeddedLanguageServices();
}


function createLanguageService(context: vscode.ExtensionContext, mode: 'api' | 'doc' | 'html', id: string, name: string, port: number, fileOnly: boolean) {

	const serverModule = context.asAbsolutePath(path.join('node_modules', '@astro-vscode', 'server', 'out', 'index.js'));
	const debugOptions = { execArgv: ['--nolazy', '--inspect=' + port] };
	const serverOptions: lsp.ServerOptions = {
		run: { module: serverModule, transport: lsp.TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: lsp.TransportKind.ipc,
			options: debugOptions
		},
	};
	const serverInitOptions: any = {
		mode: mode,
		appRoot: vscode.env.appRoot,
		language: vscode.env.language,
		config: {
			'astro.style.defaultLanguage': vscode.workspace.getConfiguration('astro').get<string>('style.defaultLanguage'),
		},
	};
	const clientOptions: lsp.LanguageClientOptions = {
		documentSelector: fileOnly ?
			[
				{ scheme: 'file', language: 'vue' },
				{ scheme: 'file', language: 'javascript' },
				{ scheme: 'file', language: 'typescript' },
				{ scheme: 'file', language: 'javascriptreact' },
				{ scheme: 'file', language: 'typescriptreact' },
			] : [
				{ language: 'vue' },
				{ language: 'javascript' },
				{ language: 'typescript' },
				{ language: 'javascriptreact' },
				{ language: 'typescriptreact' },
			],
		initializationOptions: serverInitOptions,
	};
	const client = new lsp.LanguageClient(
		id,
		name,
		serverOptions,
		clientOptions,
	);
	context.subscriptions.push(client.start());

	return client;
}

async function startEmbeddedLanguageServices() {
	const ts = vscode.extensions.getExtension('vscode.typescript-language-features');
	const css = vscode.extensions.getExtension('vscode.css-language-features');
	const html = vscode.extensions.getExtension('vscode.html-language-features');

	if (ts && !ts.isActive) {
		await ts.activate();
	}
	if (css && !css.isActive) {
		await css.activate();
	}
	if (html && !html.isActive) {
		await html.activate();
	}

	/* from html-language-features */
	const EMPTY_ELEMENTS: string[] = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];
	vscode.languages.setLanguageConfiguration('astro', {
		indentationRules: {
			increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
			decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
				action: { indentAction: vscode.IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:${EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				action: { indentAction: vscode.IndentAction.Indent }
			}
		],
	});
}
