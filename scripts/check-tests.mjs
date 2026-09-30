// CI gate: every test must pass unless it's listed in test/known-failures.json (open bugs).
// Also fails if a known failure now passes but is still listed — remove it when you fix the bug.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const known = new Set(JSON.parse(readFileSync("test/known-failures.json", "utf8")));
const out = "node_modules/.cache/vitest-report.json";
try {
  execFileSync("npx", ["vitest", "run", "--reporter=json", `--outputFile=${out}`], { stdio: "inherit" });
} catch {
  // vitest exits 1 when any test fails; the report below decides
}
const report = JSON.parse(readFileSync(out, "utf8"));
const problems = [];
for (const file of report.testResults) {
  for (const t of file.assertionResults) {
    const name = [...t.ancestorTitles, t.title].join(" > ");
    if (t.status === "failed" && !known.has(name)) problems.push(`NEW FAILURE: ${name}`);
    if (t.status === "passed" && known.has(name)) problems.push(`FIXED BUT STILL LISTED in test/known-failures.json: ${name}`);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`OK — ${report.numPassedTests} passed, ${report.numFailedTests} known failures`);
