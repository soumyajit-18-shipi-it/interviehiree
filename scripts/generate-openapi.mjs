import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGenerator } from 'ts-json-schema-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.resolve(repoRoot, 'docs');
const sourcePath = path.resolve(repoRoot, 'src/lib/api.ts');
const tsconfigPath = path.resolve(repoRoot, 'tsconfig.json');

const schemaTypes = [
  'Organization',
  'TeamMember',
  'Preferences',
  'Job',
  'JobOverview',
  'JobPipeline',
  'Candidate',
  'ResumeAnalysis',
  'Interview',
  'Application',
  'CareerPageSetup',
  'CareerPageDetails',
];

function generateSchemaForType(type) {
  const generator = createGenerator({
    path: sourcePath,
    tsconfig: tsconfigPath,
    type,
    expose: 'export',
    skipTypeCheck: true,
    additionalProperties: false,
  });

  const schema = generator.createSchema(type);
  return schema.definitions?.[type] ?? schema;
}

function paginatedSchema(refName) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['count', 'next', 'previous', 'results'],
    properties: {
      count: { type: 'number' },
      next: { type: ['string', 'null'] },
      previous: { type: ['string', 'null'] },
      results: {
        type: 'array',
        items: { $ref: `#/components/schemas/${refName}` },
      },
    },
  };
}

const componentsSchemas = Object.fromEntries(
  schemaTypes.map((type) => [type, generateSchemaForType(type)]),
);

const openApi = {
  openapi: '3.1.0',
  info: {
    title: 'IntervieHire API',
    version: '1.0.0',
    description: 'Generated from TypeScript response models in src/lib/api.ts',
  },
  servers: [
    {
      url: '{baseUrl}',
      variables: {
        baseUrl: {
          default: 'https://dhruvshah2706.pythonanywhere.com',
        },
      },
    },
  ],
  paths: {
    '/accounts/organizations/': {
      get: {
        operationId: 'listOrganizations',
        responses: {
          '200': {
            description: 'Organization list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Organization' },
                },
              },
            },
          },
        },
      },
    },
    '/accounts/team/': {
      get: {
        operationId: 'listTeam',
        responses: {
          '200': {
            description: 'Paginated team members',
            content: {
              'application/json': {
                schema: paginatedSchema('TeamMember'),
              },
            },
          },
        },
      },
    },
    '/accounts/preferences/': {
      get: {
        operationId: 'getPreferences',
        responses: {
          '200': {
            description: 'Organization preferences',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Preferences' },
              },
            },
          },
        },
      },
    },
    '/jobs/jobs/': {
      get: {
        operationId: 'listJobs',
        responses: {
          '200': {
            description: 'Paginated jobs',
            content: {
              'application/json': {
                schema: paginatedSchema('Job'),
              },
            },
          },
        },
      },
    },
    '/jobs/jobs/{jobId}/pipeline/': {
      get: {
        operationId: 'getJobPipeline',
        parameters: [
          {
            name: 'jobId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Pipeline stats by stage',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobPipeline' },
              },
            },
          },
        },
      },
    },
    '/candidates/candidates/': {
      get: {
        operationId: 'listCandidates',
        responses: {
          '200': {
            description: 'Paginated candidates',
            content: {
              'application/json': {
                schema: paginatedSchema('Candidate'),
              },
            },
          },
        },
      },
    },
    '/candidates/applications/': {
      get: {
        operationId: 'listApplications',
        responses: {
          '200': {
            description: 'Paginated applications',
            content: {
              'application/json': {
                schema: paginatedSchema('Application'),
              },
            },
          },
        },
      },
    },
    '/candidates/interviews/': {
      get: {
        operationId: 'listInterviews',
        responses: {
          '200': {
            description: 'Paginated interviews',
            content: {
              'application/json': {
                schema: paginatedSchema('Interview'),
              },
            },
          },
        },
      },
    },
    '/career-pages/career-page/setup/': {
      get: {
        operationId: 'getCareerPageSetup',
        responses: {
          '200': {
            description: 'Career page setup object',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CareerPageSetup' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: componentsSchemas,
  },
};

const responseSchemas = {
  generatedAt: new Date().toISOString(),
  source: 'src/lib/api.ts',
  schemas: componentsSchemas,
};

mkdirSync(docsDir, { recursive: true });
writeFileSync(path.resolve(docsDir, 'openapi.json'), JSON.stringify(openApi, null, 2));
writeFileSync(path.resolve(docsDir, 'response-schemas.json'), JSON.stringify(responseSchemas, null, 2));

console.log('Generated docs/openapi.json and docs/response-schemas.json');
