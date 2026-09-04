const path = require('path');
const { task, src, dest } = require('gulp');

task('build:icons', copyAssets);

// Icons plus each node's codex file (*.node.json), which carries the
// categories and documentation links n8n shows in its UI. The codex used to
// reach dist only because tsconfig listed nodes/**/*.json as compiler input --
// which also dragged the 864 kB OpenAPI document into the published package.
// Copying it here states the intent instead of relying on that side effect.
function copyAssets() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg,node.json}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	return src(credSource).pipe(dest(credDestination));
}
