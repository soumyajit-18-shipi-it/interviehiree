import {
  createCandidate,
  ensureOrganizationId,
  getApiBaseUrl,
  listJobs,
  updatePreferences,
} from './api';

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls listJobs with expected query params', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ count: 0, next: null, previous: null, results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await listJobs({ organization: 'org-1', search: 'designer', page_size: 25 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${getApiBaseUrl()}/jobs/jobs/?organization=org-1&search=designer&page_size=25`);
    expect((init as RequestInit).method ?? 'GET').toBe('GET');
  });

  it('sends multipart form-data for createCandidate', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ id: 'c-1' }), { status: 201, headers: { 'Content-Type': 'application/json' } }));

    const resume = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    await createCandidate({
      organization: 'org-1',
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1-555-2222',
      source: 'Career Page',
      current_title: 'Designer',
      resume,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).body).toBeInstanceOf(FormData);
    const body = (init as RequestInit).body as FormData;
    expect(body.get('organization')).toBe('org-1');
    expect(body.get('full_name')).toBe('Jane Doe');
    expect(body.get('resume')).toBe(resume);
  });

  it('sends cookie settings payload in updatePreferences', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ id: 'p-1', organization: 'org-1', cookie_settings: { analytics: true, marketing: false }, updated_at: '2026-04-06' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await updatePreferences('org-1', { analytics: true, marketing: false });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${getApiBaseUrl()}/accounts/preferences/?organization=org-1`);
    expect((init as RequestInit).method).toBe('PATCH');
    expect((init as RequestInit).headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect((init as RequestInit).body).toBe(JSON.stringify({ cookie_settings: { analytics: true, marketing: false } }));
  });

  it('throws a structured error when API responds with a JSON detail', async () => {
    vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    await expect(listJobs({ organization: 'org-1' })).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
    });
  });

  it('throws when no organization is available', async () => {
    vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    await expect(ensureOrganizationId()).rejects.toThrow('No organization found. Create an organization first.');
  });

  it('propagates network-level failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Network down'));

    await expect(listJobs({ organization: 'org-1' })).rejects.toThrow('Network down');
  });
});
