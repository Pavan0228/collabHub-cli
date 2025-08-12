import fs from "fs";
import path from "path";

export default function detectProject() {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) return "unknown";

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    if (pkg.dependencies?.react) return "React";
    if (pkg.dependencies?.express) return "Node.js API";

    return "Node.js";
}

// Detect port from .env or package.json in current working directory
export function detectPort() {
    // 1. Check .env file
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/^PORT=(\d+)/m);
        if (match) {
            return parseInt(match[1], 10);
        }
    }

    // 2. Check package.json scripts for --port or -p
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.scripts && pkg.scripts.dev) {
            // Try to find --port or -p in the dev script
            const devScript = pkg.scripts.dev;
            const portMatch =
                devScript.match(/--port\s+(\d+)/) ||
                devScript.match(/-p\s+(\d+)/);
            if (portMatch) {
                return parseInt(portMatch[1], 10);
            }
        }
    }

    // Not found
    return null;
}
