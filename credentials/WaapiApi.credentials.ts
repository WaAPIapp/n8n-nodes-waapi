import {
    IAuthenticateGeneric, ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class WaapiApi implements ICredentialType {
    name = 'waapiApi';
    displayName = 'WaAPI API';
    documentationUrl = 'https://waapi.app/docs';
    properties: INodeProperties[] = [
        {
            displayName:
                "To use WaAPI, you need an access token with all scopes. " +
                "You can get your access token from your WaAPI dashboard at " +
                "<a target='_blank' href='https://waapi.app/user/api-tokens'>https://waapi.app/user/api-tokens</a>. " +
                "The token should be in the format: <code>aaa1bbb2ccc3ddd4eee5fff6ggg7hhh8iii9</code>",
            default: '',
            name: 'operation',
            type: 'notice',
        },
        {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'string',
            placeholder: "aaa1bbb2ccc3ddd4eee5fff6ggg7hhh8iii9",
            default: '',
            required: true,
            typeOptions: { password: true },
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'authorization': '=Bearer {{$credentials.accessToken}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://waapi.app',
            url: '/api/v1/instances',
        },
    };
}
