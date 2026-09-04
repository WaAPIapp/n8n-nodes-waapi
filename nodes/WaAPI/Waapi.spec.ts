import { Waapi } from './Waapi.node';

// The properties are generated at build time and imported as JSON, which is a
// quieter thing to get wrong than it looks: with esModuleInterop, `import * as`
// on a JSON array yields an object keyed "0", "1", ... rather than an array.
// The node still constructs, the description still has a `properties` field,
// and n8n renders no parameters at all.
//
// The test that stood here was `expect(node.description.properties)
// .toBeDefined()`. It passed against exactly that broken build, because the
// mangled object is defined. These assert the shape and the content instead.
describe('WaAPI node', () => {
	const description = new Waapi().description;
	const properties = description.properties;

	it('exposes its properties as an array', () => {
		expect(Array.isArray(properties)).toBe(true);
	});

	it('carries the full generated parameter set', () => {
		// A literal floor, not derived from the generated file: a bound taken
		// from the thing under test passes however much of it goes missing.
		expect(properties.length).toBeGreaterThan(400);
	});

	it('gives every property a name and a display name', () => {
		const broken = properties.filter(
			(p) => typeof p.name !== 'string' || typeof p.displayName !== 'string',
		);
		expect(broken).toEqual([]);
	});

	it('offers the webhook subscription resource', () => {
		const resource = properties.find((p) => p.name === 'resource');
		expect(resource).toBeDefined();
		const values = (resource?.options ?? []).map((o) => (o as { value: string }).value);
		expect(values).toContain('Webhooks');
	});

	it('offers the webhook subscription operations', () => {
		const operations = properties
			.filter((p) => p.name === 'operation')
			.flatMap((p) => (p.options ?? []).map((o) => (o as { value: string }).value));

		expect(operations).toContain('Create Webhook Subscription');
		expect(operations).toContain('List Webhook Subscriptions');
		expect(operations).toContain('Delete Webhook Subscription');
	});

	it('points at the production API', () => {
		expect(description.requestDefaults?.baseURL).toBe('https://waapi.app/api/v1');
	});
});

// n8n does not import whatever a node file exports. It derives the export name
// from the file name -- `path.parse(sourcePath).name.split('.')[0]` -- and
// fails if that exact name is missing, reporting only "The specified package
// could not be loaded". Renaming this file to satisfy a lint rule, without
// renaming the class, shipped three releases nobody could install.
describe('package entry points', () => {
	const pkg = require('../../package.json');

	it.each([...pkg.n8n.nodes, ...pkg.n8n.credentials])(
		'%s exports the class n8n derives from its filename',
		(rel: string) => {
			// The same derivation as n8n's path.parse(rel).name.split('.')[0],
			// written without importing 'path': the official rule set forbids
			// requiring anything here, builtins included.
			const expected = rel.split('/').pop()!.split('.')[0];
			const mod = require('../../' + rel);

			expect(Object.keys(mod)).toContain(expected);
			expect(typeof mod[expected]).toBe('function');
		},
	);
});
