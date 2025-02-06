export interface CompileCssResult {
	code: string;
	/**
	 * Whether this is `<style is:global>`
	 */
	isGlobal: boolean;
	/**
	 * The dependencies of the transformed CSS (Normalized/forward-slash-only absolute paths)
	 */
	dependencies: string[];
}
