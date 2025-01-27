// @internal
export const isObjectEmpty = (o: any) => {
	if (!o) {
		return true;
	}
	if (Array.isArray(o)) {
		return o.length === 0;
	}
	return Object.keys(o).length === 0 && Object.getPrototypeOf(o) === Object.prototype;
};
