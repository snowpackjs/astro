/**
 * This file is prebuilt from packages/astro/scripts/shiki-gen-languages.mjs
 * Do not edit this directly, but instead edit that file and rerun it to generate this file.
 */

import { BUNDLED_LANGUAGES } from 'shiki';

function handleLang(grammar, lang) {
	const lang = BUNDLED_LANGUAGES.find((l) => l.id === lang);
	if (lang) {
		return {
			...lang,
			grammar,
		};
	} else {
		return undefined;
	}
}

// prettier-ignore
export const languages = {
	'abap': () => import('shiki/languages/abap.tmLanguage.json').then((mod) => handleLang(mod.default, 'abap')),
	'actionscript-3': () => import('shiki/languages/actionscript-3.tmLanguage.json').then((mod) => handleLang(mod.default, 'actionscript-3')),
	'ada': () => import('shiki/languages/ada.tmLanguage.json').then((mod) => handleLang(mod.default, 'ada')),
	'apache': () => import('shiki/languages/apache.tmLanguage.json').then((mod) => handleLang(mod.default, 'apache')),
	'apex': () => import('shiki/languages/apex.tmLanguage.json').then((mod) => handleLang(mod.default, 'apex')),
	'apl': () => import('shiki/languages/apl.tmLanguage.json').then((mod) => handleLang(mod.default, 'apl')),
	'applescript': () => import('shiki/languages/applescript.tmLanguage.json').then((mod) => handleLang(mod.default, 'applescript')),
	'ara': () => import('shiki/languages/ara.tmLanguage.json').then((mod) => handleLang(mod.default, 'ara')),
	'asm': () => import('shiki/languages/asm.tmLanguage.json').then((mod) => handleLang(mod.default, 'asm')),
	'astro': () => import('shiki/languages/astro.tmLanguage.json').then((mod) => handleLang(mod.default, 'astro')),
	'awk': () => import('shiki/languages/awk.tmLanguage.json').then((mod) => handleLang(mod.default, 'awk')),
	'ballerina': () => import('shiki/languages/ballerina.tmLanguage.json').then((mod) => handleLang(mod.default, 'ballerina')),
	'bat': () => import('shiki/languages/bat.tmLanguage.json').then((mod) => handleLang(mod.default, 'bat')),
	'berry': () => import('shiki/languages/berry.tmLanguage.json').then((mod) => handleLang(mod.default, 'berry')),
	'bibtex': () => import('shiki/languages/bibtex.tmLanguage.json').then((mod) => handleLang(mod.default, 'bibtex')),
	'bicep': () => import('shiki/languages/bicep.tmLanguage.json').then((mod) => handleLang(mod.default, 'bicep')),
	'blade': () => import('shiki/languages/blade.tmLanguage.json').then((mod) => handleLang(mod.default, 'blade')),
	'c': () => import('shiki/languages/c.tmLanguage.json').then((mod) => handleLang(mod.default, 'c')),
	'cadence': () => import('shiki/languages/cadence.tmLanguage.json').then((mod) => handleLang(mod.default, 'cadence')),
	'clarity': () => import('shiki/languages/clarity.tmLanguage.json').then((mod) => handleLang(mod.default, 'clarity')),
	'clojure': () => import('shiki/languages/clojure.tmLanguage.json').then((mod) => handleLang(mod.default, 'clojure')),
	'cmake': () => import('shiki/languages/cmake.tmLanguage.json').then((mod) => handleLang(mod.default, 'cmake')),
	'cobol': () => import('shiki/languages/cobol.tmLanguage.json').then((mod) => handleLang(mod.default, 'cobol')),
	'codeql': () => import('shiki/languages/codeql.tmLanguage.json').then((mod) => handleLang(mod.default, 'codeql')),
	'coffee': () => import('shiki/languages/coffee.tmLanguage.json').then((mod) => handleLang(mod.default, 'coffee')),
	'cpp-macro': () => import('shiki/languages/cpp-macro.tmLanguage.json').then((mod) => handleLang(mod.default, 'cpp-macro')),
	'cpp': () => import('shiki/languages/cpp.tmLanguage.json').then((mod) => handleLang(mod.default, 'cpp')),
	'crystal': () => import('shiki/languages/crystal.tmLanguage.json').then((mod) => handleLang(mod.default, 'crystal')),
	'csharp': () => import('shiki/languages/csharp.tmLanguage.json').then((mod) => handleLang(mod.default, 'csharp')),
	'css': () => import('shiki/languages/css.tmLanguage.json').then((mod) => handleLang(mod.default, 'css')),
	'cue': () => import('shiki/languages/cue.tmLanguage.json').then((mod) => handleLang(mod.default, 'cue')),
	'd': () => import('shiki/languages/d.tmLanguage.json').then((mod) => handleLang(mod.default, 'd')),
	'dart': () => import('shiki/languages/dart.tmLanguage.json').then((mod) => handleLang(mod.default, 'dart')),
	'dax': () => import('shiki/languages/dax.tmLanguage.json').then((mod) => handleLang(mod.default, 'dax')),
	'diff': () => import('shiki/languages/diff.tmLanguage.json').then((mod) => handleLang(mod.default, 'diff')),
	'docker': () => import('shiki/languages/docker.tmLanguage.json').then((mod) => handleLang(mod.default, 'docker')),
	'dream-maker': () => import('shiki/languages/dream-maker.tmLanguage.json').then((mod) => handleLang(mod.default, 'dream-maker')),
	'elixir': () => import('shiki/languages/elixir.tmLanguage.json').then((mod) => handleLang(mod.default, 'elixir')),
	'elm': () => import('shiki/languages/elm.tmLanguage.json').then((mod) => handleLang(mod.default, 'elm')),
	'erb': () => import('shiki/languages/erb.tmLanguage.json').then((mod) => handleLang(mod.default, 'erb')),
	'erlang': () => import('shiki/languages/erlang.tmLanguage.json').then((mod) => handleLang(mod.default, 'erlang')),
	'fish': () => import('shiki/languages/fish.tmLanguage.json').then((mod) => handleLang(mod.default, 'fish')),
	'fsharp': () => import('shiki/languages/fsharp.tmLanguage.json').then((mod) => handleLang(mod.default, 'fsharp')),
	'gherkin': () => import('shiki/languages/gherkin.tmLanguage.json').then((mod) => handleLang(mod.default, 'gherkin')),
	'git-commit': () => import('shiki/languages/git-commit.tmLanguage.json').then((mod) => handleLang(mod.default, 'git-commit')),
	'git-rebase': () => import('shiki/languages/git-rebase.tmLanguage.json').then((mod) => handleLang(mod.default, 'git-rebase')),
	'glsl': () => import('shiki/languages/glsl.tmLanguage.json').then((mod) => handleLang(mod.default, 'glsl')),
	'gnuplot': () => import('shiki/languages/gnuplot.tmLanguage.json').then((mod) => handleLang(mod.default, 'gnuplot')),
	'go': () => import('shiki/languages/go.tmLanguage.json').then((mod) => handleLang(mod.default, 'go')),
	'graphql': () => import('shiki/languages/graphql.tmLanguage.json').then((mod) => handleLang(mod.default, 'graphql')),
	'groovy': () => import('shiki/languages/groovy.tmLanguage.json').then((mod) => handleLang(mod.default, 'groovy')),
	'hack': () => import('shiki/languages/hack.tmLanguage.json').then((mod) => handleLang(mod.default, 'hack')),
	'haml': () => import('shiki/languages/haml.tmLanguage.json').then((mod) => handleLang(mod.default, 'haml')),
	'handlebars': () => import('shiki/languages/handlebars.tmLanguage.json').then((mod) => handleLang(mod.default, 'handlebars')),
	'haskell': () => import('shiki/languages/haskell.tmLanguage.json').then((mod) => handleLang(mod.default, 'haskell')),
	'hcl': () => import('shiki/languages/hcl.tmLanguage.json').then((mod) => handleLang(mod.default, 'hcl')),
	'hlsl': () => import('shiki/languages/hlsl.tmLanguage.json').then((mod) => handleLang(mod.default, 'hlsl')),
	'html': () => import('shiki/languages/html.tmLanguage.json').then((mod) => handleLang(mod.default, 'html')),
	'http': () => import('shiki/languages/http.tmLanguage.json').then((mod) => handleLang(mod.default, 'http')),
	'imba': () => import('shiki/languages/imba.tmLanguage.json').then((mod) => handleLang(mod.default, 'imba')),
	'ini': () => import('shiki/languages/ini.tmLanguage.json').then((mod) => handleLang(mod.default, 'ini')),
	'java': () => import('shiki/languages/java.tmLanguage.json').then((mod) => handleLang(mod.default, 'java')),
	'javascript': () => import('shiki/languages/javascript.tmLanguage.json').then((mod) => handleLang(mod.default, 'javascript')),
	'jinja-html': () => import('shiki/languages/jinja-html.tmLanguage.json').then((mod) => handleLang(mod.default, 'jinja-html')),
	'jinja': () => import('shiki/languages/jinja.tmLanguage.json').then((mod) => handleLang(mod.default, 'jinja')),
	'jison': () => import('shiki/languages/jison.tmLanguage.json').then((mod) => handleLang(mod.default, 'jison')),
	'json': () => import('shiki/languages/json.tmLanguage.json').then((mod) => handleLang(mod.default, 'json')),
	'json5': () => import('shiki/languages/json5.tmLanguage.json').then((mod) => handleLang(mod.default, 'json5')),
	'jsonc': () => import('shiki/languages/jsonc.tmLanguage.json').then((mod) => handleLang(mod.default, 'jsonc')),
	'jsonnet': () => import('shiki/languages/jsonnet.tmLanguage.json').then((mod) => handleLang(mod.default, 'jsonnet')),
	'jssm': () => import('shiki/languages/jssm.tmLanguage.json').then((mod) => handleLang(mod.default, 'jssm')),
	'jsx': () => import('shiki/languages/jsx.tmLanguage.json').then((mod) => handleLang(mod.default, 'jsx')),
	'julia': () => import('shiki/languages/julia.tmLanguage.json').then((mod) => handleLang(mod.default, 'julia')),
	'kotlin': () => import('shiki/languages/kotlin.tmLanguage.json').then((mod) => handleLang(mod.default, 'kotlin')),
	'latex': () => import('shiki/languages/latex.tmLanguage.json').then((mod) => handleLang(mod.default, 'latex')),
	'less': () => import('shiki/languages/less.tmLanguage.json').then((mod) => handleLang(mod.default, 'less')),
	'liquid': () => import('shiki/languages/liquid.tmLanguage.json').then((mod) => handleLang(mod.default, 'liquid')),
	'lisp': () => import('shiki/languages/lisp.tmLanguage.json').then((mod) => handleLang(mod.default, 'lisp')),
	'logo': () => import('shiki/languages/logo.tmLanguage.json').then((mod) => handleLang(mod.default, 'logo')),
	'lua': () => import('shiki/languages/lua.tmLanguage.json').then((mod) => handleLang(mod.default, 'lua')),
	'make': () => import('shiki/languages/make.tmLanguage.json').then((mod) => handleLang(mod.default, 'make')),
	'markdown': () => import('shiki/languages/markdown.tmLanguage.json').then((mod) => handleLang(mod.default, 'markdown')),
	'marko': () => import('shiki/languages/marko.tmLanguage.json').then((mod) => handleLang(mod.default, 'marko')),
	'matlab': () => import('shiki/languages/matlab.tmLanguage.json').then((mod) => handleLang(mod.default, 'matlab')),
	'mdx': () => import('shiki/languages/mdx.tmLanguage.json').then((mod) => handleLang(mod.default, 'mdx')),
	'mermaid': () => import('shiki/languages/mermaid.tmLanguage.json').then((mod) => handleLang(mod.default, 'mermaid')),
	'nginx': () => import('shiki/languages/nginx.tmLanguage.json').then((mod) => handleLang(mod.default, 'nginx')),
	'nim': () => import('shiki/languages/nim.tmLanguage.json').then((mod) => handleLang(mod.default, 'nim')),
	'nix': () => import('shiki/languages/nix.tmLanguage.json').then((mod) => handleLang(mod.default, 'nix')),
	'objective-c': () => import('shiki/languages/objective-c.tmLanguage.json').then((mod) => handleLang(mod.default, 'objective-c')),
	'objective-cpp': () => import('shiki/languages/objective-cpp.tmLanguage.json').then((mod) => handleLang(mod.default, 'objective-cpp')),
	'ocaml': () => import('shiki/languages/ocaml.tmLanguage.json').then((mod) => handleLang(mod.default, 'ocaml')),
	'pascal': () => import('shiki/languages/pascal.tmLanguage.json').then((mod) => handleLang(mod.default, 'pascal')),
	'perl': () => import('shiki/languages/perl.tmLanguage.json').then((mod) => handleLang(mod.default, 'perl')),
	'php-html': () => import('shiki/languages/php-html.tmLanguage.json').then((mod) => handleLang(mod.default, 'php-html')),
	'php': () => import('shiki/languages/php.tmLanguage.json').then((mod) => handleLang(mod.default, 'php')),
	'plsql': () => import('shiki/languages/plsql.tmLanguage.json').then((mod) => handleLang(mod.default, 'plsql')),
	'postcss': () => import('shiki/languages/postcss.tmLanguage.json').then((mod) => handleLang(mod.default, 'postcss')),
	'powerquery': () => import('shiki/languages/powerquery.tmLanguage.json').then((mod) => handleLang(mod.default, 'powerquery')),
	'powershell': () => import('shiki/languages/powershell.tmLanguage.json').then((mod) => handleLang(mod.default, 'powershell')),
	'prisma': () => import('shiki/languages/prisma.tmLanguage.json').then((mod) => handleLang(mod.default, 'prisma')),
	'prolog': () => import('shiki/languages/prolog.tmLanguage.json').then((mod) => handleLang(mod.default, 'prolog')),
	'proto': () => import('shiki/languages/proto.tmLanguage.json').then((mod) => handleLang(mod.default, 'proto')),
	'pug': () => import('shiki/languages/pug.tmLanguage.json').then((mod) => handleLang(mod.default, 'pug')),
	'puppet': () => import('shiki/languages/puppet.tmLanguage.json').then((mod) => handleLang(mod.default, 'puppet')),
	'purescript': () => import('shiki/languages/purescript.tmLanguage.json').then((mod) => handleLang(mod.default, 'purescript')),
	'python': () => import('shiki/languages/python.tmLanguage.json').then((mod) => handleLang(mod.default, 'python')),
	'r': () => import('shiki/languages/r.tmLanguage.json').then((mod) => handleLang(mod.default, 'r')),
	'raku': () => import('shiki/languages/raku.tmLanguage.json').then((mod) => handleLang(mod.default, 'raku')),
	'razor': () => import('shiki/languages/razor.tmLanguage.json').then((mod) => handleLang(mod.default, 'razor')),
	'rel': () => import('shiki/languages/rel.tmLanguage.json').then((mod) => handleLang(mod.default, 'rel')),
	'riscv': () => import('shiki/languages/riscv.tmLanguage.json').then((mod) => handleLang(mod.default, 'riscv')),
	'rst': () => import('shiki/languages/rst.tmLanguage.json').then((mod) => handleLang(mod.default, 'rst')),
	'ruby': () => import('shiki/languages/ruby.tmLanguage.json').then((mod) => handleLang(mod.default, 'ruby')),
	'rust': () => import('shiki/languages/rust.tmLanguage.json').then((mod) => handleLang(mod.default, 'rust')),
	'sas': () => import('shiki/languages/sas.tmLanguage.json').then((mod) => handleLang(mod.default, 'sas')),
	'sass': () => import('shiki/languages/sass.tmLanguage.json').then((mod) => handleLang(mod.default, 'sass')),
	'scala': () => import('shiki/languages/scala.tmLanguage.json').then((mod) => handleLang(mod.default, 'scala')),
	'scheme': () => import('shiki/languages/scheme.tmLanguage.json').then((mod) => handleLang(mod.default, 'scheme')),
	'scss': () => import('shiki/languages/scss.tmLanguage.json').then((mod) => handleLang(mod.default, 'scss')),
	'shaderlab': () => import('shiki/languages/shaderlab.tmLanguage.json').then((mod) => handleLang(mod.default, 'shaderlab')),
	'shellscript': () => import('shiki/languages/shellscript.tmLanguage.json').then((mod) => handleLang(mod.default, 'shellscript')),
	'smalltalk': () => import('shiki/languages/smalltalk.tmLanguage.json').then((mod) => handleLang(mod.default, 'smalltalk')),
	'solidity': () => import('shiki/languages/solidity.tmLanguage.json').then((mod) => handleLang(mod.default, 'solidity')),
	'sparql': () => import('shiki/languages/sparql.tmLanguage.json').then((mod) => handleLang(mod.default, 'sparql')),
	'sql': () => import('shiki/languages/sql.tmLanguage.json').then((mod) => handleLang(mod.default, 'sql')),
	'ssh-config': () => import('shiki/languages/ssh-config.tmLanguage.json').then((mod) => handleLang(mod.default, 'ssh-config')),
	'stata': () => import('shiki/languages/stata.tmLanguage.json').then((mod) => handleLang(mod.default, 'stata')),
	'stylus': () => import('shiki/languages/stylus.tmLanguage.json').then((mod) => handleLang(mod.default, 'stylus')),
	'svelte': () => import('shiki/languages/svelte.tmLanguage.json').then((mod) => handleLang(mod.default, 'svelte')),
	'swift': () => import('shiki/languages/swift.tmLanguage.json').then((mod) => handleLang(mod.default, 'swift')),
	'system-verilog': () => import('shiki/languages/system-verilog.tmLanguage.json').then((mod) => handleLang(mod.default, 'system-verilog')),
	'tasl': () => import('shiki/languages/tasl.tmLanguage.json').then((mod) => handleLang(mod.default, 'tasl')),
	'tcl': () => import('shiki/languages/tcl.tmLanguage.json').then((mod) => handleLang(mod.default, 'tcl')),
	'tex': () => import('shiki/languages/tex.tmLanguage.json').then((mod) => handleLang(mod.default, 'tex')),
	'toml': () => import('shiki/languages/toml.tmLanguage.json').then((mod) => handleLang(mod.default, 'toml')),
	'tsx': () => import('shiki/languages/tsx.tmLanguage.json').then((mod) => handleLang(mod.default, 'tsx')),
	'turtle': () => import('shiki/languages/turtle.tmLanguage.json').then((mod) => handleLang(mod.default, 'turtle')),
	'twig': () => import('shiki/languages/twig.tmLanguage.json').then((mod) => handleLang(mod.default, 'twig')),
	'typescript': () => import('shiki/languages/typescript.tmLanguage.json').then((mod) => handleLang(mod.default, 'typescript')),
	'v': () => import('shiki/languages/v.tmLanguage.json').then((mod) => handleLang(mod.default, 'v')),
	'vb': () => import('shiki/languages/vb.tmLanguage.json').then((mod) => handleLang(mod.default, 'vb')),
	'verilog': () => import('shiki/languages/verilog.tmLanguage.json').then((mod) => handleLang(mod.default, 'verilog')),
	'vhdl': () => import('shiki/languages/vhdl.tmLanguage.json').then((mod) => handleLang(mod.default, 'vhdl')),
	'viml': () => import('shiki/languages/viml.tmLanguage.json').then((mod) => handleLang(mod.default, 'viml')),
	'vue-html': () => import('shiki/languages/vue-html.tmLanguage.json').then((mod) => handleLang(mod.default, 'vue-html')),
	'vue': () => import('shiki/languages/vue.tmLanguage.json').then((mod) => handleLang(mod.default, 'vue')),
	'wasm': () => import('shiki/languages/wasm.tmLanguage.json').then((mod) => handleLang(mod.default, 'wasm')),
	'wenyan': () => import('shiki/languages/wenyan.tmLanguage.json').then((mod) => handleLang(mod.default, 'wenyan')),
	'wgsl': () => import('shiki/languages/wgsl.tmLanguage.json').then((mod) => handleLang(mod.default, 'wgsl')),
	'xml': () => import('shiki/languages/xml.tmLanguage.json').then((mod) => handleLang(mod.default, 'xml')),
	'xsl': () => import('shiki/languages/xsl.tmLanguage.json').then((mod) => handleLang(mod.default, 'xsl')),
	'yaml': () => import('shiki/languages/yaml.tmLanguage.json').then((mod) => handleLang(mod.default, 'yaml')),
	'zenscript': () => import('shiki/languages/zenscript.tmLanguage.json').then((mod) => handleLang(mod.default, 'zenscript')),
};
