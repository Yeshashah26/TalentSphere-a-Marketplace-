import { SKILL_OPTIONS } from './jobFilters';
import { hasResume } from './resume';

const TITLE_KEYWORDS = {
  frontend: ['react', 'javascript', 'typescript', 'css', 'ui', 'frontend'],
  backend: ['node', 'python', 'java', 'api', 'backend', 'sql', 'postgresql'],
  fullstack: ['full stack', 'fullstack', 'react', 'node'],
  design: ['figma', 'ux', 'ui', 'design'],
  devops: ['aws', 'docker', 'kubernetes', 'devops', 'ci/cd'],
  data: ['python', 'sql', 'data', 'analytics'],
};

function candidateExperienceYears(c) {
  return (Number(c.yearsExp) || 0) + (Number(c.monthsExp) || 0) / 12;
}

function normalizeList(items = []) {
  return [...new Set(items.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
}

/** Build searchable text from profile + resume metadata (proxy for resume content). */
export function buildCandidateResumeText(candidate) {
  const parts = [
    candidate.fullName,
    candidate.jobTitle,
    candidate.professionalSummary,
    candidate.education,
    candidate.graduationYear,
    candidate.linkedin,
    candidate.portfolio,
    candidate.resumeFileName,
    ...(candidate.skills || []),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function extractJobKeywords(job) {
  const blob = [
    job.title,
    job.department,
    job.description,
    job.requirements,
    job.responsibilities,
    job.certifications,
    job.employmentType,
    job.jobLevel,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const found = new Set();
  SKILL_OPTIONS.forEach((skill) => {
    if (blob.includes(skill.toLowerCase())) found.add(skill);
  });

  const words = blob.split(/[^a-z0-9+#./]+/).filter((w) => w.length > 2);
  words.forEach((w) => {
    if (w.length >= 4) found.add(w);
  });

  return [...found];
}

function titleAlignment(candidateTitle, jobTitle) {
  const c = (candidateTitle || '').toLowerCase();
  const j = (jobTitle || '').toLowerCase();
  if (!c || !j) return 0;
  if (c.includes(j) || j.includes(c)) return 1;
  for (const [, keys] of Object.entries(TITLE_KEYWORDS)) {
    const cMatch = keys.some((k) => c.includes(k));
    const jMatch = keys.some((k) => j.includes(k));
    if (cMatch && jMatch) return 0.85;
  }
  const cWords = c.split(/\s+/);
  const jWords = j.split(/\s+/);
  const overlap = cWords.filter((w) => jWords.some((jw) => jw.includes(w) || w.includes(jw)));
  return overlap.length ? Math.min(0.7, overlap.length * 0.2) : 0;
}

function experienceFit(candidateYears, job) {
  const required = Number(job.experienceYears);
  if (!required || Number.isNaN(required)) {
    const level = (job.jobLevel || '').toLowerCase();
    if (level === 'junior') return candidateYears <= 3 ? 1 : 0.5;
    if (level === 'senior' || level === 'lead') return candidateYears >= 5 ? 1 : 0.4;
    return candidateYears >= 2 ? 0.8 : 0.6;
  }
  const diff = Math.abs(candidateYears - required);
  if (diff <= 1) return 1;
  if (diff <= 2) return 0.75;
  if (diff <= 4) return 0.45;
  return 0.2;
}

function skillOverlap(candidateSkills, jobKeywords) {
  const cSkills = normalizeList(candidateSkills);
  const jKeys = normalizeList(jobKeywords);
  if (!jKeys.length) return { ratio: 0, matched: [] };

  const matched = [];
  jKeys.forEach((key) => {
    const hit = cSkills.some(
      (s) => s === key || s.includes(key) || key.includes(s)
    );
    if (hit) matched.push(key);
  });

  const blob = cSkills.join(' ');
  jKeys.forEach((key) => {
    if (!matched.includes(key) && blob.includes(key)) matched.push(key);
  });

  const ratio = matched.length / Math.min(jKeys.length, 8);
  return { ratio: Math.min(1, ratio), matched: [...new Set(matched)].slice(0, 6) };
}

function resumeKeywordMatch(resumeText, jobKeywords) {
  if (!resumeText || !jobKeywords.length) return { ratio: 0, matched: [] };
  const matched = jobKeywords.filter((k) => resumeText.includes(k.toLowerCase()));
  return {
    ratio: Math.min(1, matched.length / Math.min(jobKeywords.length, 10)),
    matched: matched.slice(0, 5),
  };
}

function profileCompleteness(candidate) {
  const fields = [
    hasResume(candidate),
    candidate.profilePhoto,
    candidate.jobTitle,
    (candidate.skills || []).length >= 3,
    candidate.professionalSummary,
    candidate.education,
  ];
  return fields.filter(Boolean).length / fields.length;
}

/**
 * Score a candidate against a single job (0–100) with explainable reasons.
 */
export function scoreCandidateForJob(candidate, job) {
  const reasons = [];
  const resumeText = buildCandidateResumeText(candidate);
  const jobKeywords = extractJobKeywords(job);
  const candidateSkills = candidate.skills || [];
  const expYears = candidateExperienceYears(candidate);

  let score = 0;

  if (hasResume(candidate)) {
    score += 12;
    reasons.push('Resume on file');
  } else {
    reasons.push('No resume uploaded — score may be lower');
  }

  const skills = skillOverlap(candidateSkills, jobKeywords);
  const skillPoints = Math.round(skills.ratio * 35);
  score += skillPoints;
  if (skills.matched.length) {
    reasons.push(`Skills match: ${skills.matched.join(', ')}`);
  }

  const resumeMatch = resumeKeywordMatch(resumeText, jobKeywords);
  const resumePoints = Math.round(resumeMatch.ratio * 25);
  score += resumePoints;
  if (resumeMatch.matched.length) {
    reasons.push(`Resume/profile mentions: ${resumeMatch.matched.join(', ')}`);
  }

  const titleScore = titleAlignment(candidate.jobTitle, job.title);
  const titlePoints = Math.round(titleScore * 15);
  score += titlePoints;
  if (titleScore >= 0.7) {
    reasons.push(`Role aligns with "${job.title}"`);
  }

  const expScore = experienceFit(expYears, job);
  const expPoints = Math.round(expScore * 12);
  score += expPoints;
  if (expScore >= 0.75) {
    reasons.push(`${Math.floor(expYears)}y experience fits role requirements`);
  }

  const completeness = profileCompleteness(candidate);
  score += Math.round(completeness * 6);
  if (completeness >= 0.8) reasons.push('Strong, complete profile');

  if (candidate.openToWork !== false) {
    score += 5;
    reasons.push('Open to work');
  }

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    reasons: reasons.slice(0, 5),
    matchedSkills: skills.matched,
    jobId: job.id,
    jobTitle: job.title,
  };
}

/**
 * Rank candidates for a company based on active jobs (or all jobs if none approved).
 */
export function rankCandidatesForCompany(candidates, jobs, { jobId = null, minScore = 25 } = {}) {
  const pool = jobId
    ? jobs.filter((j) => j.id === jobId)
    : jobs.filter((j) => j.status === 'approved').length
      ? jobs.filter((j) => j.status === 'approved')
      : jobs;

  if (!pool.length) {
    return [];
  }

  return candidates
    .map((candidate) => {
      let best = { score: 0, reasons: [], jobId: null, jobTitle: null, matchedSkills: [] };
      pool.forEach((job) => {
        const result = scoreCandidateForJob(candidate, job);
        if (result.score > best.score) best = result;
      });
      return {
        candidate,
        score: best.score,
        reasons: best.reasons,
        matchedJobId: best.jobId,
        matchedJobTitle: best.jobTitle,
        matchedSkills: best.matchedSkills,
        tier: best.score >= 75 ? 'excellent' : best.score >= 55 ? 'good' : 'fair',
      };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

export function getScoreLabel(score) {
  if (score >= 85) return 'Excellent match';
  if (score >= 70) return 'Strong match';
  if (score >= 55) return 'Good match';
  if (score >= 40) return 'Moderate match';
  return 'Potential match';
}
