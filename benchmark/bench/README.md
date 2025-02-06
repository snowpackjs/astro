# bench

This `bench` folder contains different benchmarking files that you can run via `astro-benchmark <bench-file-name>`, e.g. `astro-benchmark memory`. Files that start with an underscore are not benchmarking files.

Benchmarking files will run against a project to measure its performance, and write the results down as JSON in the `results` folder. The `results` folder is gitignored and its result files can be safely deleted if you're not using them.

You can duplicate `_template.js` to start a new benchmark test. All shared utilities are kept in `_util.js`.
