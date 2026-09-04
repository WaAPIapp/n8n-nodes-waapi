// Bakes the node's properties at build time.
//
// They used to be derived on every load, from the bundled OpenAPI document, by
// a library the package carried as a runtime dependency. Verified community
// nodes may not have runtime dependencies at all, so the same derivation runs
// here instead and its result ships as data.
//
// Two things follow from that and are worth knowing before changing this file:
// the properties are only as fresh as the last build, and the spec no longer
// needs to be in the published package -- it is an input to this script, not a
// thing the node reads.
import { N8NPropertiesBuilder } from '@devlikeapro/n8n-openapi-node';
import { readFileSync, writeFileSync } from 'node:fs';

const SPEC = 'nodes/WaAPI/openapi.json';
const OUT = 'nodes/WaAPI/properties.json';

const doc = JSON.parse(readFileSync(SPEC, 'utf8'));
const properties = new N8NPropertiesBuilder(doc, {}).build();

if (!Array.isArray(properties) || properties.length === 0) {
	throw new Error(`Refusing to write ${OUT}: the builder produced nothing.`);
}

writeFileSync(OUT, JSON.stringify(properties, null, 2) + '\n');
console.log(`${OUT}: ${properties.length} properties from ${Object.keys(doc.paths).length} paths`);
