import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {}
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build()

export class WaAPI implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'WaAPI',
        name: 'waapi',
        icon: 'file:waapi.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with WaAPI API',
        defaults: {
            name: 'WaAPI',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'waapiApi',
                required: true,
            },
        ],
        requestDefaults: {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            baseURL: 'https://waapi.app/api/v1',
        },
        properties: properties,
    };
}
