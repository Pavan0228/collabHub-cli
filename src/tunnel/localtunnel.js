import localtunnel from "localtunnel";
import axios from "axios";

async function checkServerRunning(port) {
    try {
        await axios.get(`http://localhost:${port}`, { timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
}

export default async function runTunnel(port) {
    // First check if the local server is running
    const isRunning = await checkServerRunning(port);
    if (!isRunning) {
        throw new Error(
            `No server found running on port ${port}. Make sure your dev server is running.`
        );
    }

    console.log(`📡 Creating tunnel for localhost:${port}...`);

    try {
        const tunnel = await localtunnel({
            port,
            subdomain: `collabhub-${Math.random().toString(36).substr(2, 9)}`,
        });

        console.log(`🌍 Public URL: ${tunnel.url}`);

        tunnel.on("close", () => {
            console.log("❌ Tunnel closed");
        });

        tunnel.on("error", (err) => {
            console.error("❌ Tunnel error:", err.message);
        });

        // Test the tunnel URL
        try {
            await axios.get(tunnel.url, { timeout: 10000 });
            console.log("✅ Tunnel is working and accessible");
        } catch (testError) {
            console.warn(
                "⚠️  Tunnel created but may not be immediately accessible. Please wait a moment and try again."
            );
        }

        return tunnel.url;
    } catch (error) {
        throw new Error(`Failed to create tunnel: ${error.message}`);
    }
}
