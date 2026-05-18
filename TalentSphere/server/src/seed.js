import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDb, saveDb, uid } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FLAG = path.join(__dirname, '../data/.seeded');

export function runSeed() {
  if (fs.existsSync(SEED_FLAG)) return;

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
  fs.writeFileSync(SEED_FLAG, '1', 'utf8');
}
