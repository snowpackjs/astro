// This script helps extract the benchmark logs that are between the `==========` lines.
// They are a convention defined in the `./bench/_template.js` file, which are used to log
// out with the `!bench` command. See `/.github/workflows/benchmark.yml` to see how it's used.
const benchLogs = process.argv[2];
const resultRegex = /==========(.*?)==========/gs;

let processedLog = '';
let m;
while ((m = resultRegex.exec(benchLogs))) {
	processedLog += m[1] + '\n';
}

console.log(processedLog);
