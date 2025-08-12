#!/usr/bin/env node
import { Command } from "commander";
import dev from "../src/commands/dev.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
    .name("collabhub")
    .description("CollabHub CLI for local dev and deploy")
    .version(pkg.version, "-v, --version", "Output the current version");

program
    .command("dev")
    .description("Run project locally or a single file and expose to internet")
    .argument("[file_path]", "Optional path to a file to run")
    .option("--port <port>", "Port to run the app")
    .action(dev);

program.parse(process.argv);
