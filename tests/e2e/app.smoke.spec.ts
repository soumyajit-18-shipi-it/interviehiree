import { expect, test, type Page, type Route } from '@playwright/test';

const apiBase = (process.env.VITE_API_BASE_URL ?? 'https://dhruvshah2706.pythonanywhere.com').replace(/\/$/, '');

function json(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });
}

async function setupApiMocks(page: Page) {
  await page.route(`${apiBase}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();

    if (method === 'GET' && url.includes('/accounts/organizations/')) {
      if (url.match(/\/accounts\/organizations\/org-1\/$/)) {
        return json(route, {
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
        });
      }

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
      return json(route, {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'job-1',
            organization: 'org-1',
            title: 'Senior Product Designer',
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

    if (method === 'POST' && url.endsWith('/jobs/jobs/')) {
      return json(
        route,
        {
          id: 'job-2',
          organization: 'org-1',
          title: 'QA Engineer',
          role: 'Engineering',
          business_unit: 'Engineering',
          description: 'QA role',
          location: 'Remote',
          status: 'draft',
          created_by: 'Me',
          created_at: '2026-04-06T00:00:00Z',
          updated_at: '2026-04-06T00:00:00Z',
        },
        201,
      );
    }

    if (method === 'GET' && url.match(/\/jobs\/jobs\/.+\/pipeline\/$/)) {
      return json(route, {
        total: 10,
        resume_analysis: 7,
        recruiter_screening: 4,
        functional_interview: 2,
        completed: 1,
        qualified: 1,
      });
    }

    if (method === 'GET' && url.includes('/candidates/applications/?')) {
      return json(route, {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'app-1',
            organization: 'org-1',
            candidate: 'cand-1',
            candidate_name: 'Jane Doe',
            job: 'job-1',
            source: 'Career Page',
            current_stage: 'recruiter_screening',
            notes: 'note',
            applied_at: '2026-04-06T00:00:00Z',
            updated_at: '2026-04-06T00:00:00Z',
            resume_analysis: {
              id: 'ra-1',
              application: 'app-1',
              score: 88,
              summary: 'Strong',
              shortlisted: true,
              waitlisted: false,
            },
            interviews: [],
          },
        ],
      });
    }

    if (method === 'GET' && url.includes('/candidates/interviews/?')) {
      return json(route, {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'int-1',
            application: 'app-1',
            interview_type: 'Functional',
            scheduled_for: '2026-04-06T10:00:00Z',
            score: 90,
            status: 'completed',
            link: 'https://meet.example.com/1',
            notes: 'Good interview',
            created_at: '2026-04-06T00:00:00Z',
          },
        ],
      });
    }

    if (method === 'GET' && url.includes('/candidates/usage/overview/')) {
      return json(route, { total: 1 });
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

    if (method === 'POST' && url.endsWith('/accounts/team/')) {
      return json(route, { id: 'tm-2' }, 201);
    }

    if (method === 'GET' && url.includes('/accounts/preferences/?')) {
      return json(route, {
        id: 'pref-1',
        organization: 'org-1',
        cookie_settings: { analytics: true, marketing: false },
        updated_at: '2026-04-06T00:00:00Z',
      });
    }

    if (method === 'PATCH' && url.match(/\/accounts\/organizations\/org-1\/$/)) {
      return json(route, {
        id: 'org-1',
        name: 'IntervieHire',
        location: 'Org Admin',
      });
    }

    if (method === 'PATCH' && url.includes('/accounts/preferences/?')) {
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

    if (method === 'PATCH' && url.includes('/career-pages/career-page/setup/?')) {
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

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page);
});

test('smoke: navigates major app sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
  await expect(page.getByText('Senior Product Designer')).toBeVisible();

  await page.getByRole('button', { name: 'Usage Overview' }).click();
  await expect(page.getByRole('heading', { name: 'Usage Overview' })).toBeVisible();

  await page.getByRole('button', { name: 'Team Access' }).click();
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible();
  await expect(page.getByText('Sarah Connor')).toBeVisible();

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Platform Settings' })).toBeVisible();
});

test('smoke: can create job and send invite', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /^New Job$/ }).click();
  await page.getByPlaceholder('e.g. Senior Product Designer').fill('QA Engineer');
  await page.getByRole('button', { name: 'Create Job' }).click();
  await expect(page.getByText('Job created successfully.')).toBeVisible();

  await page.getByRole('button', { name: 'Team Access' }).click();
  await page.getByRole('button', { name: 'Invite Member' }).click();
  await page.getByPlaceholder('Add more emails...').fill('newuser@example.com');
  await page.getByRole('button', { name: 'Send Invites' }).click();
  await expect(page.getByText('Invite sent successfully.')).toBeVisible();
});

test('smoke: can save settings and open career modal', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Profile settings saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Data & Privacy' }).click();
  await page.getByRole('button', { name: 'Manage Cookies' }).click();
  await page.getByRole('button', { name: 'Save Preferences' }).click();
  await expect(page.getByText('Cookie preferences saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Career Page' }).click();
  await expect(page.getByRole('heading', { name: 'Career Page Setup' })).toBeVisible();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Career page settings saved.')).toBeVisible();
});
