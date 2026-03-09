import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ===== CLEANUP EXISTING DATA =====
  console.log('🗑️  Clearing existing data...');
  // Delete in dependency order (leaf → root)
  await prisma.interviewReminder.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.mLPrediction.deleteMany({});
  await prisma.skillExtraction.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.applicationFormSchema.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.candidateSource.deleteMany({});
  await prisma.interviewTemplate.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.mLModel.deleteMany({});
  await prisma.trainingDataset.deleteMany({});
  // userSettings cascades from user
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
  console.log('✅ Cleared existing data');

  // ===== COMPANY & USERS =====
  const company = await prisma.company.create({
    data: {
      name: 'TalentSol Demo Company',
      domain: 'talentsol-demo.com',
      slug: 'talentsol-demo',
      plan: 'trial',
      planStatus: 'active',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@talentsol-demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      companyId: company.id,
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruiter@talentsol-demo.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Recruiter',
      role: 'recruiter',
      companyId: company.id,
    },
  });

  console.log('✅ Created company and users');

  // ===== CANDIDATE SOURCES (8) =====
  const sourcesData = [
    { name: 'LinkedIn',     category: 'Social Media', cost: 0 },
    { name: 'Career Site',  category: 'Organic',      cost: 0 },
    { name: 'Job Board',    category: 'Paid',         cost: 500 },
    { name: 'Referrals',       category: 'Internal',  cost: 0 },
    { name: 'Direct Sourcing', category: 'Direct',    cost: 0 },
    { name: 'Glassdoor',       category: 'Job Board', cost: 300 },
    { name: 'Agencies',     category: 'Agency',       cost: 2000 },
    { name: 'Events',       category: 'Events',       cost: 1000 },
  ];

  const createdSources: any[] = [];
  for (const s of sourcesData) {
    createdSources.push(await prisma.candidateSource.create({ data: s as any }));
  }
  const src = (name: string) => createdSources.find(s => s.name === name);

  console.log('✅ Created 8 candidate sources');

  // ===== JOBS (38) =====
  const A = adminUser.id;
  const R = recruiterUser.id;

  type JobDef = {
    title: string; department: string; city?: string; state?: string;
    locType: string; empType: string; level: string;
    salMin: number; salMax: number; status: string;
    desc: string; createdById: string; maxApplicants: number;
    postedDaysAgo?: number;
  };

  const jobDefs: JobDef[] = [
    // ENGINEERING (12)
    { title: 'Senior Frontend Developer',   department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 120000, salMax: 150000, status: 'open',   desc: 'Build exceptional UIs with React and TypeScript.',              createdById: A, maxApplicants: 50, postedDaysAgo: 12 },
    { title: 'Backend Developer',           department: 'Engineering',      city: 'Seattle', state: 'WA', locType: 'hybrid',  empType: 'full-time', level: 'mid',       salMin: 110000, salMax: 140000, status: 'closed', desc: 'Design and implement scalable REST APIs and microservices.',    createdById: A, maxApplicants: 40, postedDaysAgo: 7 },
    { title: 'DevOps Engineer',             department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 130000, salMax: 160000, status: 'open',   desc: 'Manage CI/CD pipelines and cloud infrastructure on AWS.',       createdById: A, maxApplicants: 25, postedDaysAgo: 30 },
    { title: 'Full-Stack Developer',        department: 'Engineering',      city: 'San Francisco', state: 'CA', locType: 'hybrid', empType: 'full-time', level: 'mid',  salMin: 115000, salMax: 145000, status: 'open',  desc: 'Work across the stack building product features end-to-end.',  createdById: A, maxApplicants: 35 },
    { title: 'Mobile Engineer',             department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 115000, salMax: 145000, status: 'open',   desc: 'Build native iOS and Android apps with React Native.',          createdById: A, maxApplicants: 20 },
    { title: 'QA Engineer',                 department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 90000,  salMax: 115000, status: 'open',   desc: 'Ensure product quality through automated and manual testing.',  createdById: R, maxApplicants: 20 },
    { title: 'Security Engineer',           department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 140000, salMax: 175000, status: 'open',   desc: 'Protect systems and data with security best practices.',        createdById: A, maxApplicants: 15 },
    { title: 'Data Engineer',               department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 120000, salMax: 150000, status: 'open',   desc: 'Build data pipelines and maintain our data infrastructure.',    createdById: A, maxApplicants: 20 },
    { title: 'ML Engineer',                 department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 145000, salMax: 185000, status: 'open',   desc: 'Deploy and scale machine learning models in production.',        createdById: A, maxApplicants: 15 },
    { title: 'Platform Engineer',           department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 135000, salMax: 165000, status: 'draft',  desc: 'Build internal developer platforms and tooling.',                createdById: A, maxApplicants: 10 },
    { title: 'Site Reliability Engineer',   department: 'Engineering',      locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 140000, salMax: 170000, status: 'open',   desc: 'Ensure high availability and performance of our systems.',       createdById: A, maxApplicants: 10 },
    { title: 'Embedded Software Engineer',  department: 'Engineering',      city: 'Austin', state: 'TX', locType: 'onsite', empType: 'full-time', level: 'mid', salMin: 110000, salMax: 140000, status: 'closed', desc: 'Develop firmware for IoT and embedded systems.', createdById: R, maxApplicants: 10 },
    // DESIGN (4)
    { title: 'Product Designer',            department: 'Design',           locType: 'remote', empType: 'full-time', level: 'mid',  salMin: 95000,  salMax: 125000, status: 'open',  desc: 'Create intuitive product experiences from concept to delivery.', createdById: R, maxApplicants: 30, postedDaysAgo: 8 },
    { title: 'UX Researcher',               department: 'Design',           city: 'San Francisco', state: 'CA', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 90000, salMax: 120000, status: 'open', desc: 'Conduct user research to inform product decisions.', createdById: R, maxApplicants: 20 },
    { title: 'Visual Designer',             department: 'Design',           locType: 'remote',  empType: 'full-time', level: 'entry',     salMin: 70000,  salMax: 90000,  status: 'open',   desc: 'Create compelling visual assets and marketing materials.',       createdById: R, maxApplicants: 25 },
    { title: 'Motion Designer',             department: 'Design',           locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 85000,  salMax: 110000, status: 'draft',  desc: 'Bring our brand to life with motion graphics and animation.',    createdById: R, maxApplicants: 15 },
    // MARKETING (5)
    { title: 'Marketing Manager',           department: 'Marketing',        city: 'New York', state: 'NY', locType: 'hybrid', empType: 'full-time', level: 'senior', salMin: 100000, salMax: 130000, status: 'open', desc: 'Lead marketing strategy and campaigns to drive growth.', createdById: R, maxApplicants: 30, postedDaysAgo: 20 },
    { title: 'Content Strategist',          department: 'Marketing',        locType: 'remote',  empType: 'part-time', level: 'mid',       salMin: 80000,  salMax: 105000, status: 'draft',  desc: 'Develop content strategy and create compelling narratives.',     createdById: R, maxApplicants: 30, postedDaysAgo: 18 },
    { title: 'SEO Specialist',              department: 'Marketing',        locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 75000,  salMax: 95000,  status: 'open',   desc: 'Drive organic growth through search engine optimization.',       createdById: R, maxApplicants: 25 },
    { title: 'Growth Marketer',             department: 'Marketing',        city: 'New York', state: 'NY', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 85000, salMax: 110000, status: 'open', desc: 'Scale growth channels across acquisition funnels.', createdById: R, maxApplicants: 20 },
    { title: 'Brand Designer',              department: 'Marketing',        locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 80000,  salMax: 105000, status: 'open',   desc: 'Shape and maintain our brand identity across all touchpoints.',  createdById: R, maxApplicants: 20 },
    // ANALYTICS (3)
    { title: 'Data Analyst',                department: 'Analytics',        city: 'Chicago', state: 'IL', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 90000, salMax: 115000, status: 'open', desc: 'Transform data into actionable insights for the business.', createdById: A, maxApplicants: 30, postedDaysAgo: 5 },
    { title: 'Business Intelligence Analyst', department: 'Analytics',     city: 'Austin', state: 'TX', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 95000, salMax: 120000, status: 'open', desc: 'Build dashboards and reports to guide executive decisions.', createdById: A, maxApplicants: 20 },
    { title: 'Data Scientist',              department: 'Analytics',        locType: 'remote',  empType: 'full-time', level: 'senior',    salMin: 140000, salMax: 180000, status: 'open',   desc: 'Build ML models to drive product and business insights.',        createdById: A, maxApplicants: 20 },
    // HUMAN RESOURCES (4)
    { title: 'HR Business Partner',         department: 'Human Resources',  city: 'Austin', state: 'TX', locType: 'onsite', empType: 'full-time', level: 'senior', salMin: 95000, salMax: 125000, status: 'open', desc: 'Partner with business leaders to drive HR strategy.', createdById: R, maxApplicants: 15, postedDaysAgo: 14 },
    { title: 'Recruiter',                   department: 'Human Resources',  city: 'San Francisco', state: 'CA', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 75000, salMax: 95000, status: 'open', desc: 'Find and attract top talent across all departments.', createdById: R, maxApplicants: 20 },
    { title: 'People Ops Manager',          department: 'Human Resources',  city: 'Austin', state: 'TX', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 85000, salMax: 110000, status: 'open', desc: 'Manage people operations, onboarding, and HR systems.', createdById: R, maxApplicants: 15 },
    { title: 'Compensation Analyst',        department: 'Human Resources',  locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 80000,  salMax: 100000, status: 'draft',  desc: 'Design and analyze compensation structures across the org.',     createdById: R, maxApplicants: 10 },
    // CUSTOMER SUCCESS (5)
    { title: 'Customer Success Manager',    department: 'Customer Success', city: 'Boston', state: 'MA', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 85000, salMax: 110000, status: 'open', desc: 'Drive customer retention and expansion for enterprise accounts.', createdById: R, maxApplicants: 25, postedDaysAgo: 10 },
    { title: 'Implementation Specialist',   department: 'Customer Success', city: 'Chicago', state: 'IL', locType: 'hybrid', empType: 'full-time', level: 'entry', salMin: 65000, salMax: 85000, status: 'open', desc: 'Guide new customers through onboarding and product setup.', createdById: R, maxApplicants: 20 },
    { title: 'Solutions Engineer',          department: 'Customer Success', city: 'San Francisco', state: 'CA', locType: 'hybrid', empType: 'full-time', level: 'senior', salMin: 120000, salMax: 150000, status: 'open', desc: 'Provide technical expertise for pre- and post-sales.', createdById: R, maxApplicants: 15 },
    { title: 'Support Lead',                department: 'Customer Success', locType: 'remote',  empType: 'full-time', level: 'mid',       salMin: 75000,  salMax: 95000,  status: 'open',   desc: 'Lead the support team to deliver exceptional customer experiences.', createdById: R, maxApplicants: 15 },
    { title: 'Customer Onboarding Manager', department: 'Customer Success', city: 'Denver', state: 'CO', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 80000, salMax: 100000, status: 'open', desc: 'Own the onboarding experience to set customers up for success.', createdById: R, maxApplicants: 15 },
    // SALES (5)
    { title: 'Sales Director',              department: 'Sales',            city: 'New York', state: 'NY', locType: 'onsite', empType: 'full-time', level: 'executive', salMin: 160000, salMax: 200000, status: 'open', desc: 'Lead the enterprise sales org and drive revenue targets.', createdById: A, maxApplicants: 20, postedDaysAgo: 25 },
    { title: 'Account Executive',           department: 'Sales',            city: 'Chicago', state: 'IL', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 80000, salMax: 120000, status: 'open', desc: 'Close enterprise deals and expand strategic accounts.', createdById: R, maxApplicants: 40 },
    { title: 'SDR',                         department: 'Sales',            city: 'Austin', state: 'TX', locType: 'hybrid', empType: 'full-time', level: 'entry', salMin: 55000, salMax: 75000, status: 'open', desc: 'Generate qualified pipeline through outbound prospecting.', createdById: R, maxApplicants: 50 },
    { title: 'Sales Operations Analyst',    department: 'Sales',            city: 'Chicago', state: 'IL', locType: 'hybrid', empType: 'full-time', level: 'mid', salMin: 75000, salMax: 95000, status: 'open', desc: 'Optimize sales processes and maintain CRM data quality.', createdById: R, maxApplicants: 20 },
    { title: 'Enterprise Account Manager',  department: 'Sales',            city: 'New York', state: 'NY', locType: 'hybrid', empType: 'full-time', level: 'senior', salMin: 110000, salMax: 150000, status: 'open', desc: 'Manage and grow Fortune 500 customer relationships.', createdById: A, maxApplicants: 20 },
  ];

  const jobs: any[] = [];
  for (const d of jobDefs) {
    const location = d.locType === 'remote'
      ? { type: 'remote', allowRemote: true, country: 'US' }
      : { type: d.locType, city: d.city, state: d.state, country: 'US', allowRemote: d.locType === 'hybrid' };

    const job = await prisma.job.create({
      data: {
        title: d.title,
        department: d.department,
        location: JSON.stringify(location),
        employmentType: d.empType,
        experienceLevel: d.level,
        salary: JSON.stringify({ min: d.salMin, max: d.salMax, currency: 'USD' }),
        description: d.desc,
        status: d.status,
        visibility: 'public',
        maxApplicants: d.maxApplicants,
        currentApplicants: 0,
        postedDate: daysAgo(d.postedDaysAgo ?? Math.floor(Math.random() * 45 + 5)),
        companyId: company.id,
        createdById: d.createdById,
      },
    });
    jobs.push(job);
  }

  console.log(`✅ Created ${jobs.length} jobs`);

  // ===== CANDIDATES (55) =====

  type CandidateInput = {
    firstName: string; lastName: string; email: string; phone: string;
    city: string; state: string; position: string;
    sourceName: string; stage: string; rating: number; tags: string[];
    appDate?: Date; appScore?: number;
  };

  // 15 named candidates matching screenshots
  const namedCandidates: CandidateInput[] = [
    // 8 featured in Candidates + Application Management pages (fixed emails, dates, scores)
    { firstName: 'Alex',    lastName: 'Johnson',  email: 'alex@email.com',            phone: '+1-555-0101', city: 'San Francisco', state: 'CA', position: 'Senior Frontend Developer', sourceName: 'LinkedIn',        stage: 'Interview 2', rating: 5, tags: ['React', 'TypeScript', 'Next.js'],                      appDate: new Date('2023-04-02'), appScore: 88 },
    { firstName: 'Maria',   lastName: 'Garcia',   email: 'm.garcia@email.com',         phone: '+1-555-0102', city: 'New York',       state: 'NY', position: 'Product Designer',          sourceName: 'Career Site',     stage: 'Screening',   rating: 4, tags: ['Figma', 'UX Research', 'Prototyping'],                 appDate: new Date('2023-04-05'), appScore: 74 },
    { firstName: 'James',   lastName: 'Wilson',   email: 'j.wilson@email.com',         phone: '+1-555-0103', city: 'Austin',         state: 'TX', position: 'Marketing Manager',         sourceName: 'Referrals',       stage: 'Interview 1', rating: 4, tags: ['Marketing', 'Strategy', 'Analytics'],                  appDate: new Date('2023-04-07'), appScore: 81 },
    { firstName: 'Emily',   lastName: 'Chen',     email: 'e.chen@email.com',           phone: '+1-555-0104', city: 'Seattle',        state: 'WA', position: 'Data Analyst',              sourceName: 'Job Board',       stage: 'Offer',       rating: 5, tags: ['SQL', 'Python', 'Tableau'],                            appDate: new Date('2023-03-28'), appScore: 93 },
    { firstName: 'Robert',  lastName: 'Brown',    email: 'r.brown@email.com',          phone: '+1-555-0105', city: 'Boston',         state: 'MA', position: 'UX Researcher',             sourceName: 'LinkedIn',        stage: 'Applied',     rating: 3, tags: ['User Research', 'Figma', 'Usability Testing'],        appDate: new Date('2023-04-10'), appScore: 67 },
    { firstName: 'Sophia',  lastName: 'Lee',      email: 's.lee@email.com',            phone: '+1-555-0106', city: 'Chicago',        state: 'IL', position: 'DevOps Engineer',           sourceName: 'Direct Sourcing', stage: 'Interview 1', rating: 4, tags: ['AWS', 'Docker', 'Kubernetes'],                         appDate: new Date('2023-04-01'), appScore: 79 },
    { firstName: 'Daniel',  lastName: 'Martinez', email: 'd.martinez@email.com',       phone: '+1-555-0107', city: 'Denver',         state: 'CO', position: 'Backend Developer',         sourceName: 'Career Site',     stage: 'Screening',   rating: 4, tags: ['Node.js', 'PostgreSQL', 'REST APIs'],                  appDate: new Date('2023-04-08'), appScore: 72 },
    { firstName: 'Olivia',  lastName: 'Taylor',   email: 'o.taylor@email.com',         phone: '+1-555-0108', city: 'Atlanta',        state: 'GA', position: 'HR Business Partner',       sourceName: 'Referrals',       stage: 'Hired',       rating: 5, tags: ['HR Strategy', 'Employee Relations', 'Talent Management'], appDate: new Date('2023-03-20'), appScore: 91 },
    // 7 candidates featured in Interviews + Dashboard pages
    { firstName: 'Sarah',   lastName: 'Miller',   email: 'sarah.miller@email.com',     phone: '+1-555-0109', city: 'San Francisco',  state: 'CA', position: 'Frontend Engineer',         sourceName: 'LinkedIn',        stage: 'Interview 1', rating: 4, tags: ['React', 'Vue.js', 'JavaScript'] },
    { firstName: 'David',   lastName: 'Park',     email: 'david.park@email.com',       phone: '+1-555-0110', city: 'Seattle',        state: 'WA', position: 'Backend Developer',         sourceName: 'LinkedIn',        stage: 'Interview 2', rating: 5, tags: ['Python', 'Django', 'PostgreSQL'] },
    { firstName: 'Lisa',    lastName: 'Turner',   email: 'lisa.turner@email.com',      phone: '+1-555-0111', city: 'New York',       state: 'NY', position: 'Product Manager',          sourceName: 'Referrals',       stage: 'Interview 1', rating: 4, tags: ['Product Strategy', 'Agile', 'Analytics'] },
    { firstName: 'Mark',    lastName: 'Anderson', email: 'mark.anderson@email.com',    phone: '+1-555-0112', city: 'Austin',         state: 'TX', position: 'DevOps Engineer',           sourceName: 'Career Site',     stage: 'Screening',   rating: 3, tags: ['Terraform', 'Jenkins', 'Linux'] },
    { firstName: 'Emma',    lastName: 'Wilson',   email: 'emma.wilson@email.com',      phone: '+1-555-0113', city: 'Chicago',        state: 'IL', position: 'UX Designer',               sourceName: 'Job Board',       stage: 'Interview 2', rating: 4, tags: ['Figma', 'UX Research', 'Prototyping'] },
    { firstName: 'James',   lastName: 'Lee',      email: 'james.lee@email.com',        phone: '+1-555-0114', city: 'Portland',       state: 'OR', position: 'Data Scientist',            sourceName: 'LinkedIn',        stage: 'Interview 1', rating: 4, tags: ['Python', 'Machine Learning', 'TensorFlow'] },
    { firstName: 'Anna',    lastName: 'Brown',    email: 'anna.brown@email.com',       phone: '+1-555-0115', city: 'Denver',         state: 'CO', position: 'Marketing Analyst',         sourceName: 'Career Site',     stage: 'Screening',   rating: 3, tags: ['Digital Marketing', 'SEO', 'Content'] },
  ];

  // 40 procedurally generated candidates
  const genFirstNames = ['Noah', 'Isabella', 'Liam', 'Mia', 'Ethan', 'Ava', 'Mason', 'Charlotte', 'Lucas', 'Amelia',
    'Aiden', 'Harper', 'Oliver', 'Evelyn', 'Elijah', 'Luna', 'Logan', 'Chloe', 'Jackson', 'Penelope',
    'Sebastian', 'Layla', 'Mateo', 'Zoey', 'Henry', 'Nora', 'Owen', 'Lily', 'Alexander', 'Riley',
    'Ryan', 'Zoe', 'Nathan', 'Hannah', 'Aaron', 'Grace', 'Tyler', 'Victoria', 'Brandon', 'Sofia'];
  const genLastNames = ['Smith', 'Jones', 'Williams', 'Davis', 'Miller', 'Moore', 'Jackson', 'White',
    'Harris', 'Thompson', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams',
    'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Phillips', 'Campbell', 'Parker', 'Evans',
    'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy',
    'Bailey', 'Cooper', 'Richardson'];
  const genCities = [
    { city: 'San Francisco', state: 'CA' }, { city: 'New York',     state: 'NY' },
    { city: 'Austin',        state: 'TX' }, { city: 'Seattle',      state: 'WA' },
    { city: 'Boston',        state: 'MA' }, { city: 'Chicago',      state: 'IL' },
    { city: 'Denver',        state: 'CO' }, { city: 'Atlanta',      state: 'GA' },
    { city: 'Los Angeles',   state: 'CA' }, { city: 'Portland',     state: 'OR' },
    { city: 'Miami',         state: 'FL' }, { city: 'Dallas',       state: 'TX' },
  ];
  const genPositions = [
    { pos: 'Software Engineer',          tags: ['JavaScript', 'React', 'Python'] },
    { pos: 'UX Designer',                tags: ['Figma', 'Sketch', 'User Research'] },
    { pos: 'Data Analyst',               tags: ['SQL', 'Python', 'Tableau'] },
    { pos: 'Sales Manager',              tags: ['Salesforce', 'Negotiation', 'Lead Gen'] },
    { pos: 'Content Creator',            tags: ['Writing', 'SEO', 'Social Media'] },
    { pos: 'DevOps Engineer',            tags: ['AWS', 'Docker', 'Kubernetes'] },
    { pos: 'Product Manager',            tags: ['Agile', 'Roadmapping', 'Analytics'] },
    { pos: 'Marketing Specialist',       tags: ['Google Analytics', 'Content', 'Email'] },
    { pos: 'Frontend Engineer',          tags: ['React', 'TypeScript', 'CSS'] },
    { pos: 'HR Generalist',              tags: ['Recruiting', 'HRIS', 'Compliance'] },
    { pos: 'Customer Success Manager',   tags: ['CRM', 'Onboarding', 'Support'] },
    { pos: 'Account Executive',          tags: ['B2B Sales', 'CRM', 'Cold Outreach'] },
  ];
  const genSources    = ['LinkedIn', 'LinkedIn', 'LinkedIn', 'Career Site', 'Career Site', 'Referrals', 'Referrals', 'Job Board', 'Job Board', 'Direct Sourcing'];
  const genStages     = ['Applied', 'Applied', 'Applied', 'Applied', 'Applied', 'Screening', 'Screening', 'Interview 1', 'Interview 1', 'Interview 2', 'Offer', 'Hired', 'Rejected'];
  const genRatings    = [3, 3, 4, 4, 4, 5];

  const usedEmails = new Set(namedCandidates.map(c => c.email));
  const generatedCandidates: CandidateInput[] = [];

  for (let i = 0; i < 40; i++) {
    const fn  = genFirstNames[i % genFirstNames.length];
    const ln  = genLastNames[(i * 3 + 7) % genLastNames.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 19 ? i : ''}@email.com`;
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    const loc  = genCities[i % genCities.length];
    const pd   = genPositions[i % genPositions.length];

    generatedCandidates.push({
      firstName: fn, lastName: ln, email,
      phone: `+1-555-${String(200 + i).padStart(4, '0')}`,
      city: loc.city, state: loc.state,
      position:   pd.pos,
      sourceName: genSources[i % genSources.length],
      stage:      genStages[i % genStages.length],
      rating:     genRatings[i % genRatings.length],
      tags:       pd.tags,
    });
  }

  const allCandidates = [...namedCandidates, ...generatedCandidates];

  // Create candidates + primary applications
  const candidateAppMap = new Map<string, any>(); // "First Last" -> primary application

  for (let i = 0; i < allCandidates.length; i++) {
    const c     = allCandidates[i];
    const source = src(c.sourceName);

    const candidate = await prisma.candidate.create({
      data: {
        firstName:      c.firstName,
        lastName:       c.lastName,
        email:          c.email,
        phone:          c.phone,
        location:       JSON.stringify({ city: c.city, state: c.state, country: 'US' }),
        workAuthorization: 'US Citizen',
        tags:           JSON.stringify(c.tags),
        rating:         c.rating,
        position:       c.position,
        lastActivityAt: daysAgo(Math.floor(Math.random() * 14)),
        sourceId:       source?.id ?? null,
      } as any,
    });

    // Primary application
    const primaryJob   = jobs[i % jobs.length];
    const submittedAt  = c.appDate ?? daysAgo(Math.floor(Math.random() * 30 + 1));
    const score        = c.appScore ?? Math.floor(60 + Math.random() * 40);

    const primaryApp = await prisma.application.create({
      data: {
        jobId:           primaryJob.id,
        candidateId:     candidate.id,
        status:          c.stage,
        submittedAt,
        candidateInfo:   JSON.stringify({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone }),
        professionalInfo: JSON.stringify({ currentTitle: c.position, experience: '3-5', remoteWork: true }),
        scoring:         JSON.stringify({ automaticScore: score, qualificationsMet: score > 70, experienceMatch: score }),
        activity:        JSON.stringify([{ type: 'application_submitted', timestamp: submittedAt.toISOString(), description: 'Application submitted' }]),
        tags:            JSON.stringify([]),
        score,
      } as any,
    });

    await prisma.job.update({ where: { id: primaryJob.id }, data: { currentApplicants: { increment: 1 } } });
    candidateAppMap.set(`${c.firstName} ${c.lastName}`, primaryApp);

    // Secondary application for ~70% of candidates
    if (i % 10 !== 0) {
      const secondaryJob = jobs[(i + 11) % jobs.length];
      if (secondaryJob.id !== primaryJob.id) {
        const secScore = Math.floor(55 + Math.random() * 40);
        await prisma.application.create({
          data: {
            jobId:           secondaryJob.id,
            candidateId:     candidate.id,
            status:          'Applied',
            submittedAt:     daysAgo(Math.floor(Math.random() * 20 + 1)),
            candidateInfo:   JSON.stringify({ firstName: c.firstName, lastName: c.lastName, email: c.email }),
            professionalInfo: JSON.stringify({ currentTitle: c.position, experience: '3-5', remoteWork: true }),
            scoring:         JSON.stringify({ automaticScore: secScore, qualificationsMet: secScore > 70, experienceMatch: secScore }),
            activity:        JSON.stringify([]),
            tags:            JSON.stringify([]),
            score:           secScore,
          } as any,
        });
        await prisma.job.update({ where: { id: secondaryJob.id }, data: { currentApplicants: { increment: 1 } } });
      }
    }
  }

  console.log(`✅ Created ${allCandidates.length} candidates and ~${Math.round(allCandidates.length * 1.7)} applications`);

  // ===== FEATURED JOB APPLICANT COUNT OVERRIDE =====
  // Set exact counts matching the Jobs page screenshot
  const featuredJobCounts: Record<string, number> = {
    'Senior Frontend Developer': 45,
    'Backend Developer':         38,
    'DevOps Engineer':           15,
    'Product Designer':          32,
    'Marketing Manager':         28,
    'Data Analyst':              19,
    'HR Business Partner':       22,
    'Customer Success Manager':  26,
    'Content Strategist':        11,
    'Sales Director':             9,
  };
  for (const [title, count] of Object.entries(featuredJobCounts)) {
    const job = jobs.find(j => j.title === title);
    if (job) await prisma.job.update({ where: { id: job.id }, data: { currentApplicants: count } });
  }
  console.log('✅ Set featured job applicant counts');

  // ===== INTERVIEWS (25+) =====

  // 7 specific interviews matching screenshot data
  type InterviewSpec = {
    candidateName: string; title: string; type: string;
    date: Date; startTime: string; endTime: string;
    format: string; status: string; interviewers: string[];
  };

  const specificInterviews: InterviewSpec[] = [
    { candidateName: 'Sarah Miller',  title: 'Interview 1', type: 'Interview 1', date: daysFromNow(0), startTime: '14:00', endTime: '14:45', format: 'Video Call',   status: 'upcoming',  interviewers: ['Tom Roberts'] },
    { candidateName: 'David Park',    title: 'Interview 2', type: 'Interview 2', date: daysFromNow(0), startTime: '16:30', endTime: '17:30', format: 'Video Call',   status: 'upcoming',  interviewers: ['Lisa Chang'] },
    { candidateName: 'Lisa Turner',   title: 'Interview 1', type: 'Interview 1', date: daysFromNow(1), startTime: '10:00', endTime: '10:45', format: 'In-Person',    status: 'scheduled', interviewers: ['Ryan Scott'] },
    { candidateName: 'Mark Anderson', title: 'Screening',   type: 'Screening',   date: daysFromNow(1), startTime: '13:00', endTime: '13:30', format: 'Phone Screen', status: 'scheduled', interviewers: ['Nancy Kim'] },
    { candidateName: 'Emma Wilson',   title: 'Interview 2', type: 'Interview 2', date: daysFromNow(2), startTime: '11:00', endTime: '12:00', format: 'Video Call',   status: 'scheduled', interviewers: ['Chris Baker'] },
    { candidateName: 'James Lee',     title: 'Interview 1', type: 'Interview 1', date: daysAgo(5),     startTime: '15:00', endTime: '15:45', format: 'Video Call',   status: 'completed', interviewers: ['Tom Roberts'] },
    { candidateName: 'Anna Brown',    title: 'Screening',   type: 'Screening',   date: daysAgo(6),     startTime: '10:00', endTime: '10:30', format: 'Phone Screen', status: 'completed', interviewers: ['Lisa Chang'] },
  ];

  let interviewCount = 0;

  for (const spec of specificInterviews) {
    const app = candidateAppMap.get(spec.candidateName);
    if (!app) {
      console.warn(`⚠️  No application found for ${spec.candidateName} — skipping interview`);
      continue;
    }
    const locationStr = spec.format === 'In-Person' ? 'Office Conference Room A'
      : spec.format === 'Phone Screen' ? 'Phone Call' : 'Zoom Video Call';

    await prisma.interview.create({
      data: {
        applicationId: app.id,
        title:         spec.title,
        type:          spec.type,
        status:        spec.status,
        scheduledDate: spec.date,
        startTime:     spec.startTime,
        endTime:       spec.endTime,
        location:      locationStr,
        meetingLink:   spec.format === 'Video Call' ? 'https://zoom.us/j/demo123' : undefined,
        interviewers:  JSON.stringify(spec.interviewers),
        notes:         `${spec.type} for ${spec.candidateName}`,
        createdById:   adminUser.id,
      } as any,
    });
    interviewCount++;
  }

  // Additional procedurally generated interviews
  const interviewApps = await prisma.application.findMany({
    where: { status: { in: ['Interview 1', 'Interview 2', 'Screening', 'Offer'] } },
    include: { candidate: true, job: true },
    take: 30,
  });

  const addlTypes    = ['Screening', 'Interview 1', 'Interview 2', 'Technical', 'Culture Fit'];
  const addlFormats  = ['Video Call', 'Phone Screen', 'In-Person'];
  const addlStatuses = ['upcoming', 'scheduled', 'completed'];

  for (let i = 0; i < interviewApps.length && interviewCount < 30; i++) {
    const app    = interviewApps[i];
    const type   = addlTypes[i % addlTypes.length];
    const format = addlFormats[i % addlFormats.length];
    const status = addlStatuses[i % addlStatuses.length];
    const offsetDays = status === 'completed' ? -(i % 7 + 1) : (i % 7 + 1);
    const schedDate  = status === 'completed' ? daysAgo(i % 7 + 1) : daysFromNow(i % 7 + 1);
    const hour = 9 + (i % 8);

    await prisma.interview.create({
      data: {
        applicationId: app.id,
        title:         type,
        type,
        status,
        scheduledDate: schedDate,
        startTime:     `${String(hour).padStart(2, '0')}:00`,
        endTime:       `${String(hour + 1).padStart(2, '0')}:00`,
        location:      format === 'In-Person' ? 'Office Conference Room B' : format === 'Phone Screen' ? 'Phone Call' : 'Google Meet',
        meetingLink:   format === 'Video Call' ? 'https://meet.google.com/demo' : undefined,
        interviewers:  JSON.stringify(['Admin User']),
        notes:         `${type} for ${app.candidate.firstName} ${app.candidate.lastName} — ${app.job.title}`,
        createdById:   i % 2 === 0 ? adminUser.id : recruiterUser.id,
      } as any,
    });
    interviewCount++;
  }

  console.log(`✅ Created ${interviewCount} interviews`);

  // ===== EMAIL TEMPLATES =====
  const emailTemplates = [
    {
      name: 'Application Confirmation',
      subject: 'Thank you for your application to {{jobTitle}}',
      body: `Dear {{candidateName}},\n\nThank you for applying to the {{jobTitle}} position at {{companyName}}. We have received your application and will review it shortly.\n\nBest regards,\nThe {{companyName}} Team`,
      type: 'confirmation',
      variables: JSON.stringify(['candidateName', 'jobTitle', 'companyName']),
    },
    {
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
      body: `Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{jobTitle}} position.\n\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nLocation: {{interviewLocation}}\n\nBest regards,\n{{recruiterName}}`,
      type: 'interview_invite',
      variables: JSON.stringify(['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'interviewLocation', 'recruiterName']),
    },
    {
      name: 'Application Status Update',
      subject: 'Update on your application - {{jobTitle}}',
      body: `Dear {{candidateName}},\n\nYour application for {{jobTitle}} at {{companyName}} has been moved to the {{newStatus}} stage.\n\nBest regards,\nThe {{companyName}} Team`,
      type: 'status_update',
      variables: JSON.stringify(['candidateName', 'jobTitle', 'companyName', 'newStatus']),
    },
    {
      name: 'Job Offer',
      subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
      body: `Dear {{candidateName}},\n\nCongratulations! We are excited to extend an offer for the {{jobTitle}} position.\n\nSalary: {{salary}}\nStart Date: {{startDate}}\n\nBest regards,\n{{recruiterName}}`,
      type: 'offer',
      variables: JSON.stringify(['candidateName', 'jobTitle', 'companyName', 'salary', 'startDate', 'recruiterName']),
    },
    {
      name: 'Application Rejection',
      subject: 'Thank you for your interest - {{jobTitle}}',
      body: `Dear {{candidateName}},\n\nThank you for your interest in the {{jobTitle}} position. After careful consideration, we have decided to move forward with other candidates.\n\nBest regards,\nThe {{companyName}} Team`,
      type: 'rejection',
      variables: JSON.stringify(['candidateName', 'jobTitle', 'companyName']),
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.create({ data: template as any });
  }

  console.log('✅ Created email templates');

  // ===== ML MODEL ENTRY =====
  await prisma.trainingDataset.create({
    data: {
      name: 'Kaggle Resume Dataset',
      description: '2400+ labeled resumes for candidate classification',
      source: 'kaggle',
      datasetPath: './ml_models/data/resume_dataset.csv',
      features: JSON.stringify(['resume_text', 'category', 'years_experience', 'education_level', 'skills_extracted']),
      targetVariable: 'priority_score',
      recordCount: 2400,
      version: '1.0',
      metadata: JSON.stringify({ kaggle_url: 'https://www.kaggle.com/datasets/spidy20/resume-dataset', license: 'Public Domain', categories: 25 }),
    },
  });

  await prisma.mLModel.create({
    data: {
      name: 'Candidate Priority Classifier v1',
      type: 'candidate_scoring',
      version: '1.0',
      modelPath: './backend/ml-models/legacy/candidate_scoring_v1.pkl',
      accuracy: 0.847, precision: 0.823, recall: 0.789, f1Score: 0.805,
      trainingData: JSON.stringify({ datasetName: 'Kaggle Resume Dataset', recordCount: 2400, hyperparameters: { algorithm: 'RandomForest', n_estimators: 100 } }),
      features: JSON.stringify(['years_experience', 'education_level', 'skills_match_score', 'application_completeness', 'location_match']),
      isActive: false,
      trainedAt: new Date(),
    },
  });

  console.log('✅ Created ML dataset and model entries');

  console.log('\n🎉 Database seed completed!');
  console.log('📧 Login: admin@talentsol-demo.com / password123');
  console.log('       recruiter@talentsol-demo.com / password123');
  console.log(`📊 Stats: ${jobs.length} jobs · ${allCandidates.length} candidates · ${interviewCount} interviews · 8 sources`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
