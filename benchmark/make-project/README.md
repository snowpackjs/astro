# make-project

This `make-project` folder contains different files to programmatically create a new Astro project. They are created inside the `projects` folder and are gitignored. These projects are used by benchmarks for testing.

Each benchmark can specify the default project to run in its `defaultProject` export, but it can be overridden if `--project <project-name>` is passed through the CLI.

You can duplicate `_template.js` to start a new project script. All shared utilities are kept in `_util.js`.
