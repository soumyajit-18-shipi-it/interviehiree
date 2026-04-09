const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://dhruvshah2706.pythonanywhere.com';
const API_USERNAME = import.meta.env.VITE_API_USERNAME as string | undefined;
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD as string | undefined;

export type UUID = string;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Organization {
  id: UUID;
  name: string;
  domain: string;
  contact_email: string;
  website_url: string;
  location: string;
  description: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: UUID;
  user?: UUID;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  organization: UUID;
  designation: string;
  user_type: string;
  status: string;
  registered_on?: string;
}

export interface Preferences {
  id: UUID;
  organization: UUID;
  cookie_settings: {
    analytics: boolean;
    marketing: boolean;
  };
  updated_at: string;
}

export interface Job {
  id: UUID;
  organization: UUID;
  title: string;
  role: string;
  business_unit: string;
  description: string;
  location: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  listed_on_career_page?: boolean;
  total_candidates?: number;
  resume_analysis?: number;
  recruiter_screening?: number;
  functional_interview?: number;
  completed?: number;
  qualified?: number;
}

export interface JobOverview {
  total_jobs: number;
  published_jobs: number;
  draft_jobs: number;
  archived_jobs: number;
  jobs: Job[];
}

export interface JobPipeline {
  total: number;
  resume_analysis: number;
  recruiter_screening: number;
  functional_interview: number;
  completed: number;
  qualified: number;
}

export interface Candidate {
  id: UUID;
  organization: UUID;
  full_name: string;
  email: string;
  phone: string;
  source: string;
  current_title: string;
  resume: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysis {
  id: UUID;
  application: UUID;
  score: number;
  summary: string;
  shortlisted: boolean;
  waitlisted: boolean;
  analysed_at?: string;
}

export interface Interview {
  id: UUID;
  application: UUID;
  interview_type: string;
  scheduled_for: string;
  score: number | null;
  status: string;
  link: string;
  notes: string;
  created_at: string;
}

export interface Application {
  id: UUID;
  organization: UUID;
  candidate: UUID;
  candidate_name?: string;
  job: UUID;
  job_title?: string;
  source: string;
  current_stage: string;
  notes: string;
  applied_at: string;
  updated_at: string;
  resume_analysis?: ResumeAnalysis | null;
  interviews?: Interview[];
}

export interface CareerPageSetup {
  id: UUID;
  organization: UUID;
  headline: string;
  subheadline: string;
  slug: string;
  is_live: boolean;
  brand_color: string;
  live_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerPageDetails {
  id?: UUID;
  slug: string;
  headline?: string;
  subheadline?: string;
  organization?: UUID;
  is_live?: boolean;
  brand_color?: string;
}

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function toQuery(params?: Record<string, string | number | boolean | null | undefined>) {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : '';
}

function withAuthHeader(headers: Record<string, string> = {}) {
  if (API_USERNAME && API_PASSWORD) {
    const encoded = btoa(`${API_USERNAME}:${API_PASSWORD}`);
    return { ...headers, Authorization: `Basic ${encoded}` };
  }
  return headers;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: withAuthHeader({
      Accept: 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    const message = isJson && payload && typeof payload === 'object' && 'detail' in payload
      ? String((payload as Record<string, unknown>).detail)
      : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function ensureOrganizationId(explicitOrganizationId?: string): Promise<string> {
  if (explicitOrganizationId) {
    return explicitOrganizationId;
  }
  const organizations = await listOrganizations();
  if (!organizations.length) {
    throw new Error('No organization found. Create an organization first.');
  }
  return organizations[0].id;
}

// Accounts
export function listOrganizations() {
  return request<Organization[]>('/accounts/organizations/');
}

export function createOrganization(data: {
  name: string;
  domain: string;
  contact_email: string;
  website_url: string;
  location: string;
  description: string;
  logo?: File | null;
}) {
  const body = new FormData();
  body.append('name', data.name);
  body.append('domain', data.domain);
  body.append('contact_email', data.contact_email);
  body.append('website_url', data.website_url);
  body.append('location', data.location);
  body.append('description', data.description);
  if (data.logo) {
    body.append('logo', data.logo);
  }
  return request<Organization>('/accounts/organizations/', {
    method: 'POST',
    body,
  });
}

export function getOrganization(id: string) {
  return request<Organization>(`/accounts/organizations/${id}/`);
}

export function updateOrganization(id: string, data: Partial<Pick<Organization, 'name' | 'location'>>) {
  return request<Organization>(`/accounts/organizations/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteOrganization(id: string) {
  return request<void>(`/accounts/organizations/${id}/`, { method: 'DELETE' });
}

export function listTeam(params: {
  organization: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<TeamMember>>(`/accounts/team/${toQuery(params)}`);
}

export function createTeamMember(data: {
  organization: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  designation: string;
  user_type: string;
  status: string;
}) {
  return request<TeamMember>('/accounts/team/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getTeamMember(id: string) {
  return request<TeamMember>(`/accounts/team/${id}/`);
}

export function updateTeamMember(id: string, data: Partial<Pick<TeamMember, 'designation' | 'status'>>) {
  return request<TeamMember>(`/accounts/team/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteTeamMember(id: string) {
  return request<void>(`/accounts/team/${id}/`, { method: 'DELETE' });
}

export function getPreferences(organization: string) {
  return request<Preferences>(`/accounts/preferences/${toQuery({ organization })}`);
}

export function updatePreferences(organization: string, cookie_settings: Preferences['cookie_settings']) {
  return request<Preferences>(`/accounts/preferences/${toQuery({ organization })}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookie_settings }),
  });
}

export function changePassword(data: { current_password: string; new_password: string }) {
  return request<{ detail?: string }>('/accounts/change-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Jobs
export function listJobs(params: {
  organization: string;
  status?: string;
  role?: string;
  location?: string;
  search?: string;
  created_by?: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<Job>>(`/jobs/jobs/${toQuery(params)}`);
}

export function createJob(data: {
  organization: string;
  title: string;
  role: string;
  business_unit: string;
  description: string;
  location: string;
  status: string;
}) {
  return request<Job>('/jobs/jobs/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getJob(id: string) {
  return request<Job>(`/jobs/jobs/${id}/`);
}

export function updateJob(id: string, data: Partial<Pick<Job, 'status' | 'location'>>) {
  return request<Job>(`/jobs/jobs/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateJobCareerPageListing(id: string, listedOnCareerPage: boolean) {
  return request<Job>(`/jobs/jobs/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listed_on_career_page: listedOnCareerPage }),
  });
}

export function deleteJob(id: string) {
  return request<void>(`/jobs/jobs/${id}/`, { method: 'DELETE' });
}

export function getJobOverview(organization: string) {
  return request<JobOverview>(`/jobs/jobs/overview/${toQuery({ organization })}`);
}

export function getJobPipeline(jobId: string) {
  return request<JobPipeline>(`/jobs/jobs/${jobId}/pipeline/`);
}

// Candidates
export function listCandidates(params: {
  organization: string;
  source?: string;
  search?: string;
  stage?: string;
  job?: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<Candidate>>(`/candidates/candidates/${toQuery(params)}`);
}

export function createCandidate(data: {
  organization: string;
  full_name: string;
  email: string;
  phone: string;
  source: string;
  current_title: string;
  resume: File;
}) {
  const body = new FormData();
  body.append('organization', data.organization);
  body.append('full_name', data.full_name);
  body.append('email', data.email);
  body.append('phone', data.phone);
  body.append('source', data.source);
  body.append('current_title', data.current_title);
  body.append('resume', data.resume);
  return request<Candidate>('/candidates/candidates/', {
    method: 'POST',
    body,
  });
}

export function getCandidate(id: string) {
  return request<Candidate>(`/candidates/candidates/${id}/`);
}

export function updateCandidate(id: string, data: Partial<Pick<Candidate, 'current_title'>>) {
  return request<Candidate>(`/candidates/candidates/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteCandidate(id: string) {
  return request<void>(`/candidates/candidates/${id}/`, { method: 'DELETE' });
}

export function listApplications(params: {
  organization: string;
  job?: string;
  candidate?: string;
  stage?: string;
  source?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<Application>>(`/candidates/applications/${toQuery(params)}`);
}

export function createApplication(data: {
  organization: string;
  candidate: string;
  job: string;
  source: string;
  current_stage: string;
  notes: string;
}) {
  return request<Application>('/candidates/applications/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getApplication(id: string) {
  return request<Application>(`/candidates/applications/${id}/`);
}

export function updateApplication(id: string, data: Partial<Pick<Application, 'current_stage' | 'notes'>>) {
  return request<Application>(`/candidates/applications/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteApplication(id: string) {
  return request<void>(`/candidates/applications/${id}/`, { method: 'DELETE' });
}

export function listResumeAnalyses(params: {
  organization: string;
  job?: string;
  score_min?: number;
  score_max?: number;
  shortlisted?: boolean;
  waitlisted?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<ResumeAnalysis>>(`/candidates/resume-analysis/${toQuery(params)}`);
}

export function createResumeAnalysis(data: {
  application: string;
  score: number;
  summary: string;
  shortlisted: boolean;
  waitlisted: boolean;
}) {
  return request<ResumeAnalysis>('/candidates/resume-analysis/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function listInterviews(params: {
  organization: string;
  job?: string;
  type?: string;
  status?: string;
  score_min?: number;
  score_max?: number;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return request<PaginatedResponse<Interview>>(`/candidates/interviews/${toQuery(params)}`);
}

export function createInterview(data: {
  application: string;
  interview_type: string;
  scheduled_for: string;
  score?: number;
  status: string;
  link: string;
  notes: string;
}) {
  return request<Interview>('/candidates/interviews/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getCandidateResponsesOverview(jobId: string) {
  return request<unknown>(`/candidates/responses/${jobId}/overview/`);
}

export function getCandidateUsageOverview(organization: string) {
  return request<unknown>(`/candidates/usage/overview/${toQuery({ organization })}`);
}

// Career pages
export function getCareerPageSetup(organization: string) {
  return request<CareerPageSetup>(`/career-pages/career-page/setup/${toQuery({ organization })}`);
}

export function createCareerPageSetup(data: {
  organization: string;
  headline: string;
  subheadline: string;
  slug: string;
  is_live: boolean;
  brand_color: string;
}) {
  return request<CareerPageSetup>(`/career-pages/career-page/setup/${toQuery({ organization: data.organization })}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateCareerPageSetup(
  organization: string,
  data: Partial<Pick<CareerPageSetup, 'headline' | 'subheadline' | 'slug' | 'is_live' | 'brand_color'>>,
) {
  return request<CareerPageSetup>(`/career-pages/career-page/setup/${toQuery({ organization })}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organization, ...data }),
  });
}

export function getCareerPageDetails(slug: string) {
  return request<CareerPageDetails>(`/career-pages/career-page/${slug}/`);
}

export function getCareerPageJobs(params: {
  slug: string;
  search?: string;
  role?: string;
  location?: string;
  page?: number;
  page_size?: number;
}) {
  const { slug, ...query } = params;
  return request<PaginatedResponse<Job>>(`/career-pages/career-page/${slug}/jobs/${toQuery(query)}`);
}
