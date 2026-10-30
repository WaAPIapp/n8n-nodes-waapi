// Loads the built package the way n8n does, with whatever n8n-workflow the
// current Node resolves: the devDependency after `npm ci`, or an old one put on
// NODE_PATH by the CI load job.
//
// `tsc` is incremental, and a build that emits nothing still exits 0, so the
// entry points are checked for existence rather than inferred from the build.
// Existence is not enough: n8n derives the export name from the file name, as
// `path.parse(sourcePath).name.split(".")[0]`, and fails if that exact name is
// missing. Renaming Waapi.node.ts without renaming the class shipped three
// unloadable releases, and n8n's only message for it is "The specified package
// could not be loaded".
//
// The node is loaded by the n8n-workflow the host n8n ships, not by the one in
// devDependencies. A value imported from it that only exists in recent
// versions breaks loading on older installations -- which is what reached a
// user in 1.7.3.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const problems = [];

for (const rel of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    problems.push(`${rel}: missing`);
    continue;
  }
  const expected = path.parse(rel).name.split(".")[0];
  const mod = require(file);
  if (typeof mod[expected] !== "function") {
    problems.push(
      `${rel}: expects class ${expected}, exports ${Object.keys(mod).join(", ")}`,
    );
    continue;
  }
  new mod[expected]();
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const { Waapi } = require(path.join(root, "dist/nodes/WaAPI/Waapi.node.js"));
const description = new Waapi().description;
if (!Array.isArray(description.inputs) || description.inputs[0] !== "main") {
  console.error(`inputs is ${JSON.stringify(description.inputs)}`);
  process.exit(1);
}
if (
  !Array.isArray(description.properties) ||
  description.properties.length < 400
) {
  console.error(`properties: ${(description.properties || []).length}`);
  process.exit(1);
}

// Which n8n-workflow was actually loaded: a check that silently resolves the
// devDependency instead of the old version proves nothing.
const workflowVersion = require("n8n-workflow/package.json").version;

console.log(
  `Node ${process.version}, n8n-workflow ${workflowVersion}: every entry point exports the class n8n looks for; ${description.properties.length} properties.`,
);
