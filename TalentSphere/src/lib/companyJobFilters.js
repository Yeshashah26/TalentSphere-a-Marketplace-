import {
  getLocationOptions,
  getEmploymentTypeOptions,
} from './jobFilters';

export { getLocationOptions, getEmploymentTypeOptions };

export const JOB_STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export const EMPTY_COMPANY_JOB_FILTERS = {
  status: [],
  type: [],
  location: [],
};

function jobMatchesLocation(job, loc) {
  const needle = loc.toLowerCase();
  if (needle === 'remote') return job.workMode?.toLowerCase() === 'remote';

  const country = (job.country || '').toLowerCase();
  const city = (job.city || '').toLowerCase();
  const cityLabel = [job.city, job.country].filter(Boolean).join(', ').toLowerCase();
  const state = (job.state || '').toLowerCase();

  if (loc === job.country) return true;
  if (cityLabel === needle) return true;
  if (country.includes(needle) || needle.includes(country)) return true;
  if (city.includes(needle) || needle.includes(city)) return true;
  if (state.includes(needle)) return true;
  return cityLabel.includes(needle);
}

export function applyCompanyJobFilters(jobs, filters) {
  let list = [...jobs];

  if (filters.status?.length) {
    list = list.filter((j) => filters.status.includes(j.status));
  }

  if (filters.type?.length) {
    list = list.filter((j) =>
      filters.type.some((t) => (j.employmentType || '').toLowerCase() === t.toLowerCase())
    );
  }

  if (filters.location?.length) {
    list = list.filter((j) => filters.location.some((loc) => jobMatchesLocation(j, loc)));
  }

  return list;
}

export function countActiveCompanyJobFilters(filters) {
  return Object.values(filters).reduce((n, arr) => n + (arr?.length || 0), 0);
}
