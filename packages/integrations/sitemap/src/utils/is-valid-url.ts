// @internal
export const isValidUrl = (s: any) => {
	if (typeof s !== 'string' || !s) {
		return false;
	}
	try {
		new URL(s);
		return true;
	} catch {
		return false;
	}
};
