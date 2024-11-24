import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const smokeDir = mkdtempSync(join(tmpdir(), "dayboxing-consumer-"));
const packDir = mkdtempSync(join(tmpdir(), "dayboxing-pack-"));
let tarballPath;

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: "inherit",
    env: {
      ...process.env,
      npm_config_update_notifier: "false",
      npm_config_fund: "false",
      npm_config_audit: "false",
    },
  });
}

try {
  const tarball = execFileSync("npm", ["pack", "--json", "--pack-destination", packDir], {
    cwd: root,
    encoding: "utf8",
  });
  const [{ filename }] = JSON.parse(tarball);
  tarballPath = join(packDir, filename);

  writeFileSync(
    join(smokeDir, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@bagaking/dayboxing": tarballPath,
          "@types/node": "22.8.7",
          "@types/react": "18.3.12",
          "@types/react-dom": "18.3.1",
          "@types/stylis": "4.2.5",
          react: "18.3.1",
          "react-dom": "18.3.1",
          "styled-components": "6.1.13",
          typescript: "5.6.3",
        },
        devDependencies: {},
      },
      null,
      2
    )
  );

  writeFileSync(
    join(smokeDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ["consumer.tsx"],
      },
      null,
      2
    )
  );

  writeFileSync(
    join(smokeDir, "consumer.tsx"),
    `import { DayBoxing, type DayPattern, type HourType, defaultTheme } from "@bagaking/dayboxing";

const pattern: DayPattern = {
  startHour: 0,
  blocks: ["sleep", { type: "work" satisfies HourType, duration: 2 }],
};

export function SmokeConsumer() {
  return (
    <DayBoxing
      patterns={[pattern]}
      dates={["2024-03-15"]}
      theme={defaultTheme}
      onHourChange={(event) => {
        const nextType: HourType = event.newType;
        void nextType;
      }}
    />
  );
}
`
  );

  run("pnpm", ["install", "--silent", "--ignore-scripts"], { cwd: smokeDir });
  run("pnpm", ["exec", "tsc", "--noEmit"], { cwd: smokeDir });
} finally {
  rmSync(packDir, { recursive: true, force: true });
  rmSync(smokeDir, { recursive: true, force: true });
}
