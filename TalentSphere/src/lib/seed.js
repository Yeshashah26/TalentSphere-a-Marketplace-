import { loadDb, saveDb, uid } from './storage';

const SEED_KEY = 'talentsphere_seeded';

if (!localStorage.getItem(SEED_KEY)) {
  const db = loadDb();

  const demoCompanyId = uid('user');
  db.users.push({
    id: demoCompanyId,
    email: 'demo@techcorp.com',
    password: 'demo123',
    role: 'company',
    name: 'TechCorp Solutions',
  });
  db.companies.push({
    userId: demoCompanyId,
    companyName: 'TechCorp Solutions',
    industry: ['Technology'],
    companyEmail: 'demo@techcorp.com',
    hqCountry: 'United States',
    verificationStatus: 'Approved',
    createdAt: new Date().toISOString(),
  });

  const jobs = [
    {
      id: uid('job'),
      companyUserId: demoCompanyId,
      status: 'approved',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      employmentType: 'Full time',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      jobLevel: 'Senior',
      workMode: 'Hybrid',
      remoteEligible: 'Yes',
      description: 'Build scalable React applications for our global platform.',
      responsibilities: 'Lead frontend architecture, mentor junior developers.',
      requirements: '5+ years React, TypeScript, modern CSS.',
      experienceYears: '5',
      openings: '8',
      salaryMin: '120000',
      salaryMax: '160000',
      benefits: 'Health, 401k, remote flexibility',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('job'),
      companyUserId: demoCompanyId,
      status: 'approved',
      title: 'Full Stack Developer',
      department: 'Engineering',
      employmentType: 'Full time',
      country: 'India',
      city: 'Ahmedabad',
      workMode: 'Remote',
      remoteEligible: 'Yes',
      description: 'Work on our TalentSphere recruitment platform.',
      requirements: 'React, Node.js, PostgreSQL experience.',
      experienceYears: '2',
      openings: '3',
      salaryMin: '800000',
      salaryMax: '1200000',
      createdAt: new Date().toISOString(),
    },
    {
      id: uid('job'),
      companyUserId: demoCompanyId,
      status: 'approved',
      title: 'UI/UX Designer',
      department: 'Design',
      employmentType: 'Contract',
      country: 'United Kingdom',
      city: 'London',
      workMode: 'Remote',
      description: 'Design beautiful dark-mode interfaces for SaaS products.',
      requirements: 'Figma, design systems, user research.',
      experienceYears: '3',
      openings: '25',
      salaryMin: '50000',
      salaryMax: '70000',
      createdAt: new Date().toISOString(),
    },
  ];

  db.jobs.push(...jobs);
  saveDb(db);
  localStorage.setItem(SEED_KEY, '1');
}
