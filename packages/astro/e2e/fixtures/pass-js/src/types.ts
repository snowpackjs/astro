
export interface BigNestedObject {
	nested: {
		date: Date;
	};
	more: {
		another: {
			exp: RegExp;
		}
	}
}
