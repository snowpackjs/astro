// Hydrate directly and write the passed options to the DOM
export default async (load, options) => {
	const hydrate = await load();

	const div = document.createElement('div');
	div.id = 'options';
	div.textContent = `Passed options are: ${JSON.stringify(options.value)}`;
	document.body.appendChild(div);
	await hydrate();
}
