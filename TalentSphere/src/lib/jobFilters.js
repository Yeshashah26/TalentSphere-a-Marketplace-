export const POSTED_OPTIONS = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
];

export const EXPERIENCE_OPTIONS = [
  { id: 'entry', label: 'Entry (0–2 years)', min: 0, max: 2 },
  { id: 'mid', label: 'Mid (3–5 years)', min: 3, max: 5 },
  { id: 'senior', label: 'Senior (6+ years)', min: 6, max: Infinity },
];

export const SALARY_OPTIONS = [
  { id: 'under50', label: 'Under $50k', min: 0, max: 50000 },
  { id: '50-100', label: '$50k – $100k', min: 50000, max: 100000 },
  { id: '100-150', label: '$100k – $150k', min: 100000, max: 150000 },
  { id: '150plus', label: '$150k+', min: 150000, max: Infinity },
];

export const TEAM_SIZE_OPTIONS = [
  { id: 'small', label: 'Small (1–10)', min: 1, max: 10 },
  { id: 'medium', label: 'Medium (11–50)', min: 11, max: 50 },
  { id: 'large', label: 'Large (51+)', min: 51, max: Infinity },
];

export const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
  'SQL', 'AWS', 'Docker', 'Kubernetes', 'Figma', 'PostgreSQL',
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  'Full time',
  'Part time',
  'Contract',
  'Freelance',
  'Internship',
];

export const EMPTY_FILTERS = {
  posted: [],
  location: [],
  experience: [],
  salary: [],
  teamSize: [],
  employment: [],
  skills: [],
};

export function getLocationOptions(jobs) {
  const options = new Set();
  jobs.forEach((j) => {
    if (j.workMode === 'Remote') options.add('Remote');
    if (j.country) options.add(j.country);
    if (j.city) {
      const label = j.country ? `${j.city}, ${j.country}` : j.city;
      options.add(label);
    }
  });
  return [...options].sort((a, b) => {
    if (a === 'Remote') return -1;
    if (b === 'Remote') return 1;
    return a.localeCompare(b);
  });
}

export function getEmploymentTypeOptions(jobs) {
  const types = new Set();
  jobs.forEach((j) => {
    if (j.employmentType) types.add(j.employmentType);
  });
  return [...types].sort();
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function jobExperienceYears(job) {
  const n = Number(job.experienceYears);
  if (!Number.isNaN(n) && job.experienceYears !== '') return n;
  const level = (job.jobLevel || '').toLowerCase();
  if (level === 'junior') return 1;
  if (level === 'mid') return 4;
  if (level === 'senior') return 6;
  if (level === 'lead') return 8;
  return 0;
}

function jobOpenings(job) {
  const n = Number(job.openings);
  return !Number.isNaN(n) && job.openings !== '' ? n : 5;
}

function salaryOverlaps(job, bucket) {
  const min = Number(job.salaryMin) || 0;
  const max = Number(job.salaryMax) || min;
  if (!min && !max) return false;
  return max >= bucket.min && min <= bucket.max;
}

function jobMatchesSkill(job, skill) {
  const hay = `${job.description || ''} ${job.requirements || ''} ${job.responsibilities || ''}`.toLowerCase();
  return hay.includes(skill.toLowerCase());
}

function jobMatchesLocation(job, loc) {
  const needle = loc.toLowerCase();
  if (needle === 'remote') return job.workMode?.toLowerCase() === 'remote';

  const country = (job.country || '').toLowerCase();
  const city = (job.city || '').toLowerCase();
  const cityLabel = [job.city, job.country].filter(Boolean).join(', ').toLowerCase();
  const workMode = (job.workMode || '').toLowerCase();
  const state = (job.state || '').toLowerCase();

  if (loc === job.country) return true;
  if (cityLabel === needle) return true;
  if (country.includes(needle) || needle.includes(country)) return true;
  if (city.includes(needle) || needle.includes(city)) return true;
  if (state.includes(needle)) return true;
  if (workMode.includes(needle)) return true;
  return cityLabel.includes(needle);
}

const POSTED_DAYS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };

export function applyJobFilters(jobs, filters) {
  let list = [...jobs];

  if (filters.posted?.length) {
    list = list.filter((j) => {
      const created = new Date(j.createdAt || 0);
      return filters.posted.some((id) => created >= daysAgo(POSTED_DAYS[id] || 0));
    });
  }

  if (filters.location?.length) {
    list = list.filter((j) => filters.location.some((loc) => jobMatchesLocation(j, loc)));
  }

  if (filters.experience?.length) {
    list = list.filter((j) => {
      const years = jobExperienceYears(j);
      return filters.experience.some((id) => {
        const opt = EXPERIENCE_OPTIONS.find((o) => o.id === id);
        return opt && years >= opt.min && years <= opt.max;
      });
    });
  }

  if (filters.salary?.length) {
    list = list.filter((j) =>
      filters.salary.some((id) => {
        const bucket = SALARY_OPTIONS.find((o) => o.id === id);
        return bucket && salaryOverlaps(j, bucket);
      })
    );
  }

  if (filters.teamSize?.length) {
    list = list.filter((j) => {
      const openings = jobOpenings(j);
      return filters.teamSize.some((id) => {
        const opt = TEAM_SIZE_OPTIONS.find((o) => o.id === id);
        return opt && openings >= opt.min && openings <= opt.max;
      });
    });
  }

  if (filters.employment?.length) {
    list = list.filter((j) =>
      filters.employment.some(
        (t) => (j.employmentType || '').toLowerCase() === t.toLowerCase()
      )
    );
  }

  if (filters.skills?.length) {
    list = list.filter((j) => filters.skills.some((s) => jobMatchesSkill(j, s)));
  }

  return list;
}

export function countActiveFilters(filters) {
  return Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0);
}
