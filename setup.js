import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// wp-env 起動
console.log("Starting wp-env environment...");
try {
  execSync("npx wp-env start", { stdio: "inherit" });
} catch {
  console.error("Failed to start wp-env.");
  process.exit(1);
}

// MySQL コンテナが属するネットワーク名を取得
console.log("Detecting wp-env Docker network...");
let wpEnvNetwork = "";

try {
  const containers = execSync('docker ps --format "{{.Names}}"').toString().trim().split("\n");
  const mysqlContainer = containers.find((c) => c.includes("mysql"));

  if (!mysqlContainer) {
    throw new Error("MySQL container not found. Is wp-env running?");
  }

  const result = spawnSync("docker", [
    "inspect",
    "--format",
    "{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}",
    mysqlContainer,
  ]);
  wpEnvNetwork = result.stdout.toString().trim().split(" ")[0];

  if (!wpEnvNetwork) {
    throw new Error("Could not resolve network name from container.");
  }

  console.log(`Using network: ${wpEnvNetwork}`);
} catch (err) {
  console.error("Failed to detect Docker network:", err.message);
  process.exit(1);
}

// テンプレートからネットワーク名を差し替えて docker-compose ファイルを生成
const templatePath = path.join(__dirname, "docker-compose.phpmyadmin.yml.template");
const outputPath = path.join(__dirname, "docker-compose.phpmyadmin.yml");
const template = fs.readFileSync(templatePath, "utf8");
fs.writeFileSync(outputPath, template.replace("__WP_ENV_NETWORK__", wpEnvNetwork));

// phpMyAdmin 起動
console.log("Starting phpMyAdmin...");
try {
  execSync("docker-compose -f docker-compose.phpmyadmin.yml up -d", { stdio: "inherit" });
  console.log("\nphpMyAdmin is running at http://localhost:8080  (root / password)");
} catch {
  console.error("Failed to start phpMyAdmin.");
  process.exit(1);
}
