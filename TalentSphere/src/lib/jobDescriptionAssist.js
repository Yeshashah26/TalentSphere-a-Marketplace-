function locationLabel(form) {
  const parts = [form.city, form.state, form.country].filter(Boolean);
  if (!parts.length) return '';
  return parts.join(', ');
}

function salaryLabel(form) {
  const min = Number(form.salaryMin);
  const max = Number(form.salaryMax);
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min) return `from $${min.toLocaleString()}`;
  if (max) return `up to $${max.toLocaleString()}`;
  return '';
}

function experienceLabel(years) {
  const n = Number(years);
  if (!n || Number.isNaN(n)) return null;
  if (n <= 2) return 'early-career';
  if (n <= 5) return 'mid-level';
  return 'senior';
}

function levelPhrase(level, expYears) {
  const fromLevel = (level || '').toLowerCase();
  if (fromLevel === 'junior') return 'Junior';
  if (fromLevel === 'mid') return 'Mid-level';
  if (fromLevel === 'senior') return 'Senior';
  if (fromLevel === 'lead') return 'Lead';
  const exp = experienceLabel(expYears);
  if (exp === 'senior') return 'Senior';
  if (exp === 'mid-level') return 'Mid-level';
  if (exp === 'early-career') return 'Junior';
  return '';
}

function workModeSentence(workMode, remoteEligible) {
  const mode = (workMode || '').toLowerCase();
  if (mode === 'remote') return 'This is a fully remote position.';
  if (mode === 'hybrid') return 'This role follows a hybrid work model with flexibility to collaborate in person and remotely.';
  if (mode === 'onsite') return 'This role is primarily on-site to support close team collaboration.';
  if (remoteEligible?.toLowerCase() === 'yes') return 'Remote work may be available for qualified candidates.';
  return '';
}

function departmentContext(department) {
  const d = (department || '').toLowerCase();
  if (d.includes('engineer')) return 'build reliable products and scalable systems';
  if (d.includes('design')) return 'craft intuitive experiences and strong visual design';
  if (d.includes('market')) return 'grow brand awareness and drive measurable demand';
  if (d.includes('sales')) return 'expand customer relationships and hit revenue goals';
  return 'deliver meaningful outcomes for the business and customers';
}

function defaultResponsibilities(title, department) {
  const dept = department || 'the team';
  return [
    `Own key deliverables for the ${title} role within ${dept}.`,
    'Collaborate with cross-functional partners to plan, execute, and ship high-quality work.',
    'Contribute to documentation, reviews, and continuous improvement of team processes.',
    'Communicate progress, risks, and blockers clearly to stakeholders.',
  ].join('\n');
}

function defaultRequirements(title, form) {
  const lines = [];
  const exp = Number(form.experienceYears);
  if (exp && !Number.isNaN(exp)) {
    lines.push(`${exp}+ years of relevant experience in a similar ${title} role.`);
  } else {
    lines.push(`Proven experience suitable for a ${title} position.`);
  }
  lines.push('Strong communication skills and ability to work independently and in a team.');
  lines.push('Problem-solving mindset with attention to detail and quality.');
  if (form.certifications?.trim()) {
    lines.push(`Preferred certifications: ${form.certifications.trim()}.`);
  }
  return lines.join('\n');
}

/**
 * Rule-based JD draft from post-job form fields (client-side assist).
 */
export function generateJobDescriptionDraft(form) {
  const title = form.title?.trim() || 'Team Member';
  const dept = form.department || 'our organization';
  const level = levelPhrase(form.jobLevel, form.experienceYears);
  const employment = form.employmentType || 'Full time';
  const location = locationLabel(form);
  const salary = salaryLabel(form);
  const openings = Number(form.openings);
  const workLine = workModeSentence(form.workMode, form.remoteEligible);

  const roleIntro = level ? `${level} ${title}` : title;
  const locationPart = location
    ? ` based in ${location}`
    : '';
  const openingsPart =
    openings && !Number.isNaN(openings) && openings > 1
      ? ` We are hiring for ${openings} openings.`
      : '';

  const descriptionParts = [
    `We are looking for a ${roleIntro} to join ${dept}${locationPart}. This ${employment.toLowerCase()} opportunity is ideal for someone ready to ${departmentContext(form.department)}.`,
    workLine,
    salary
      ? `Compensation is competitive${salary ? ` (${salary})` : ''}.`
      : 'We offer competitive compensation aligned with experience.',
    form.benefits?.trim()
      ? `Benefits include: ${form.benefits.trim().replace(/\n/g, '; ')}.`
      : '',
    openingsPart,
    'If you are motivated by impact, ownership, and growth, we would love to hear from you.',
  ].filter(Boolean);

  return {
    description: descriptionParts.join(' ').replace(/\s+/g, ' ').trim(),
    responsibilities: form.responsibilities?.trim() || defaultResponsibilities(title, form.department),
    requirements: form.requirements?.trim() || defaultRequirements(title, form),
  };
}

export function mergeDescriptionWithDraft(existing, draft, form) {
  const current = existing?.trim();
  if (!current) return draft.description;
  const title = form.title?.trim();
  if (!title) return current;

  const hint = `This ${title} role`;
  if (current.toLowerCase().includes(title.toLowerCase())) return current;

  return `${current}\n\n${hint}: ${draft.description}`.trim();
}
