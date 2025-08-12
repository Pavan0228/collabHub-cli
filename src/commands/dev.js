import runTunnel from "../tunnel/localtunnel.js";
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";
import { detectPort } from "../detect/projectDetector.js";
import fs from "fs";
import path from "path";

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

    // Detect if the project's dev script is likely Vite (accepts --port)
    let passPortArg = false;
    try {
        const pkgPath = path.resolve(process.cwd(), "package.json");
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            const devScript = pkg.scripts?.dev || "";
            passPortArg = /vite|--port|-p\s+\d+/.test(devScript);
        }
    } catch {}

    const args = ["run", "dev"];
    if (passPortArg) {
        args.push("--", "--port", port.toString());
    }

    const devServer = spawn("npm", args, {
        stdio: "pipe",
        shell: true,
        env: { ...process.env, PORT: port.toString() },
    });

    // Capture and filter output
    let serverReady = false;
    const serverReadyLogs = [
        "ready in", // Vite
        "listening on port", // Express/Node
        "started server on", // Next.js
        "successfully started",
        "server is running on",
    ];

    const onData = (data) => {
        const output = data.toString();
        if (
            !serverReady &&
            serverReadyLogs.some((log) => output.toLowerCase().includes(log))
        ) {
            console.log("✅ Dev server started successfully");
            serverReady = true;
        }

        // Filter out noisy logs but still show important info
        if (output.includes("error") || output.includes("Error")) {
            console.error(output.trim());
        } else if (!output.includes("Browserslist")) {
            // You can add more filters here if needed
            // console.log(output.trim()); // Uncomment to see all logs for debugging
        }
    };

    devServer.stdout.on("data", onData);
    devServer.stderr.on("data", onData);

    // Wait a few seconds for the dev server to start
    console.log("⏳ Waiting for dev server to start...");
    await setTimeout(8000); // Increased timeout for slower backend starts

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
