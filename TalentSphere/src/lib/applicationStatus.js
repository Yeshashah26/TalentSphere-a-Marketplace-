export const TRACK_STEPS = [
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview Scheduled' },
  { key: 'selected', label: 'Selected' },
];

export const STATUS_ORDER = ['applied', 'shortlisted', 'interview_scheduled', 'selected'];

export function normalizeStatus(status) {
  if (!status) return 'applied';
  const s = String(status).toLowerCase().replace(/\s+/g, '_');
  if (s === 'interview-scheduled' || s === 'interview') return 'interview_scheduled';
  if (STATUS_ORDER.includes(s) || s === 'rejected') return s;
  return 'applied';
}

export function getActiveStepIndex(status) {
  const s = normalizeStatus(status);
  if (s === 'rejected') return 3;
  const idx = STATUS_ORDER.indexOf(s);
  return idx >= 0 ? idx : 0;
}

export function getStepState(stepIndex, activeIndex, isRejected) {
  if (isRejected) {
    if (stepIndex < 3) return 'completed';
    if (stepIndex === 3) return 'rejected';
    return 'pending';
  }
  if (stepIndex < activeIndex) return 'completed';
  if (stepIndex === activeIndex) return 'active';
  return 'pending';
}

export function getFinalStepLabel(isRejected) {
  return isRejected ? 'Rejected' : 'Selected';
}

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];
