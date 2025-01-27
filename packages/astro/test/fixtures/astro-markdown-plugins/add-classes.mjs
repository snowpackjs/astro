import { selectAll } from 'hast-util-select';

export default (additions) => {
	const adders = Object.entries(additions).map(adder);
	return (node) => adders.forEach((a) => a(node));
};

const adder = ([selector, className]) => {
	const writer = write(className);
	return (node) => selectAll(selector, node).forEach(writer);
};

const write =
	(className) =>
	({ properties }) => {
		if (!properties.className) properties.className = className;
		else properties.className += ` ${className}`;
	};
