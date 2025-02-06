/** Default project to run for this benchmark if not specified */
export const defaultProject = 'project-name';

/**
 * Run benchmark on `projectDir` and write results to `outputFile`.
 * Use `console.log` to report the results too. Logs that start with 10 `=`
 * and end with 10 `=` will be extracted by CI to display in the PR comment.
 * Usually after the first 10 `=` you'll want to add a title like `#### Test`.
 * @param {URL} _projectDir
 * @param {URL} _outputFile
 */
export async function run(_projectDir, _outputFile) {}
