import { expect, test, type Page, type Route } from '@playwright/test';

const apiBase = (process.env.VITE_API_BASE_URL ?? 'https://dhruvshah2706.pythonanywhere.com').replace(/\/$/, '');
const apiUsername = process.env.VITE_API_USERNAME ?? 'e2e_user';
const apiPassword = process.env.VITE_API_PASSWORD ?? 'e2e_pass';
const expectedAuthHeader = `Basic ${Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64')}`;

function json(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });
}

async function setupAuthenticatedMocks(
  page: Page,
  options?: {
    forceUnauthorizedForJobs?: boolean;
    onAuthorizedRequest?: () => void;
  },
) {
  await page.route(`${apiBase}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    const authorization = request.headers().authorization;

    if (authorization !== expectedAuthHeader) {
      return json(route, { detail: 'Unauthorized' }, 401);
    }

    options?.onAuthorizedRequest?.();

    if (method === 'GET' && url.includes('/accounts/organizations/')) {
      return json(route, [
        {
          id: 'org-1',
          name: 'IntervieHire',
          domain: 'interviehire',
          contact_email: 'admin@interviehire.ai',
          website_url: 'https://interviehire.ai',
          location: 'Delhi',
          description: 'Hiring platform',
          logo: null,
          created_at: '2026-04-06T00:00:00Z',
          updated_at: '2026-04-06T00:00:00Z',
        },
      ]);
    }

    if (method === 'GET' && url.includes('/jobs/jobs/?')) {
      if (options?.forceUnauthorizedForJobs) {
        return json(route, { detail: 'Token expired' }, 401);
      }

      return json(route, {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'job-1',
            organization: 'org-1',
            title: 'Authenticated Product Designer',
            role: 'Design',
            business_unit: 'Design',
            description: 'Design role',
            location: 'Remote',
            status: 'published',
            created_by: 'Alice',
            created_at: '2026-04-06T00:00:00Z',
            updated_at: '2026-04-06T00:00:00Z',
          },
        ],
      });
    }

    if (method === 'GET' && url.match(/\/jobs\/jobs\/.+\/pipeline\/$/)) {
      return json(route, {
        total: 4,
        resume_analysis: 3,
        recruiter_screening: 2,
        functional_interview: 1,
        completed: 1,
        qualified: 1,
      });
    }

    if (method === 'GET' && url.includes('/accounts/team/?')) {
      return json(route, {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'tm-1',
            username: 'sarah',
            email: 'sarah@example.com',
            first_name: 'Sarah',
            last_name: 'Connor',
            display_name: 'Sarah Connor',
            organization: 'org-1',
            designation: 'Head of Talent',
            user_type: 'Admin',
            status: 'Active',
          },
        ],
      });
    }

    if (method === 'GET' && url.includes('/accounts/preferences/?')) {
      return json(route, {
        id: 'pref-1',
        organization: 'org-1',
        cookie_settings: { analytics: true, marketing: false },
        updated_at: '2026-04-06T00:00:00Z',
      });
    }

    if (method === 'GET' && url.includes('/career-pages/career-page/setup/?')) {
      return json(route, {
        id: 'cps-1',
        organization: 'org-1',
        headline: 'Join us',
        subheadline: 'Build the future',
        slug: 'careers',
        is_live: true,
        brand_color: '#6B46FF',
        created_at: '2026-04-06T00:00:00Z',
        updated_at: '2026-04-06T00:00:00Z',
      });
    }

    return json(route, {});
  });
}

test('authenticated flow loads protected data with auth header', async ({ page }) => {
  let sawAuthorizedRequest = false;
  await setupAuthenticatedMocks(page, {
    onAuthorizedRequest: () => {
      sawAuthorizedRequest = true;
    },
  });

  await page.goto('/');

  await expect(page.getByText('Authenticated Product Designer')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Team Access' })).toBeVisible();
  expect(sawAuthorizedRequest).toBeTruthy();
});

test('authenticated flow surfaces API auth rejection cleanly', async ({ page }) => {
  await setupAuthenticatedMocks(page, { forceUnauthorizedForJobs: true });

  await page.goto('/');

  await expect(page.getByText('Failed to load jobs from API.').first()).toBeVisible();
});
