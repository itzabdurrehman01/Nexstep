/**
 * mobile/src/api/careers.ts
 * Career and profile related API calls.
 */
import { apiClient } from './client';

const list = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

function normalizeJob(job: any, index: number) {
  return {
    ...job,
    id: String(job?.id ?? job?.jobId ?? `job-${index}`),
    title: String(job?.title ?? job?.jobTitle ?? 'Untitled opportunity'),
    company: String(job?.company ?? job?.companyName ?? 'Organisation not listed'),
    location: job?.location ?? job?.city ?? '',
    type: job?.type ?? job?.employmentType ?? '',
    salaryRange: job?.salaryRange ?? job?.salary ?? job?.stipendSalary ?? job?.compensation ?? '',
    skills: list<string>(job?.skills ?? job?.requirements ?? job?.qualifications ?? job?.keyRequirements),
    description: job?.description ?? job?.summary ?? '',
  };
}

function normalizeCareer(career: any, index: number) {
  return {
    ...career,
    id: String(career?.id ?? `career-${index}`),
    title: String(career?.title ?? career?.name ?? 'Career pathway'),
    demandLevel: String(career?.demandLevel ?? career?.demand_level ?? career?.demand ?? 'Growing'),
    avgSalaryPkrMonth: Number(career?.avgSalaryPkrMonth ?? career?.avg_salary_pkr ?? career?.avgSalaryPkr ?? career?.avgSalary ?? 0),
    growthDemand: String(career?.growthDemand ?? ''),
    requiredSkills: list<string>(career?.requiredSkills ?? career?.required_skills ?? career?.skills),
    riasecMatch: list<string>(career?.riasecMatch ?? career?.riasec_code?.split('-')),
  };
}

function normalizeRoadmap(value: any) {
  if (!value || !Array.isArray(value.milestones)) return null;
  return {
    ...value,
    milestones: value.milestones.filter(Boolean).map((milestone: any) => ({
      ...milestone,
      tasks: list<any>(milestone?.tasks).filter(Boolean),
    })),
  };
}

export async function fetchCareers() {
  const { data } = await apiClient.get('/api/careers');
  return list<any>(data?.data).map(normalizeCareer);
}

export async function fetchRecommendations(profile: any) {
  const { data } = await apiClient.post('/api/recommendations', {
    fscPct: profile?.marks?.fscPct,
    entryTestScore: profile?.marks?.entryTestScore,
    stream: profile?.preferredStream,
    city: profile?.city,
    budgetAnnualPkr: profile?.budgetAnnualPkr,
    topRiasecCluster: profile?.topRiasecCluster,
    interests: [profile?.targetCareer, profile?.goals, ...(profile?.skills ?? []).map((skill: any) => typeof skill === 'string' ? skill : skill?.name)],
  });
  return list<any>(data?.matches).map(normalizeCareer).map((career: any, index) => ({
    ...career,
    id: String(career.id ?? `recommendation-${index}`),
    matchScore: Number(career.matchScore) || 0,
    why: list<string>(career.why),
    entryTests: list<string>(career.entryTests),
    topUniversities: list<any>(career.topUniversities),
  }));
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/api/profile');
  return data?.data ?? null;
}

export async function updateProfile(profile: Record<string, any>) {
  const { data } = await apiClient.put('/api/profile', profile);
  return data?.data ?? profile;
}

export async function fetchRoadmap() {
  const { data } = await apiClient.get('/api/roadmap');
  return normalizeRoadmap(data?.data);
}

export async function fetchJobs() {
  const { data } = await apiClient.get('/api/jobs');
  return list<any>(data?.data).map(normalizeJob);
}

export async function fetchUniversities(params?: Record<string, string>) {
  const { data } = await apiClient.get('/api/universities', { params });
  return list(data?.data);
}

export async function fetchScholarships(params?: Record<string, string>) {
  const { data } = await apiClient.get('/api/scholarships', { params });
  return list(data?.data);
}

export async function fetchRiasecQuestions() {
  const { data } = await apiClient.get('/api/riasec/questions');
  return list<any>(data?.data).map((question, index) => ({
    id: Number(question?.id ?? index + 1),
    category: String(question?.category ?? 'I'),
    textEn: String(question?.textEn ?? ''),
    textUr: String(question?.textUr ?? question?.textEn ?? ''),
  }));
}

export async function saveQuizResult(result: { code: string; topTrait: string; streamRecommendation: string; fullScores: Record<string, number> }) {
  const { data } = await apiClient.post('/api/quiz-results', result);
  return data?.data ?? null;
}

export async function chatWithAI(message: string, profile?: any) {
  const { data } = await apiClient.post('/api/chat', { message, profile });
  return typeof data?.reply === 'string' ? data.reply : '';
}

export async function getSubscriptionStatus() {
  try {
    const { data } = await apiClient.get('/api/payments/subscription');
    return data?.data ?? null;
  } catch {
    return null;
  }
}
