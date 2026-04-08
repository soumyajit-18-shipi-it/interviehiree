# API Response Schemas and OpenAPI

This project now generates response schemas directly from TypeScript models in `src/lib/api.ts`.

## Source of truth

- Response model types: `src/lib/api.ts`
- Generated JSON Schema bundle: `docs/response-schemas.json`
- Generated OpenAPI document: `docs/openapi.json`

## Regenerate schemas

```bash
npm run schema:generate
```

## Included schema models

- `Organization`
- `TeamMember`
- `Preferences`
- `Job`
- `JobOverview`
- `JobPipeline`
- `Candidate`
- `ResumeAnalysis`
- `Interview`
- `Application`
- `CareerPageSetup`
- `CareerPageDetails`

## Endpoint coverage in `openapi.json`

- `GET /accounts/organizations/`
- `GET /accounts/team/`
- `GET /accounts/preferences/`
- `GET /jobs/jobs/`
- `GET /jobs/jobs/{jobId}/pipeline/`
- `GET /candidates/candidates/`
- `GET /candidates/applications/`
- `GET /candidates/interviews/`
- `GET /career-pages/career-page/setup/`

The OpenAPI paths focus on the currently integrated frontend response shapes.
