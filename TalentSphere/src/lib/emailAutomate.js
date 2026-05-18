function firstName(fullName) {
  const n = fullName?.trim().split(/\s+/)[0];
  return n || 'there';
}

function pickRelevantJob(jobs, candidate) {
  const approved = (jobs || []).filter((j) => j.status === 'approved');
  if (!approved.length) return jobs?.[0] || null;

  const title = (candidate.jobTitle || '').toLowerCase();
  const skills = (candidate.skills || []).map((s) => s.toLowerCase());

  let best = approved[0];
  let bestScore = 0;

  approved.forEach((job) => {
    let score = 0;
    const jt = (job.title || '').toLowerCase();
    if (title && (jt.includes(title) || title.includes(jt))) score += 3;
    skills.forEach((s) => {
      const blob = `${job.description} ${job.requirements} ${job.title}`.toLowerCase();
      if (blob.includes(s)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = job;
    }
  });

  return best;
}

/**
 * Generate outreach email subject + body from company, candidate, and optional job.
 */
export function generateOutreachEmail({ candidate, company, jobs = [] }) {
  const name = firstName(candidate.fullName);
  const companyName = company?.companyName || 'our company';
  const job = pickRelevantJob(jobs, candidate);
  const roleTitle = job?.title || candidate.jobTitle || 'an open role';
  const skills = (candidate.skills || []).slice(0, 5);
  const skillsLine = skills.length
    ? `Your experience with ${skills.join(', ')} stood out to our team.`
    : candidate.professionalSummary
      ? `Your profile summary aligns well with what we are looking for.`
      : `Your background as a ${candidate.jobTitle || 'professional'} looks like a strong fit for us.`;

  const subject = job
    ? `${roleTitle} opportunity at ${companyName}`
    : `Career opportunity at ${companyName}`;

  const jobParagraph = job
    ? `We are currently hiring for a ${job.title} position${
        job.workMode ? ` (${job.workMode})` : ''
      }${
        job.city || job.country
          ? ` based in ${[job.city, job.country].filter(Boolean).join(', ')}`
          : ''
      }. ${job.description ? job.description.slice(0, 200) + (job.description.length > 200 ? '…' : '') : ''}`
    : `We have several openings that may match your experience and career goals.`;

  const body = `Hi ${name},

I hope you are doing well. I'm on the recruiting team at ${companyName}, and I'm reaching out because we saved your profile while reviewing talent for our open positions.

${skillsLine}

${jobParagraph}

We would love to learn more about your interests and share details about the role, team, and next steps. Would you be available for a brief call or chat this week?

Thank you for your time, and I look forward to connecting.

Best regards,
${companyName} Talent Team
${company?.website ? company.website : ''}`.trim();

  return { subject, body, matchedJobTitle: job?.title || null };
}
