const TITLE_BY_SKILLS = [
  { match: ['react', 'node'], title: 'Full Stack Developer' },
  { match: ['react'], title: 'Frontend Developer' },
  { match: ['node', 'python'], title: 'Backend Developer' },
  { match: ['python', 'sql'], title: 'Data Engineer' },
  { match: ['java'], title: 'Java Developer' },
  { match: ['figma', 'design'], title: 'UI/UX Designer' },
  { match: ['aws', 'docker', 'kubernetes'], title: 'DevOps Engineer' },
];

const SKILLS_BY_TITLE = {
  'full stack': ['React', 'Node.js', 'TypeScript', 'SQL'],
  frontend: ['React', 'JavaScript', 'TypeScript', 'CSS'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs'],
  'ui/ux': ['Figma', 'Design Systems', 'User Research'],
  devops: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  data: ['Python', 'SQL', 'AWS'],
};

function normalizeSkills(skills = []) {
  return [...new Set(skills.map((s) => s.trim()).filter(Boolean))];
}

function inferJobTitle(skills, currentTitle) {
  if (currentTitle?.trim()) return null;
  const lower = skills.map((s) => s.toLowerCase());
  for (const rule of TITLE_BY_SKILLS) {
    if (rule.match.every((k) => lower.some((s) => s.includes(k)))) return rule.title;
  }
  if (skills.length >= 2) return 'Software Developer';
  return null;
}

function suggestSkills(jobTitle, skills) {
  const title = (jobTitle || '').toLowerCase();
  const existing = new Set(skills.map((s) => s.toLowerCase()));
  let recommended = [];

  for (const [key, list] of Object.entries(SKILLS_BY_TITLE)) {
    if (title.includes(key)) recommended = [...recommended, ...list];
  }

  if (!recommended.length && skills.length < 4) {
    recommended = ['Communication', 'Problem Solving', 'Team Collaboration'];
  }

  const toAdd = recommended.filter((s) => !existing.has(s.toLowerCase()));
  if (!toAdd.length) return null;
  return normalizeSkills([...skills, ...toAdd]);
}

export function buildProfessionalSummary(candidate) {
  const name = candidate.fullName || 'This candidate';
  const title = candidate.jobTitle || 'technology professional';
  const years = Number(candidate.yearsExp) || 0;
  const months = Number(candidate.monthsExp) || 0;
  const expParts = [];
  if (years) expParts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months) expParts.push(`${months} month${months !== 1 ? 's' : ''}`);
  const expText = expParts.length ? expParts.join(' and ') + ' of experience' : 'relevant experience';

  const skills = normalizeSkills(candidate.skills);
  const skillsText = skills.length
    ? `Core strengths include ${skills.slice(0, 6).join(', ')}${skills.length > 6 ? ', and more' : ''}.`
    : 'Expand your skills section to highlight technical strengths.';

  const edu = candidate.education
    ? `Educational background: ${candidate.education}${candidate.graduationYear ? ` (${candidate.graduationYear})` : ''}.`
    : '';

  const links = [
    candidate.linkedin ? 'LinkedIn profile available' : null,
    candidate.portfolio ? 'portfolio showcased online' : null,
  ].filter(Boolean);

  const linkText = links.length ? ` ${links.join(' and ')}.` : '';

  return `${name} is a ${title} with ${expText}. ${skillsText} ${edu}${linkText}`.replace(/\s+/g, ' ').trim();
}

/**
 * @returns {Array<{
 *   id: string;
 *   category: string;
 *   title: string;
 *   description: string;
 *   field?: string;
 *   suggested?: unknown;
 *   priority: 'high' | 'medium' | 'low';
 * }>}
 */
export function analyzeResumeEnhancement(candidate) {
  if (!candidate) return [];

  const suggestions = [];
  const skills = normalizeSkills(candidate.skills);

  if (!candidate.resume) {
    suggestions.push({
      id: 'missing-resume',
      category: 'Resume file',
      title: 'Upload a resume document',
      description:
        'Recruiters often download resumes directly. Add a PDF or Word file from your profile so employers can review your full history.',
      priority: 'high',
      field: null,
      action: 'upload-resume',
    });
  }

  if (!candidate.profilePhoto) {
    suggestions.push({
      id: 'missing-photo',
      category: 'Profile',
      title: 'Add a professional photo',
      description: 'Profiles with photos receive more views. Upload a clear headshot on your profile page.',
      priority: 'medium',
      field: null,
      action: 'upload-photo',
    });
  }

  const inferredTitle = inferJobTitle(skills, candidate.jobTitle);
  if (inferredTitle) {
    suggestions.push({
      id: 'suggest-title',
      category: 'Job title',
      title: 'Strengthen your job title',
      description: `Based on your skills, "${inferredTitle}" may better describe your role to recruiters.`,
      field: 'jobTitle',
      suggested: inferredTitle,
      priority: 'high',
    });
  }

  const enhancedSkills = suggestSkills(candidate.jobTitle, skills);
  if (enhancedSkills && enhancedSkills.length > skills.length) {
    const added = enhancedSkills.filter((s) => !skills.includes(s));
    suggestions.push({
      id: 'suggest-skills',
      category: 'Skills',
      title: 'Add in-demand skills',
      description: `Consider adding: ${added.join(', ')}. These align with your target role and improve search visibility.`,
      field: 'skills',
      suggested: enhancedSkills,
      priority: 'high',
    });
  }

  if (!candidate.linkedin?.trim()) {
    suggestions.push({
      id: 'add-linkedin',
      category: 'Links',
      title: 'Add your LinkedIn URL',
      description: 'Link your LinkedIn profile so companies can verify experience and endorsements.',
      field: 'linkedin',
      suggested: 'https://linkedin.com/in/your-profile',
      priority: 'medium',
    });
  }

  if (!candidate.portfolio?.trim() && skills.some((s) => /react|node|javascript|design|figma/i.test(s))) {
    suggestions.push({
      id: 'add-portfolio',
      category: 'Links',
      title: 'Add a portfolio link',
      description: 'Showcase projects or GitHub work. A portfolio link strengthens technical profiles.',
      field: 'portfolio',
      suggested: 'https://github.com/yourusername',
      priority: 'medium',
    });
  }

  if (!candidate.education?.trim()) {
    suggestions.push({
      id: 'add-education',
      category: 'Education',
      title: 'Complete education details',
      description: 'Include your degree and graduation year to meet common application requirements.',
      field: 'education',
      suggested: 'Bachelor\'s in Computer Science',
      priority: 'medium',
    });
  }

  const summary = buildProfessionalSummary({ ...candidate, skills });
  const existingSummary = candidate.professionalSummary?.trim();
  if (!existingSummary || existingSummary.length < 80) {
    suggestions.push({
      id: 'professional-summary',
      category: 'Resume summary',
      title: 'Add a professional summary',
      description:
        'A short summary at the top of your resume helps recruiters scan your profile quickly. Generated from your current details.',
      field: 'professionalSummary',
      suggested: summary,
      priority: 'high',
    });
  } else if (summary !== existingSummary && summary.length > existingSummary.length) {
    suggestions.push({
      id: 'refresh-summary',
      category: 'Resume summary',
      title: 'Refresh your professional summary',
      description: 'We updated your summary using your latest skills, experience, and education.',
      field: 'professionalSummary',
      suggested: summary,
      priority: 'low',
    });
  }

  if (skills.length > 0 && skills.length < 5) {
    suggestions.push({
      id: 'expand-skills',
      category: 'Skills',
      title: 'List more relevant skills',
      description: `You have ${skills.length} skill(s) listed. Aim for 5–8 targeted skills that match roles you are applying for.`,
      priority: 'low',
      field: null,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => order[a.priority] - order[b.priority]);
}

export function applySuggestion(candidate, suggestion) {
  if (!suggestion.field || suggestion.suggested === undefined) return null;

  return {
    [suggestion.field]: suggestion.suggested,
  };
}
