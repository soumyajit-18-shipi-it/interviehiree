import {
  ensureOrganizationId,
  getApplicationResponsesSummary,
  getJobAiInsights,
  getCandidateResponsesOverview,
  getJob,
  getJobPipeline,
  listCandidateResponses,
  listApplications,
  listCandidates,
  listInterviews,
  listResumeAnalyses,
  type Application,
  type Candidate,
  type Interview,
  type Job as ApiJob,
  type JobPipeline,
  type ResumeAnalysis,
} from '../../lib/api';

export type JobLike = Pick<ApiJob, 'id' | 'title' | 'status'> & Partial<Omit<ApiJob, 'id' | 'title' | 'status'>>;

export interface FunnelStage {
  label: string;
  count: number;
  base?: number;
  percentage: number;
}

export interface FunnelSource {
  label: string;
  count: number;
  color: string;
}

export interface Insight {
  id: string;
  text: string;
  type: 'warning' | 'recommendation' | 'success';
}

export interface ScoreBucket {
  range: string;
  percentage: number;
  candidates: number;
}

export interface ResumeCriteria {
  mustHave: string[];
  redFlags: string[];
  goodToHave: string[];
}

export interface OverviewMetrics {
  velocityDays: number;
  velocityLabel: string;
  velocityDeltaLabel: string;
  descriptionSummary: string;
  requirements: string[];
}

export interface CandidateFact {
  label: string;
  value: string;
}

export interface ScreeningCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
  screening: Array<{ label: string; value: string }>;
  insight: string;
  score: number;
  summary: string;
  facts: CandidateFact[];
}

export interface FunctionalCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
  techScore: number | null;
  domainExpertise: string;
  notes: string;
  summary: string;
  facts: CandidateFact[];
}

export interface JobDetailView {
  job: ApiJob;
  pipeline: JobPipeline | null;
  funnelStages: FunnelStage[];
  funnelSources: FunnelSource[];
  insights: Insight[];
  scoreDistribution: ScoreBucket[];
  overview: OverviewMetrics;
  resumeCriteria: ResumeCriteria;
  screeningCandidates: ScreeningCandidate[];
  functionalCandidates: FunctionalCandidate[];
  responseHighlights: Array<{
    applicationId: string;
    candidateName: string;
    totalResponses: number;
    averageScore: number | null;
    latestResponse: string;
  }>;
}

const sourceColors: Record<string, string> = {
  'Career Page': 'bg-blue-500',
  ATS: 'bg-cyan-400',
  'Bulk Upload': 'bg-orange-500',
  Scheduled: 'bg-pink-500',
  'Direct Link': 'bg-emerald-500',
};

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return 'Unknown';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysBetween(from: string, to: string) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0;
  }
  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
}

function bucketScores(analyses: ResumeAnalysis[]) {
  const buckets = [
    { range: '0–20', min: 0, max: 20, candidates: 0 },
    { range: '20–40', min: 20, max: 40, candidates: 0 },
    { range: '40–60', min: 40, max: 60, candidates: 0 },
    { range: '60–80', min: 60, max: 80, candidates: 0 },
    { range: '80–100', min: 80, max: 101, candidates: 0 },
  ];

  analyses.forEach((analysis) => {
    const score = Number(analysis.score ?? 0);
    const bucket = buckets.find((entry) => score >= entry.min && score < entry.max) ?? buckets[0];
    bucket.candidates += 1;
  });

  const total = analyses.length || 1;
  return buckets.map(({ range, candidates }) => ({
    range,
    candidates,
    percentage: Math.round((candidates / total) * 100),
  }));
}

function buildSourceBreakdown(applications: Application[]) {
  const counts = new Map<string, number>();
  applications.forEach((application) => {
    counts.set(application.source || 'Direct Link', (counts.get(application.source || 'Direct Link') ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => ({
      label,
      count,
      color: sourceColors[label] ?? 'bg-slate-400',
    }));
}

function buildFunnelStages(pipeline: JobPipeline | null, applications: Application[]) {
  const total = pipeline?.total ?? applications.length;
  const stages = [
    { label: 'Total Candidates', count: total, base: total },
    { label: 'Resume Analysis', count: pipeline?.resume_analysis ?? 0 },
    { label: 'Recruiter Screening', count: pipeline?.recruiter_screening ?? 0 },
    { label: 'Functional Interview', count: pipeline?.functional_interview ?? 0 },
    { label: 'Completed', count: pipeline?.completed ?? 0 },
    { label: 'Qualified', count: pipeline?.qualified ?? 0 },
  ];

  return stages.map((stage, index) => ({
    ...stage,
    percentage: total > 0 ? Math.round((stage.count / total) * 100) : 0,
    base: index === 0 ? total : stage.base,
  }));
}

function buildResumeCriteria(job: ApiJob): ResumeCriteria {
  const description = job.description || '';
  const title = job.title || 'this role';
  const role = job.role || job.business_unit || 'the team';
  const location = job.location || 'your location';

  const keywords = description
    .split(/[.\n•-]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    mustHave: keywords.length
      ? keywords
      : [
          `Experience relevant to ${title}`,
          `Evidence of impact in ${role}`,
          `Ability to work effectively in ${location}`,
        ],
    redFlags: [
      `No specific examples tied to ${title}`,
      'Limited evidence of ownership or measurable outcomes',
    ],
    goodToHave: [
      `Experience collaborating across ${role}`,
      'Strong communication and process discipline',
    ],
  };
}

function normalizeJob(job: JobLike, organizationId: string): ApiJob {
  const now = new Date().toISOString();
  const role = job.role || job.business_unit || job.title;
  return {
    id: job.id,
    organization: job.organization || organizationId,
    title: job.title,
    role,
    business_unit: job.business_unit || role,
    description: job.description || '',
    location: job.location || '',
    status: job.status || 'draft',
    created_by: job.created_by || 'System',
    created_at: job.created_at || now,
    updated_at: job.updated_at || now,
  };
}

function buildOverviewMetrics(job: ApiJob, applications: Application[], interviews: Interview[]) {
  const velocitySamples = interviews
    .map((interview) => {
      const application = applications.find((item) => item.id === interview.application);
      if (!application) {
        return 0;
      }
      return daysBetween(application.applied_at, interview.scheduled_for);
    })
    .filter((value) => value > 0);

  const avgVelocity = velocitySamples.length
    ? velocitySamples.reduce((sum, value) => sum + value, 0) / velocitySamples.length
    : applications.length
      ? applications.reduce((sum, application) => sum + daysBetween(application.applied_at, application.updated_at), 0) / applications.length
      : 0;

  const roundedVelocity = Number(avgVelocity.toFixed(1));
  const baseline = 5;
  const delta = baseline > 0 ? Math.round(Math.abs(((baseline - roundedVelocity) / baseline) * 100)) : 0;
  const comparison = roundedVelocity <= baseline
    ? `You're ${delta}% faster than the current pipeline baseline.`
    : `You're ${delta}% slower than the current pipeline baseline.`;

  const descriptionSummary = job.description?.trim()
    ? job.description.trim().split(/[.\n]/)[0] ?? job.description.trim()
    : `Live role details for ${job.title}.`;

  const requirements = buildResumeCriteria(job).mustHave;

  return {
    velocityDays: roundedVelocity,
    velocityLabel: `${roundedVelocity || 0} days / stage`,
    velocityDeltaLabel: comparison,
    descriptionSummary,
    requirements,
  };
}

function buildScreeningCandidates(
  applications: Application[],
  candidates: Candidate[],
  analyses: ResumeAnalysis[],
) {
  return applications.map((application) => {
    const candidate = candidates.find((item) => item.id === application.candidate);
    const analysis = analyses.find((item) => item.application === application.id);
    const name = candidate?.full_name || application.candidate_name || 'Unknown Candidate';
    const score = analysis?.score ?? 0;
    const shortStatus = analysis?.shortlisted ? 'Shortlisted' : analysis?.waitlisted ? 'Waitlisted' : 'Review';
    const isCompleted = ['completed', 'qualified', 'offer', 'selected', 'functional_complete'].some((token) => application.current_stage.toLowerCase().includes(token));

    return {
      id: application.id,
      name,
      email: candidate?.email || 'Email unavailable',
      status: isCompleted ? 'Completed' : 'In Progress',
      screening: [
        { label: 'Source', value: application.source },
        { label: 'Resume', value: shortStatus },
        { label: 'Applied', value: formatDateLabel(application.applied_at) },
      ],
      insight: analysis?.summary || application.notes || 'Awaiting review.',
      score,
      summary: analysis?.summary || application.notes || `Candidate applying for ${application.job_title || application.job}`,
      facts: [
        { label: 'Current Title', value: candidate?.current_title || 'Not provided' },
        { label: 'Status', value: titleCase(application.current_stage) },
        { label: 'Applied', value: formatDateLabel(application.applied_at) },
      ],
    };
  });
}

function buildFunctionalCandidates(
  applications: Application[],
  candidates: Candidate[],
  interviews: Interview[],
) {
  return interviews.map((interview) => {
    const application = applications.find((item) => item.id === interview.application);
    const candidate = application ? candidates.find((item) => item.id === application.candidate) : undefined;
    const name = candidate?.full_name || application?.candidate_name || 'Unknown Candidate';
    const scheduled = formatDateLabel(interview.scheduled_for);
    const expertise = candidate?.current_title || titleCase(interview.interview_type);

    return {
      id: interview.id,
      name,
      email: candidate?.email || 'Email unavailable',
      status: titleCase(interview.status),
      techScore: interview.score,
      domainExpertise: expertise,
      notes: interview.notes || 'No evaluator notes provided.',
      summary: interview.notes || application?.notes || `Interview scheduled for ${scheduled}`,
      facts: [
        { label: 'Interview Type', value: titleCase(interview.interview_type) },
        { label: 'Scheduled', value: scheduled },
        { label: 'Status', value: titleCase(interview.status) },
      ],
    };
  });
}

function buildInsights(
  applications: Application[],
  analyses: ResumeAnalysis[],
  interviews: Interview[],
  sources: FunnelSource[],
  responsesOverview: unknown,
  aiInsightsPayload: unknown,
) {
  const insights: Insight[] = [];
  const totalApplications = applications.length || 1;
  const analyzedRate = Math.round((analyses.length / totalApplications) * 100);
  const topSource = sources[0];
  const averageInterviewScore = interviews.length
    ? Math.round(
        interviews.reduce((sum, interview) => sum + (interview.score ?? 0), 0) /
        Math.max(1, interviews.filter((interview) => typeof interview.score === 'number').length || 1)
      )
    : 0;

  if (analyzedRate < 80) {
    insights.push({
      id: 'analysis-rate',
      type: 'warning',
      text: `Resume analysis coverage is at ${analyzedRate}%. Review automation or screening rules to keep the pipeline moving.`,
    });
  } else {
    insights.push({
      id: 'analysis-rate',
      type: 'success',
      text: `Resume analysis coverage is strong at ${analyzedRate}% across active applications.`,
    });
  }

  if (topSource && topSource.count / totalApplications >= 0.6) {
    insights.push({
      id: 'source-mix',
      type: 'recommendation',
      text: `${topSource.label} contributes most applications. Broaden sourcing to reduce funnel concentration.`,
    });
  } else if (topSource) {
    insights.push({
      id: 'source-mix',
      type: 'success',
      text: `Sourcing is diversified with ${topSource.label} as the leading source.`,
    });
  }

  if (averageInterviewScore >= 80) {
    insights.push({
      id: 'interview-score',
      type: 'success',
      text: `Functional interviews are averaging ${averageInterviewScore}/100. The strongest candidates are trending well.`,
    });
  } else if (averageInterviewScore > 0) {
    insights.push({
      id: 'interview-score',
      type: 'recommendation',
      text: `Functional interview scores are averaging ${averageInterviewScore}/100. Review calibration and question quality.`,
    });
  }

  if (responsesOverview && typeof responsesOverview === 'object') {
    const responseData = responsesOverview as Record<string, unknown>;
    const responseCount = Number(responseData.total_responses ?? responseData.total ?? NaN);

    if (!Number.isNaN(responseCount) && responseCount > 0) {
      insights.push({
        id: 'responses-overview',
        type: 'success',
        text: `Response insights are available for ${responseCount} candidate submissions in this job.`,
      });
    }
  }

  if (Array.isArray(aiInsightsPayload)) {
    aiInsightsPayload.slice(0, 2).forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const data = entry as Record<string, unknown>;
      const rawText =
        typeof data.insight === 'string'
          ? data.insight
          : typeof data.title === 'string'
            ? data.title
            : '';

      if (!rawText.trim()) {
        return;
      }

      const typeValue = typeof data.type === 'string' ? data.type.toLowerCase() : '';
      const type: Insight['type'] = typeValue === 'warning'
        ? 'warning'
        : typeValue === 'success'
          ? 'success'
          : 'recommendation';

      insights.push({
        id: `ai-insight-${index}`,
        type,
        text: rawText,
      });
    });
  }

  return insights.slice(0, 4);
}

async function buildResponseHighlights(
  applications: Application[],
  candidatesById: Map<string, Candidate>,
) {
  const targets = applications.slice(0, 8);

  const rows = await Promise.all(
    targets.map(async (application) => {
      try {
        const [summary, responses] = await Promise.all([
          getApplicationResponsesSummary(application.id).catch(() => null),
          listCandidateResponses(application.id, { page_size: 5 }).catch(() => null),
        ]);

        const candidate = candidatesById.get(application.candidate);
        const totalResponses = Number(summary?.total_responses ?? responses?.count ?? 0);
        const averageScore = typeof summary?.average_score === 'number' ? summary.average_score : null;
        const latestResponse = responses?.results?.[0]?.response_text?.trim() || 'No response captured yet.';

        return {
          applicationId: application.id,
          candidateName: candidate?.full_name || application.candidate_name || 'Unknown Candidate',
          totalResponses,
          averageScore,
          latestResponse,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
  );

  return rows.filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function buildScoreDistribution(analyses: ResumeAnalysis[]) {
  return bucketScores(analyses);
}

export async function loadJobDetailView(job: JobLike): Promise<JobDetailView> {
  const organizationId = job.organization ?? (await ensureOrganizationId().catch(() => ''));
  const [fullJobResponse, pipeline, applicationsResponse, candidatesResponse, analysesResponse, interviewsResponse, responsesOverview, aiInsightsPayload] = await Promise.all([
    getJob(job.id).catch(() => null),
    getJobPipeline(job.id).catch(() => null),
    listApplications({ organization: organizationId, job: job.id, page_size: 200 }).catch(() => ({ count: 0, next: null, previous: null, results: [] })),
    listCandidates({ organization: organizationId, job: job.id, page_size: 200 }).catch(() => ({ count: 0, next: null, previous: null, results: [] })),
    listResumeAnalyses({ organization: organizationId, job: job.id, page_size: 200 }).catch(() => ({ count: 0, next: null, previous: null, results: [] })),
    listInterviews({ organization: organizationId, job: job.id, page_size: 200 }).catch(() => ({ count: 0, next: null, previous: null, results: [] })),
    getCandidateResponsesOverview(job.id).catch(() => null),
    getJobAiInsights(job.id).catch(() => null),
  ]);

  const fullJob = fullJobResponse ?? normalizeJob(job, organizationId);

  const applications = applicationsResponse.results;
  const candidates = candidatesResponse.results;
  const analyses = analysesResponse.results;
  const interviews = interviewsResponse.results;
  const funnelSources = buildSourceBreakdown(applications);
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const responseHighlights = await buildResponseHighlights(applications, candidateById);

  return {
    job: fullJob,
    pipeline,
    funnelStages: buildFunnelStages(pipeline, applications),
    funnelSources,
    insights: buildInsights(applications, analyses, interviews, funnelSources, responsesOverview, aiInsightsPayload),
    scoreDistribution: buildScoreDistribution(analyses),
    overview: buildOverviewMetrics(fullJob, applications, interviews),
    resumeCriteria: buildResumeCriteria(fullJob),
    screeningCandidates: buildScreeningCandidates(applications, candidates, analyses),
    functionalCandidates: buildFunctionalCandidates(applications, candidates, interviews),
    responseHighlights,
  };
}
