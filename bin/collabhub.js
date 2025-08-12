#!/usr/bin/env node
import { Command } from "commander";
import dev from "../src/commands/dev.js";

const program = new Command();

program
    .name("collabhub")
    .description("CollabHub CLI for local dev and deploy")
    .version("1.0.0");

program
    .command("dev")
    .description("Run project locally and expose to internet")
    .option("--port <port>", "Port to run the app", "3000")
    .action(dev);

program.parse(process.argv);
