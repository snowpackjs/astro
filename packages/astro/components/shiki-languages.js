/**
 * This file is prebuilt from packages/astro/scripts/shiki-gen-languages.mjs
 * Do not edit this directly, but instead edit that file and rerun it to generate this file.
 */

import { BUNDLED_LANGUAGES } from 'shiki';

function handleLang(mod) {
	const lang = BUNDLED_LANGUAGES.find((l) => l.id === mod.default);
	if (lang) {
		return {
			...lang,
			grammar,
		};
	} else {
		return undefined;
	}
}

export const languages = {
	'abap': () => import('shiki/languages/abap.tmLanguage.json').then(handleLang),
	'actionscript-3': () => import('shiki/languages/actionscript-3.tmLanguage.json').then(handleLang),
	'ada': () => import('shiki/languages/ada.tmLanguage.json').then(handleLang),
	'apache': () => import('shiki/languages/apache.tmLanguage.json').then(handleLang),
	'apex': () => import('shiki/languages/apex.tmLanguage.json').then(handleLang),
	'apl': () => import('shiki/languages/apl.tmLanguage.json').then(handleLang),
	'applescript': () => import('shiki/languages/applescript.tmLanguage.json').then(handleLang),
	'ara': () => import('shiki/languages/ara.tmLanguage.json').then(handleLang),
	'asm': () => import('shiki/languages/asm.tmLanguage.json').then(handleLang),
	'astro': () => import('shiki/languages/astro.tmLanguage.json').then(handleLang),
	'awk': () => import('shiki/languages/awk.tmLanguage.json').then(handleLang),
	'ballerina': () => import('shiki/languages/ballerina.tmLanguage.json').then(handleLang),
	'bat': () => import('shiki/languages/bat.tmLanguage.json').then(handleLang),
	'berry': () => import('shiki/languages/berry.tmLanguage.json').then(handleLang),
	'bibtex': () => import('shiki/languages/bibtex.tmLanguage.json').then(handleLang),
	'bicep': () => import('shiki/languages/bicep.tmLanguage.json').then(handleLang),
	'blade': () => import('shiki/languages/blade.tmLanguage.json').then(handleLang),
	'c': () => import('shiki/languages/c.tmLanguage.json').then(handleLang),
	'cadence': () => import('shiki/languages/cadence.tmLanguage.json').then(handleLang),
	'clarity': () => import('shiki/languages/clarity.tmLanguage.json').then(handleLang),
	'clojure': () => import('shiki/languages/clojure.tmLanguage.json').then(handleLang),
	'cmake': () => import('shiki/languages/cmake.tmLanguage.json').then(handleLang),
	'cobol': () => import('shiki/languages/cobol.tmLanguage.json').then(handleLang),
	'codeql': () => import('shiki/languages/codeql.tmLanguage.json').then(handleLang),
	'coffee': () => import('shiki/languages/coffee.tmLanguage.json').then(handleLang),
	'cpp-macro': () => import('shiki/languages/cpp-macro.tmLanguage.json').then(handleLang),
	'cpp': () => import('shiki/languages/cpp.tmLanguage.json').then(handleLang),
	'crystal': () => import('shiki/languages/crystal.tmLanguage.json').then(handleLang),
	'csharp': () => import('shiki/languages/csharp.tmLanguage.json').then(handleLang),
	'css': () => import('shiki/languages/css.tmLanguage.json').then(handleLang),
	'cue': () => import('shiki/languages/cue.tmLanguage.json').then(handleLang),
	'd': () => import('shiki/languages/d.tmLanguage.json').then(handleLang),
	'dart': () => import('shiki/languages/dart.tmLanguage.json').then(handleLang),
	'dax': () => import('shiki/languages/dax.tmLanguage.json').then(handleLang),
	'diff': () => import('shiki/languages/diff.tmLanguage.json').then(handleLang),
	'docker': () => import('shiki/languages/docker.tmLanguage.json').then(handleLang),
	'dream-maker': () => import('shiki/languages/dream-maker.tmLanguage.json').then(handleLang),
	'elixir': () => import('shiki/languages/elixir.tmLanguage.json').then(handleLang),
	'elm': () => import('shiki/languages/elm.tmLanguage.json').then(handleLang),
	'erb': () => import('shiki/languages/erb.tmLanguage.json').then(handleLang),
	'erlang': () => import('shiki/languages/erlang.tmLanguage.json').then(handleLang),
	'fish': () => import('shiki/languages/fish.tmLanguage.json').then(handleLang),
	'fsharp': () => import('shiki/languages/fsharp.tmLanguage.json').then(handleLang),
	'gherkin': () => import('shiki/languages/gherkin.tmLanguage.json').then(handleLang),
	'git-commit': () => import('shiki/languages/git-commit.tmLanguage.json').then(handleLang),
	'git-rebase': () => import('shiki/languages/git-rebase.tmLanguage.json').then(handleLang),
	'glsl': () => import('shiki/languages/glsl.tmLanguage.json').then(handleLang),
	'gnuplot': () => import('shiki/languages/gnuplot.tmLanguage.json').then(handleLang),
	'go': () => import('shiki/languages/go.tmLanguage.json').then(handleLang),
	'graphql': () => import('shiki/languages/graphql.tmLanguage.json').then(handleLang),
	'groovy': () => import('shiki/languages/groovy.tmLanguage.json').then(handleLang),
	'hack': () => import('shiki/languages/hack.tmLanguage.json').then(handleLang),
	'haml': () => import('shiki/languages/haml.tmLanguage.json').then(handleLang),
	'handlebars': () => import('shiki/languages/handlebars.tmLanguage.json').then(handleLang),
	'haskell': () => import('shiki/languages/haskell.tmLanguage.json').then(handleLang),
	'hcl': () => import('shiki/languages/hcl.tmLanguage.json').then(handleLang),
	'hlsl': () => import('shiki/languages/hlsl.tmLanguage.json').then(handleLang),
	'html': () => import('shiki/languages/html.tmLanguage.json').then(handleLang),
	'http': () => import('shiki/languages/http.tmLanguage.json').then(handleLang),
	'imba': () => import('shiki/languages/imba.tmLanguage.json').then(handleLang),
	'ini': () => import('shiki/languages/ini.tmLanguage.json').then(handleLang),
	'java': () => import('shiki/languages/java.tmLanguage.json').then(handleLang),
	'javascript': () => import('shiki/languages/javascript.tmLanguage.json').then(handleLang),
	'jinja-html': () => import('shiki/languages/jinja-html.tmLanguage.json').then(handleLang),
	'jinja': () => import('shiki/languages/jinja.tmLanguage.json').then(handleLang),
	'jison': () => import('shiki/languages/jison.tmLanguage.json').then(handleLang),
	'json': () => import('shiki/languages/json.tmLanguage.json').then(handleLang),
	'json5': () => import('shiki/languages/json5.tmLanguage.json').then(handleLang),
	'jsonc': () => import('shiki/languages/jsonc.tmLanguage.json').then(handleLang),
	'jsonnet': () => import('shiki/languages/jsonnet.tmLanguage.json').then(handleLang),
	'jssm': () => import('shiki/languages/jssm.tmLanguage.json').then(handleLang),
	'jsx': () => import('shiki/languages/jsx.tmLanguage.json').then(handleLang),
	'julia': () => import('shiki/languages/julia.tmLanguage.json').then(handleLang),
	'kotlin': () => import('shiki/languages/kotlin.tmLanguage.json').then(handleLang),
	'latex': () => import('shiki/languages/latex.tmLanguage.json').then(handleLang),
	'less': () => import('shiki/languages/less.tmLanguage.json').then(handleLang),
	'liquid': () => import('shiki/languages/liquid.tmLanguage.json').then(handleLang),
	'lisp': () => import('shiki/languages/lisp.tmLanguage.json').then(handleLang),
	'logo': () => import('shiki/languages/logo.tmLanguage.json').then(handleLang),
	'lua': () => import('shiki/languages/lua.tmLanguage.json').then(handleLang),
	'make': () => import('shiki/languages/make.tmLanguage.json').then(handleLang),
	'markdown': () => import('shiki/languages/markdown.tmLanguage.json').then(handleLang),
	'marko': () => import('shiki/languages/marko.tmLanguage.json').then(handleLang),
	'matlab': () => import('shiki/languages/matlab.tmLanguage.json').then(handleLang),
	'mdx': () => import('shiki/languages/mdx.tmLanguage.json').then(handleLang),
	'mermaid': () => import('shiki/languages/mermaid.tmLanguage.json').then(handleLang),
	'nginx': () => import('shiki/languages/nginx.tmLanguage.json').then(handleLang),
	'nim': () => import('shiki/languages/nim.tmLanguage.json').then(handleLang),
	'nix': () => import('shiki/languages/nix.tmLanguage.json').then(handleLang),
	'objective-c': () => import('shiki/languages/objective-c.tmLanguage.json').then(handleLang),
	'objective-cpp': () => import('shiki/languages/objective-cpp.tmLanguage.json').then(handleLang),
	'ocaml': () => import('shiki/languages/ocaml.tmLanguage.json').then(handleLang),
	'pascal': () => import('shiki/languages/pascal.tmLanguage.json').then(handleLang),
	'perl': () => import('shiki/languages/perl.tmLanguage.json').then(handleLang),
	'php-html': () => import('shiki/languages/php-html.tmLanguage.json').then(handleLang),
	'php': () => import('shiki/languages/php.tmLanguage.json').then(handleLang),
	'plsql': () => import('shiki/languages/plsql.tmLanguage.json').then(handleLang),
	'postcss': () => import('shiki/languages/postcss.tmLanguage.json').then(handleLang),
	'powerquery': () => import('shiki/languages/powerquery.tmLanguage.json').then(handleLang),
	'powershell': () => import('shiki/languages/powershell.tmLanguage.json').then(handleLang),
	'prisma': () => import('shiki/languages/prisma.tmLanguage.json').then(handleLang),
	'prolog': () => import('shiki/languages/prolog.tmLanguage.json').then(handleLang),
	'proto': () => import('shiki/languages/proto.tmLanguage.json').then(handleLang),
	'pug': () => import('shiki/languages/pug.tmLanguage.json').then(handleLang),
	'puppet': () => import('shiki/languages/puppet.tmLanguage.json').then(handleLang),
	'purescript': () => import('shiki/languages/purescript.tmLanguage.json').then(handleLang),
	'python': () => import('shiki/languages/python.tmLanguage.json').then(handleLang),
	'r': () => import('shiki/languages/r.tmLanguage.json').then(handleLang),
	'raku': () => import('shiki/languages/raku.tmLanguage.json').then(handleLang),
	'razor': () => import('shiki/languages/razor.tmLanguage.json').then(handleLang),
	'rel': () => import('shiki/languages/rel.tmLanguage.json').then(handleLang),
	'riscv': () => import('shiki/languages/riscv.tmLanguage.json').then(handleLang),
	'rst': () => import('shiki/languages/rst.tmLanguage.json').then(handleLang),
	'ruby': () => import('shiki/languages/ruby.tmLanguage.json').then(handleLang),
	'rust': () => import('shiki/languages/rust.tmLanguage.json').then(handleLang),
	'sas': () => import('shiki/languages/sas.tmLanguage.json').then(handleLang),
	'sass': () => import('shiki/languages/sass.tmLanguage.json').then(handleLang),
	'scala': () => import('shiki/languages/scala.tmLanguage.json').then(handleLang),
	'scheme': () => import('shiki/languages/scheme.tmLanguage.json').then(handleLang),
	'scss': () => import('shiki/languages/scss.tmLanguage.json').then(handleLang),
	'shaderlab': () => import('shiki/languages/shaderlab.tmLanguage.json').then(handleLang),
	'shellscript': () => import('shiki/languages/shellscript.tmLanguage.json').then(handleLang),
	'smalltalk': () => import('shiki/languages/smalltalk.tmLanguage.json').then(handleLang),
	'solidity': () => import('shiki/languages/solidity.tmLanguage.json').then(handleLang),
	'sparql': () => import('shiki/languages/sparql.tmLanguage.json').then(handleLang),
	'sql': () => import('shiki/languages/sql.tmLanguage.json').then(handleLang),
	'ssh-config': () => import('shiki/languages/ssh-config.tmLanguage.json').then(handleLang),
	'stata': () => import('shiki/languages/stata.tmLanguage.json').then(handleLang),
	'stylus': () => import('shiki/languages/stylus.tmLanguage.json').then(handleLang),
	'svelte': () => import('shiki/languages/svelte.tmLanguage.json').then(handleLang),
	'swift': () => import('shiki/languages/swift.tmLanguage.json').then(handleLang),
	'system-verilog': () => import('shiki/languages/system-verilog.tmLanguage.json').then(handleLang),
	'tasl': () => import('shiki/languages/tasl.tmLanguage.json').then(handleLang),
	'tcl': () => import('shiki/languages/tcl.tmLanguage.json').then(handleLang),
	'tex': () => import('shiki/languages/tex.tmLanguage.json').then(handleLang),
	'toml': () => import('shiki/languages/toml.tmLanguage.json').then(handleLang),
	'tsx': () => import('shiki/languages/tsx.tmLanguage.json').then(handleLang),
	'turtle': () => import('shiki/languages/turtle.tmLanguage.json').then(handleLang),
	'twig': () => import('shiki/languages/twig.tmLanguage.json').then(handleLang),
	'typescript': () => import('shiki/languages/typescript.tmLanguage.json').then(handleLang),
	'v': () => import('shiki/languages/v.tmLanguage.json').then(handleLang),
	'vb': () => import('shiki/languages/vb.tmLanguage.json').then(handleLang),
	'verilog': () => import('shiki/languages/verilog.tmLanguage.json').then(handleLang),
	'vhdl': () => import('shiki/languages/vhdl.tmLanguage.json').then(handleLang),
	'viml': () => import('shiki/languages/viml.tmLanguage.json').then(handleLang),
	'vue-html': () => import('shiki/languages/vue-html.tmLanguage.json').then(handleLang),
	'vue': () => import('shiki/languages/vue.tmLanguage.json').then(handleLang),
	'wasm': () => import('shiki/languages/wasm.tmLanguage.json').then(handleLang),
	'wenyan': () => import('shiki/languages/wenyan.tmLanguage.json').then(handleLang),
	'wgsl': () => import('shiki/languages/wgsl.tmLanguage.json').then(handleLang),
	'xml': () => import('shiki/languages/xml.tmLanguage.json').then(handleLang),
	'xsl': () => import('shiki/languages/xsl.tmLanguage.json').then(handleLang),
	'yaml': () => import('shiki/languages/yaml.tmLanguage.json').then(handleLang),
	'zenscript': () => import('shiki/languages/zenscript.tmLanguage.json').then(handleLang),
};
