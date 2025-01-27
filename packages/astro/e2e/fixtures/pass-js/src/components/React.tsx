import type { BigNestedObject } from '../types';

interface Props {
	undefined: undefined;
	null: null;
	boolean: boolean;
	number: number;
	string: string;
	bigint: bigint;
	object: BigNestedObject;
	array: any[];
	map: Map<string, string>;
	set: Set<string>;
	infinity: number;
	negativeInfinity: number;
}

const isNode = typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]';

/** a counter written in React */
export default function Component({ undefined: undefinedProp, null: nullProp, boolean, number, string, bigint, object, array, map, set, infinity, negativeInfinity }: Props) {
	// We are testing hydration, so don't return anything in the server.
	if(isNode) {
		return <div></div>
	}

	return (
		<div>
			<span id="undefined-type">{Object.prototype.toString.call(undefinedProp)}</span>
			<span id="null-type">{Object.prototype.toString.call(nullProp)}</span>
			<span id="boolean-type">{Object.prototype.toString.call(boolean)}</span>
			<span id="boolean-value">{boolean.toString()}</span>
			<span id="number-type">{Object.prototype.toString.call(number)}</span>
			<span id="number-value">{number.toString()}</span>
			<span id="infinity-type">{Object.prototype.toString.call(infinity)}</span>
			<span id="infinity-value">{infinity.toString()}</span>
			<span id="negative-infinity-type">{Object.prototype.toString.call(negativeInfinity)}</span>
			<span id="negative-infinity-value">{negativeInfinity.toString()}</span>
			<span id="string-type">{Object.prototype.toString.call(string)}</span>
			<span id="string-value">{string}</span>
			<span id="bigint-type">{Object.prototype.toString.call(bigint)}</span>
			<span id="bigint-value">{bigint.toString()}</span>
			<span id="date-type">{Object.prototype.toString.call(object.nested.date)}</span>
			<span id="date-value">{object.nested.date.toUTCString()}</span>
			<span id="regexp-type">{Object.prototype.toString.call(object.more.another.exp)}</span>
			<span id="regexp-value">{object.more.another.exp.source}</span>
			<span id="array-type">{Object.prototype.toString.call(array)}</span>
			<span id="array-value">{array.join(',')}</span>
			<span id="map-type">{Object.prototype.toString.call(map)}</span>
			<ul id="map-items">{Array.from(map).map(([key, value]) => (
				<li>{key}: {value}</li>
			))}
			</ul>
			<span id="set-type">{Object.prototype.toString.call(set)}</span>
			<span id="set-value">{Array.from(set).join(',')}</span>
		</div>
	);
}
