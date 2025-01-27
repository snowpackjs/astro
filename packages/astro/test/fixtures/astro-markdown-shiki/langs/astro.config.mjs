const riGrammar = JSON.parse(
	String.raw`{"name":"rinfo","patterns":[{"include":"#lf-rinfo"}],"repository":{"lf-rinfo":{"patterns":[{"include":"#control"},{"include":"#operator"},{"include":"#strings"},{"include":"#number"},{"include":"#comment"},{"include":"#literal"}]},"control":{"patterns":[{"name":"keyword.control.ri","match":"\\b(si|mientras|repetir)\\b"},{"name":"keyword.other.ri","match":"\\b(programa|robots|areas|variables|comenzar|fin)\\b"},{"name":"support.function.other.ri","match":"\\b(tomarFlor|HayFlorEnLaBolsa|HayFlorEnLaEsquina|depositarFlor|HayPapelEnLaBolsa|HayPapelEnLaEsquina|tomarPapel|depositarPapel)\\b"}]},"operator":{"comment":"Captures operators and also puts them in different sub-groups that further describe them","patterns":[{"match":"\\+|-|\\*|/","name":"keyword.operator.arithmetic.ri"},{"match":"<|>|<=|>=|=|<>|!=","name":"keyword.operator.comparison.ri"},{"match":"\\b(Pos|Informar|Leer|Iniciar|AsignarArea|AreaC)\\b","name":"support.function.arithmetic.ri"},{"match":":=","name":"keyword.operator.assign.ri"},{"match":"(&|~)","name":"support.function.logical.ri"}]},"strings":{"name":"string.quoted.double.ri","beginCaptures":{"0":{"name":"string.quoted.double.begin.ri"}},"endCaptures":{"0":{"name":"string.quoted.double.end.ri"}},"begin":"\"","end":"\"","patterns":[{"name":"constant.character.escape.ri","match":"\\\\."}]},"comment":{"patterns":[{"name":"comment.block.ri","begin":"{","end":"}","patterns":[{"include":"#comment"}]}]},"literal":{"patterns":[{"name":"constant.language.ri","match":"\\b(verdadero|falso|boolean|numero)\\b"}]},"number":{"patterns":[{"comment":"Captures decimal numbers, with the negative sign being considered an operator","match":"(-)?(?:((?:\\b\\d+(?:\\.\\d*)?|\\.\\d+)(?:\\b|e-?\\d+\\b)%?)|(\\$[0-9]+\\b))","captures":{"1":{"name":"keyword.operator.arithmetic.ri"},"2":{"name":"constant.numeric.decimal.ri"},"3":{"name":"constant.numeric.hex.ri"}}}]}},"scopeName":"source.rinfo"}`
);

export default {
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			langs: [
				{
					id: 'rinfo',
					scopeName: 'source.rinfo',
					grammar: riGrammar,
					aliases: ['ri'],
				},
			],
		},
	},
}
