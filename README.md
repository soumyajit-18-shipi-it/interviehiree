# IntervieHire Frontend

Recruiting workflow frontend built with React + TypeScript + Vite.

## Development

```bash
npm install
npm run dev
```

Configure API access with `.env.local`:

```bash
VITE_API_BASE_URL=https://dhruvshah2706.pythonanywhere.com
VITE_API_USERNAME=
VITE_API_PASSWORD=
```

## Test Commands

```bash
npm run test:run
npm run test:e2e
```

### Included test suites

- Vitest unit/integration tests for API client and core screens
- Playwright smoke tests
- Playwright authenticated flow tests with auth-required API mocks
- Negative-path tests for API errors and UI failure toasts

## Build

```bash
npm run build
```

## API Schemas

Response schema and OpenAPI generation is based on TypeScript models in `src/lib/api.ts`.

```bash
npm run schema:generate
```

Generated artifacts:

- `docs/response-schemas.json`
- `docs/openapi.json`
- `docs/API_SCHEMAS.md`

## CI

GitHub Actions workflow is available at `.github/workflows/ci.yml` and runs:

- schema generation
- unit/integration tests
- production build
- Playwright e2e tests
