export interface Arguments {
	_: Array<string | number>;
	'--'?: Array<string | number>;
	[argName: string]: any;
}
