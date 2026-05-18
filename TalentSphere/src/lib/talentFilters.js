import { EXPERIENCE_OPTIONS, SKILL_OPTIONS } from './jobFilters';
import { hasResume } from './resume';

export const OPEN_TO_WORK_OPTIONS = [
  { id: 'open', label: 'Open to work' },
  { id: 'not-open', label: 'Not open to work' },
];

export const HAS_RESUME_OPTIONS = [
  { id: 'yes', label: 'Has resume uploaded' },
  { id: 'no', label: 'No resume' },
];

export const GRADUATION_OPTIONS = [
  { id: 'recent', label: '2022 or later', minYear: 2022, maxYear: Infinity },
  { id: 'mid', label: '2016 – 2021', minYear: 2016, maxYear: 2021 },
  { id: 'older', label: 'Before 2016', minYear: 0, maxYear: 2015 },
];

export const EMPTY_TALENT_FILTERS = {
  experience: [],
  education: [],
  skills: [],
  openToWork: [],
  jobTitle: [],
  hasResume: [],
  graduation: [],
};

export function getEducationOptions(candidates) {
  const set = new Set();
  candidates.forEach((c) => {
    if (c.education?.trim()) set.add(c.education.trim());
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getTalentSkillOptions(candidates) {
  const set = new Set(SKILL_OPTIONS);
  candidates.forEach((c) => {
    (c.skills || []).forEach((s) => set.add(s));
  });
  return [...set].sort();
}

export function getJobTitleOptions(candidates) {
  const set = new Set();
  candidates.forEach((c) => {
    if (c.jobTitle?.trim()) set.add(c.jobTitle.trim());
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

function candidateExperienceYears(c) {
  const years = Number(c.yearsExp) || 0;
  const months = Number(c.monthsExp) || 0;
  return years + months / 12;
}

function matchesGraduation(candidate, optionId) {
  const opt = GRADUATION_OPTIONS.find((o) => o.id === optionId);
  if (!opt) return false;
  const year = Number(candidate.graduationYear);
  if (!year || Number.isNaN(year)) return false;
  return year >= opt.minYear && year <= opt.maxYear;
}

export function applyTalentFilters(candidates, filters) {
  let list = [...candidates];

  if (filters.experience?.length) {
    list = list.filter((c) => {
      const years = candidateExperienceYears(c);
      return filters.experience.some((id) => {
        const opt = EXPERIENCE_OPTIONS.find((o) => o.id === id);
        return opt && years >= opt.min && years <= opt.max;
      });
    });
  }

  if (filters.education?.length) {
    list = list.filter((c) =>
      filters.education.some(
        (edu) => (c.education || '').toLowerCase() === edu.toLowerCase()
      )
    );
  }

  if (filters.skills?.length) {
    list = list.filter((c) =>
      filters.skills.some((s) =>
        (c.skills || []).some((skill) => skill.toLowerCase() === s.toLowerCase())
      )
    );
  }

  if (filters.openToWork?.length) {
    list = list.filter((c) => {
      const open = c.openToWork !== false;
      return filters.openToWork.some((id) => (id === 'open' ? open : !open));
    });
  }

  if (filters.jobTitle?.length) {
    list = list.filter((c) =>
      filters.jobTitle.some(
        (title) => (c.jobTitle || '').toLowerCase() === title.toLowerCase()
      )
    );
  }

  if (filters.hasResume?.length) {
    list = list.filter((c) => {
      const uploaded = hasResume(c);
      return filters.hasResume.some((id) => (id === 'yes' ? uploaded : !uploaded));
    });
  }

  if (filters.graduation?.length) {
    list = list.filter((c) =>
      filters.graduation.some((id) => matchesGraduation(c, id))
    );
  }

  return list;
}

export function countActiveTalentFilters(filters) {
  return Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0);
}
