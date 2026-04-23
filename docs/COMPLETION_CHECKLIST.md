# Completion Checklist

This file captures what still needs to happen before the current integration can be considered 100% complete.

## Already complete

- Postman route differences were mapped.
- Missing API client methods were implemented.
- The missing UI integrations were wired up.
- The career page color picker and preview were fixed.
- Targeted tests passed for the touched flows.

## Still needed for 100% completion

- Run the full validation set again after the latest UI fix:
  - `npm run build`
  - `npm run test:run`
  - `npm run test:e2e`
- Regenerate API schema artifacts if `src/lib/api.ts` types changed:
  - `npm run schema:generate`
- Confirm the generated docs match the current client surface:
  - `docs/openapi.json`
  - `docs/response-schemas.json`
- Manually smoke test the live career page flow in a browser:
  - brand color selection in the settings modal
  - setup preview rendering
  - public candidate portal theming
- Verify the newly wired destructive actions and CRUD flows against the live API:
  - job deletion
  - interview question CRUD
  - collaborator management
  - career media upload/delete
  - candidate response fetch/summary views
- Add or update any missing regression tests for the touched screens if a new issue is found during smoke testing.
- Review the final diff for any cleanup items before merge.

## Definition of done

- Build, unit tests, and E2E tests are all green.
- Generated API docs are up to date.
- The career page editor and public preview reflect the same saved color theme.
- The new API flows work against the live backend without manual fixes.
- No open follow-up bugs remain in this integration slice.
