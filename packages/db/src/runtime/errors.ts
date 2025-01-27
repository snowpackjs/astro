import { bold } from 'kleur/colors';

export const FOREIGN_KEY_DNE_ERROR = (tableName: string) => {
	return `Table ${bold(
		tableName,
	)} references a table that does not exist. Did you apply the referenced table to the \`tables\` object in your db config?`;
};

export const FOREIGN_KEY_REFERENCES_LENGTH_ERROR = (tableName: string) => {
	return `Foreign key on ${bold(
		tableName,
	)} is misconfigured. \`columns\` and \`references\` must be the same length.`;
};

export const FOREIGN_KEY_REFERENCES_EMPTY_ERROR = (tableName: string) => {
	return `Foreign key on ${bold(
		tableName,
	)} is misconfigured. \`references\` array cannot be empty.`;
};

export const REFERENCE_DNE_ERROR = (columnName: string) => {
	return `Column ${bold(
		columnName,
	)} references a table that does not exist. Did you apply the referenced table to the \`tables\` object in your db config?`;
};

export const SEED_DEFAULT_EXPORT_ERROR = (fileName: string) => {
	return `Missing default function export in ${bold(fileName)}`;
};
