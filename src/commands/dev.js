import runTunnel from "../tunnel/localtunnel.js";
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";
import { detectPort } from "../detect/projectDetector.js";

export default async function dev(opts) {
    let port;
    if (opts.port) {
        port = parseInt(opts.port, 10);
        console.log(`Using port from CLI: ${port}`);
    } else {
        port = detectPort();
        if (port) {
            console.log(`Detected project port: ${port}`);
        } else {
            port = 3000;
            console.log(`No port specified or detected. Defaulting to ${port}`);
        }
    }

    console.log(`🚀 Starting local dev server on port ${port}...`);
    const devServer = spawn(
        "npm",
        ["run", "dev", "--", "--port", port.toString()],
        {
            stdio: "pipe",
            shell: true,
        }
    );

    // Capture and filter output
    devServer.stdout.on("data", (data) => {
        const output = data.toString();
        // Only show critical information, suppress verbose startup messages
        if (output.includes("ready in") && output.includes("ms")) {
            console.log("✅ Dev server started successfully");
        }
        if (output.includes("error") || output.includes("Error")) {
            console.error(output.trim());
        }
    });

    devServer.stderr.on("data", (data) => {
        const output = data.toString();
        // Only show actual errors, not warnings like browserslist
        if (
            !output.includes("Browserslist") &&
            !output.includes("update-browserslist-db")
        ) {
            console.error(output.trim());
        }
    });

    // Wait a few seconds for the dev server to start
    console.log("⏳ Waiting for dev server to start...");
    await setTimeout(5000);

    console.log("🌐 Opening tunnel...");
    try {
        const url = await runTunnel(port);
        console.log(`✅ Public preview available: ${url}`);
    } catch (error) {
        console.error("❌ Failed to create tunnel:", error.message);
        console.log("💡 Make sure your dev server is running on port", port);
    }

    devServer.on("close", (code) => {
        console.log(`Dev server exited with code ${code}`);
        process.exit(code);
    });
}
