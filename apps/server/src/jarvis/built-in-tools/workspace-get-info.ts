import fs from "fs-extra";
import { z } from "zod";
import { DIR_WORKSPACE } from "../defines";
import { defineJarvisTool } from "../tool";

export const workspaceGetInfoTool = defineJarvisTool({
  name: "workspace_get_info",
  description:
    "Get workspace information including installed npm packages and environment variable keys (values are masked). Returns formatted text with dependencies and env keys.",
  inputSchema: z.object({
    brief: z.string().describe("Short label, e.g. 'get workspace info'"),
  }),
  execute: async () => {
    const wsRoot = DIR_WORKSPACE;
    const packageJsonPath = `${wsRoot}/package.json`;
    const envPath = `${wsRoot}/.env`;

    let output = "";

    // Read package.json dependencies
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = fs.readJSONSync(packageJsonPath);
        const deps = packageJson.dependencies || {};
        const devDeps = packageJson.devDependencies || {};

        if (Object.keys(deps).length > 0) {
          output += "## Dependencies\n\n";
          for (const [name, version] of Object.entries(deps)) {
            output += `${name}: ${version}\n`;
          }
        }

        if (Object.keys(devDeps).length > 0) {
          if (output) output += "\n";
          output += "## Dev Dependencies\n\n";
          for (const [name, version] of Object.entries(devDeps)) {
            output += `${name}: ${version}\n`;
          }
        }

        if (
          Object.keys(deps).length === 0 &&
          Object.keys(devDeps).length === 0
        ) {
          output += "## Dependencies\n\nNo dependencies installed.\n";
        }
      } catch {
        output += "## Dependencies\n\nFailed to read package.json\n";
      }
    } else {
      output += "## Dependencies\n\nNo package.json found.\n";
    }

    // Read .env and mask values
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const lines = envContent.split("\n").filter((line) => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith("#");
        });

        if (lines.length > 0) {
          if (output) output += "\n";
          output += "## Environment Variables\n\n";
          for (const line of lines) {
            const equalIndex = line.indexOf("=");
            if (equalIndex > 0) {
              const key = line.substring(0, equalIndex).trim();
              output += `${key}=*****\n`;
            }
          }
        }
      } catch {
        if (output) output += "\n";
        output += "## Environment Variables\n\nFailed to read .env\n";
      }
    } else {
      if (output) output += "\n";
      output += "## Environment Variables\n\nNo .env file found.\n";
    }

    return output;
  },
});
