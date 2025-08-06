import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo company
  const company = await prisma.company.create({
    data: {
      name: 'TalentSol Demo Company',
      domain: 'talentsol-demo.com',
    },
  });

  console.log('✅ Created demo company');

  // Create demo users
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

  console.log('✅ Created demo users');

  // Create comprehensive demo jobs based on frontend mock data
  const jobsData = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: {
        type: 'remote',
        allowRemote: true,
        country: 'US',
      },
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salary: {
        min: 120000,
        max: 150000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'We are looking for a Senior Frontend Developer to join our team and build amazing user experiences...',
      responsibilities: [
        'Develop user interfaces using React and TypeScript',
        'Collaborate with design team to implement pixel-perfect designs',
        'Optimize application performance and user experience',
        'Mentor junior developers and conduct code reviews',
      ],
      requiredQualifications: [
        '5+ years React experience',
        'TypeScript proficiency',
        'Experience with modern build tools',
      ],
      preferredQualifications: [
        'Next.js experience',
        'Design system knowledge',
        'Previous startup experience',
      ],
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      benefits: 'Comprehensive health insurance, 401k matching, flexible PTO',
      status: 'open',
      visibility: 'public',
      maxApplicants: 50,
      pipeline: {
        screening: 15,
        interview: 8,
        assessment: 4,
        offer: 1,
      },
      createdBy: adminUser.id,
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: {
        type: 'onsite',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        allowRemote: false,
      },
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 90000,
        max: 120000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Join our design team to create beautiful and intuitive user experiences...',
      responsibilities: [
        'Design user interfaces and experiences',
        'Create prototypes and wireframes',
        'Conduct user research and testing',
        'Collaborate with product and engineering teams',
      ],
      requiredQualifications: [
        '3+ years UX/UI experience',
        'Figma proficiency',
        'Strong portfolio demonstrating design process',
      ],
      preferredQualifications: [
        'Design system experience',
        'Frontend development knowledge',
        'Experience with user research methods',
      ],
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping'],
      benefits: 'Health insurance, design conference budget, flexible hours',
      status: 'open',
      visibility: 'public',
      maxApplicants: 30,
      pipeline: {
        screening: 8,
        interview: 4,
        assessment: 2,
        offer: 0,
      },
      createdBy: recruiterUser.id,
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: {
        type: 'hybrid',
        city: 'New York',
        state: 'NY',
        country: 'US',
        allowRemote: true,
      },
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salary: {
        min: 110000,
        max: 140000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Lead product strategy and development for our core platform...',
      responsibilities: [
        'Define product roadmap and strategy',
        'Work with engineering teams to deliver features',
        'Analyze user metrics and feedback',
        'Coordinate with stakeholders across the organization',
      ],
      requiredQualifications: [
        '5+ years product management experience',
        'Technical background preferred',
        'Experience with data analysis',
      ],
      preferredQualifications: [
        'SaaS experience',
        'Data analysis skills',
        'Previous startup experience',
      ],
      skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL'],
      benefits: 'Equity package, unlimited PTO, learning budget',
      status: 'open',
      visibility: 'public',
      maxApplicants: 40,
      pipeline: {
        screening: 12,
        interview: 6,
        assessment: 3,
        offer: 1,
      },
      createdBy: adminUser.id,
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: {
        type: 'remote',
        allowRemote: true,
        country: 'US',
      },
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salary: {
        min: 130000,
        max: 160000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Build and maintain our cloud infrastructure and deployment pipelines...',
      responsibilities: [
        'Manage CI/CD pipelines',
        'Monitor system performance and reliability',
        'Automate deployments and infrastructure',
        'Ensure security and compliance',
      ],
      requiredQualifications: [
        '5+ years DevOps experience',
        'AWS/Azure expertise',
        'Experience with containerization',
      ],
      preferredQualifications: [
        'Kubernetes experience',
        'Infrastructure as Code (Terraform)',
        'Security best practices',
      ],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
      benefits: 'Remote work, tech stipend, professional development budget',
      status: 'open',
      visibility: 'public',
      maxApplicants: 25,
      pipeline: {
        screening: 7,
        interview: 3,
        assessment: 1,
        offer: 0,
      },
      createdBy: adminUser.id,
    },
    {
      title: 'Sales Representative',
      department: 'Sales',
      location: {
        type: 'onsite',
        city: 'Chicago',
        state: 'IL',
        country: 'US',
        allowRemote: false,
      },
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 65000,
        max: 85000,
        currency: 'USD',
        negotiable: false,
      },
      description: 'Drive revenue growth by building relationships with enterprise clients...',
      responsibilities: [
        'Generate new leads and prospects',
        'Manage sales pipeline and forecasting',
        'Close deals and exceed quotas',
        'Build relationships with key accounts',
      ],
      requiredQualifications: [
        '3+ years B2B sales experience',
        'CRM experience (Salesforce preferred)',
        'Proven track record of meeting quotas',
      ],
      preferredQualifications: [
        'SaaS sales experience',
        'Enterprise sales experience',
        'Previous startup experience',
      ],
      skills: ['Salesforce', 'Cold Calling', 'Negotiation', 'Lead Generation'],
      benefits: 'Commission structure, car allowance, sales incentives',
      status: 'open',
      visibility: 'public',
      maxApplicants: 60,
      pipeline: {
        screening: 18,
        interview: 10,
        assessment: 5,
        offer: 2,
      },
      createdBy: recruiterUser.id,
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: {
        type: 'hybrid',
        city: 'Austin',
        state: 'TX',
        country: 'US',
        allowRemote: true,
      },
      employmentType: 'full-time',
      experienceLevel: 'entry',
      salary: {
        min: 70000,
        max: 90000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Execute marketing campaigns and analyze performance metrics...',
      responsibilities: [
        'Create marketing content and campaigns',
        'Manage social media presence',
        'Analyze campaign performance and ROI',
        'Support lead generation efforts',
      ],
      requiredQualifications: [
        '2+ years marketing experience',
        'Digital marketing knowledge',
        'Content creation skills',
      ],
      preferredQualifications: [
        'Content creation skills',
        'Analytics experience',
        'Social media management',
      ],
      skills: ['Google Analytics', 'Social Media', 'Content Marketing', 'SEO'],
      benefits: 'Flexible schedule, marketing conference budget, creative freedom',
      status: 'open',
      visibility: 'public',
      maxApplicants: 35,
      pipeline: {
        screening: 4,
        interview: 0,
        assessment: 0,
        offer: 0,
      },
      createdBy: recruiterUser.id,
    },
    {
      title: 'Data Scientist',
      department: 'Data & Analytics',
      location: {
        type: 'remote',
        allowRemote: true,
        country: 'US',
      },
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salary: {
        min: 140000,
        max: 180000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Join our data team to build machine learning models and drive data-driven insights...',
      responsibilities: [
        'Develop and deploy machine learning models',
        'Analyze large datasets to extract business insights',
        'Collaborate with product teams on data strategy',
        'Build data pipelines and automation tools',
      ],
      requiredQualifications: [
        '5+ years data science experience',
        'Python/R proficiency',
        'Machine learning expertise',
        'SQL and database knowledge',
      ],
      preferredQualifications: [
        'PhD in relevant field',
        'Deep learning experience',
        'Cloud platform experience (AWS/GCP)',
      ],
      skills: ['Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Pandas', 'Scikit-learn'],
      benefits: 'Remote work, learning budget, conference attendance, equity',
      status: 'open',
      visibility: 'public',
      maxApplicants: 20,
      pipeline: {
        screening: 5,
        interview: 2,
        assessment: 1,
        offer: 0,
      },
      createdBy: adminUser.id,
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: {
        type: 'hybrid',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        allowRemote: true,
      },
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 85000,
        max: 110000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Help our customers achieve success with our platform and drive retention...',
      responsibilities: [
        'Manage customer relationships and ensure satisfaction',
        'Drive product adoption and expansion',
        'Conduct customer training and onboarding',
        'Analyze customer health metrics',
      ],
      requiredQualifications: [
        '3+ years customer success experience',
        'SaaS platform experience',
        'Strong communication skills',
      ],
      preferredQualifications: [
        'Technical background',
        'Data analysis skills',
        'Previous startup experience',
      ],
      skills: ['Customer Success', 'SaaS', 'Data Analysis', 'Communication', 'Project Management'],
      benefits: 'Hybrid work, professional development, health insurance',
      status: 'open',
      visibility: 'public',
      maxApplicants: 25,
      pipeline: {
        screening: 6,
        interview: 3,
        assessment: 1,
        offer: 0,
      },
      createdBy: recruiterUser.id,
    },
    {
      title: 'Backend Engineer',
      department: 'Engineering',
      location: {
        type: 'remote',
        allowRemote: true,
        country: 'US',
      },
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 110000,
        max: 140000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Build scalable backend systems and APIs to power our platform...',
      responsibilities: [
        'Design and implement REST APIs',
        'Build scalable microservices',
        'Optimize database performance',
        'Ensure system reliability and security',
      ],
      requiredQualifications: [
        '4+ years backend development',
        'Node.js or Python experience',
        'Database design experience',
        'API development expertise',
      ],
      preferredQualifications: [
        'Microservices architecture',
        'Cloud platform experience',
        'DevOps knowledge',
      ],
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
      benefits: 'Remote work, tech stipend, health insurance, 401k',
      status: 'open',
      visibility: 'public',
      maxApplicants: 40,
      pipeline: {
        screening: 12,
        interview: 7,
        assessment: 3,
        offer: 1,
      },
      createdBy: adminUser.id,
    },
    {
      title: 'HR Business Partner',
      department: 'Human Resources',
      location: {
        type: 'onsite',
        city: 'Austin',
        state: 'TX',
        country: 'US',
        allowRemote: false,
      },
      employmentType: 'full-time',
      experienceLevel: 'senior',
      salary: {
        min: 95000,
        max: 125000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Partner with business leaders to drive HR strategy and employee engagement...',
      responsibilities: [
        'Partner with leadership on HR strategy',
        'Manage employee relations and performance',
        'Drive talent acquisition and retention',
        'Develop HR policies and procedures',
      ],
      requiredQualifications: [
        '5+ years HR business partner experience',
        'Strong business acumen',
        'Employee relations expertise',
      ],
      preferredQualifications: [
        'SHRM certification',
        'Tech industry experience',
        'Change management experience',
      ],
      skills: ['HR Strategy', 'Employee Relations', 'Talent Management', 'Performance Management'],
      benefits: 'Comprehensive benefits, professional development, flexible PTO',
      status: 'open',
      visibility: 'public',
      maxApplicants: 15,
      pipeline: {
        screening: 3,
        interview: 1,
        assessment: 0,
        offer: 0,
      },
      createdBy: recruiterUser.id,
    },
    {
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: {
        type: 'remote',
        allowRemote: true,
        country: 'US',
      },
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 80000,
        max: 105000,
        currency: 'USD',
        negotiable: true,
      },
      description: 'Lead content strategy and create compelling content to drive brand awareness...',
      responsibilities: [
        'Develop content marketing strategy',
        'Create blog posts, whitepapers, and case studies',
        'Manage content calendar and editorial process',
        'Measure content performance and ROI',
      ],
      requiredQualifications: [
        '4+ years content marketing experience',
        'Excellent writing and editing skills',
        'SEO and analytics knowledge',
      ],
      preferredQualifications: [
        'B2B SaaS experience',
        'Video content creation',
        'Marketing automation tools',
      ],
      skills: ['Content Marketing', 'SEO', 'Analytics', 'Writing', 'Marketing Automation'],
      benefits: 'Remote work, creative freedom, marketing budget, conferences',
      status: 'open',
      visibility: 'public',
      maxApplicants: 30,
      pipeline: {
        screening: 8,
        interview: 4,
        assessment: 2,
        offer: 0,
      },
      createdBy: recruiterUser.id,
    },
  ];

  // Create jobs in database
  const jobs = [];
  for (const jobData of jobsData) {
    const job = await prisma.job.create({
      data: {
        ...jobData,
        postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        currentApplicants: 0,
        companyId: company.id,
        createdById: jobData.createdBy,
      },
    });
    jobs.push(job);
  }

  console.log('✅ Created demo jobs');

  // Create comprehensive demo candidates based on frontend mock data
  const candidates = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      workAuthorization: 'US Citizen',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
    },
    {
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@example.com',
      phone: '+1 (555) 987-6543',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      workAuthorization: 'Work Visa',
      portfolioUrl: 'https://emmajohnson.design',
    },
    {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 456-7890',
      location: { city: 'Austin', state: 'TX', country: 'USA' },
      workAuthorization: 'US Citizen',
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      location: { city: 'San Francisco', state: 'CA', country: 'US' },
      workAuthorization: 'US Citizen',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    },
    {
      firstName: 'Alex',
      lastName: 'Rodriguez',
      email: 'alex.rodriguez@example.com',
      phone: '+1 (555) 234-5678',
      location: { city: 'Los Angeles', state: 'CA', country: 'USA' },
      workAuthorization: 'US Citizen',
      linkedinUrl: 'https://linkedin.com/in/alexrodriguez',
    },
    {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1 (555) 345-6789',
      location: { city: 'Miami', state: 'FL', country: 'USA' },
      workAuthorization: 'Work Visa',
      portfolioUrl: 'https://mariagarcia.design',
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      phone: '+1 (555) 456-7890',
      location: { city: 'Seattle', state: 'WA', country: 'USA' },
      workAuthorization: 'US Citizen',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 222-3333',
      location: { city: 'Portland', state: 'OR', country: 'USA' },
      workAuthorization: 'US Citizen',
    },
    {
      firstName: 'Robert',
      lastName: 'Miller',
      email: 'robert.miller@example.com',
      phone: '+1 (555) 333-4444',
      location: { city: 'Denver', state: 'CO', country: 'USA' },
      workAuthorization: 'US Citizen',
    },
    {
      firstName: 'Christopher',
      lastName: 'Lee',
      email: 'christopher.lee@example.com',
      phone: '+1 (555) 345-9012',
      location: { city: 'Boston', state: 'MA', country: 'USA' },
      workAuthorization: 'US Citizen',
    },
    {
      firstName: 'Michelle',
      lastName: 'Garcia',
      email: 'michelle.garcia@example.com',
      phone: '+1 (555) 456-0123',
      location: { city: 'Chicago', state: 'IL', country: 'USA' },
      workAuthorization: 'Work Visa',
    },
  ];

  // Create applications with realistic data
  const applicationStatuses = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
  const sources = ['company_website', 'job_board', 'referral', 'social_media', 'direct'];
  const experienceLevels = ['0-1', '1-3', '3-5', '5-10', '10+'];

  const professionalProfiles = [
    {
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'Tech Corp',
      experience: '5-10',
      expectedSalary: { min: 130000, max: 150000, currency: 'USD', negotiable: true },
      noticePeriod: '2 weeks',
      remoteWork: true,
    },
    {
      currentTitle: 'UX Designer',
      currentCompany: 'Design Studio',
      experience: '3-5',
      expectedSalary: { min: 85000, max: 105000, currency: 'USD', negotiable: true },
      noticePeriod: '3 weeks',
      remoteWork: false,
    },
    {
      currentTitle: 'Backend Developer',
      currentCompany: 'Startup Inc',
      experience: '3-5',
      expectedSalary: { min: 95000, max: 115000, currency: 'USD', negotiable: true },
      noticePeriod: '2 weeks',
      remoteWork: true,
    },
    {
      currentTitle: 'Product Manager',
      currentCompany: 'Enterprise Corp',
      experience: '5-10',
      expectedSalary: { min: 120000, max: 140000, currency: 'USD', negotiable: true },
      noticePeriod: '4 weeks',
      remoteWork: true,
    },
    {
      currentTitle: 'DevOps Engineer',
      currentCompany: 'Cloud Solutions',
      experience: '5-10',
      expectedSalary: { min: 125000, max: 145000, currency: 'USD', negotiable: true },
      noticePeriod: '2 weeks',
      remoteWork: true,
    },
  ];

  for (let i = 0; i < candidates.length; i++) {
    const candidateData = candidates[i];
    const job = jobs[i % jobs.length];
    const professionalInfo = professionalProfiles[i % professionalProfiles.length];

    const candidate = await prisma.candidate.create({
      data: candidateData,
    });

    const submittedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
    const status = applicationStatuses[i % applicationStatuses.length];

    await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        status: status as any,
        submittedAt: submittedDate,
        candidateInfo: candidateData,
        professionalInfo,
        metadata: {
          source: sources[i % sources.length] as any,
          ipAddress: `192.168.1.${100 + (i % 50)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          formVersion: '1.0',
          completionTime: 300 + Math.random() * 900, // 5-20 minutes
          gdprConsent: true,
          marketingConsent: Math.random() > 0.5,
        },
        scoring: {
          automaticScore: 60 + Math.random() * 40, // Score between 60-100
          skillMatches: job.skills.slice(0, Math.floor(Math.random() * job.skills.length) + 1),
          qualificationsMet: Math.random() > 0.3,
          experienceMatch: 70 + Math.random() * 30,
          salaryMatch: 80 + Math.random() * 20,
          locationMatch: 90 + Math.random() * 10,
          flags: [],
        },
        activity: [
          {
            type: 'application_submitted',
            timestamp: submittedDate.toISOString(),
            description: 'Application submitted',
          },
          ...(status !== 'applied' ? [{
            type: 'status_changed',
            timestamp: new Date(submittedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: `Status changed to ${status}`,
          }] : []),
        ],
        tags: job.skills.slice(0, Math.floor(Math.random() * 3) + 1), // Random tags from job skills
      },
    });

    // Update job application count
    await prisma.job.update({
      where: { id: job.id },
      data: {
        currentApplicants: {
          increment: 1,
        },
      },
    });
  }

  console.log('✅ Created demo candidates and applications');

  // Create some interviews for applications in interview/assessment stages
  const interviewApplications = await prisma.application.findMany({
    where: {
      status: { in: ['interview', 'assessment'] },
    },
    include: {
      candidate: true,
      job: true,
    },
  });

  const interviewTypes = ['phone', 'video', 'in-person', 'technical', 'behavioral'];
  const interviewTitles = [
    'Initial Phone Screening',
    'Technical Interview',
    'Behavioral Interview',
    'Final Round Interview',
    'Team Culture Fit',
  ];

  for (let i = 0; i < Math.min(interviewApplications.length, 8); i++) {
    const application = interviewApplications[i];
    const scheduledDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000); // Next 2 weeks

    await prisma.interview.create({
      data: {
        applicationId: application.id,
        title: interviewTitles[i % interviewTitles.length],
        type: interviewTypes[i % interviewTypes.length],
        scheduledDate,
        startTime: `${9 + Math.floor(Math.random() * 8)}:00`, // 9 AM to 4 PM
        endTime: `${10 + Math.floor(Math.random() * 8)}:00`,
        location: i % 2 === 0 ? 'Video Call - Zoom' : 'Office Conference Room A',
        interviewers: [adminUser.id, recruiterUser.id].slice(0, Math.floor(Math.random() * 2) + 1),
        notes: `Interview scheduled for ${application.candidate.firstName} ${application.candidate.lastName} - ${application.job.title} position`,
        status: 'scheduled',
        createdById: Math.random() > 0.5 ? adminUser.id : recruiterUser.id,
      },
    });
  }

  console.log('✅ Created demo interviews');

  // Create comprehensive email templates
  const emailTemplates = [
    {
      name: 'Application Confirmation',
      subject: 'Thank you for your application to {{jobTitle}}',
      body: `Dear {{candidateName}},

Thank you for applying to the {{jobTitle}} position at {{companyName}}. We have received your application and will review it shortly.

We will contact you within the next few days if your qualifications match our requirements.

Best regards,
The {{companyName}} Team`,
      type: 'confirmation',
      variables: ['candidateName', 'jobTitle', 'companyName'],
    },
    {
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
      body: `Dear {{candidateName}},

We are pleased to invite you for an interview for the {{jobTitle}} position at {{companyName}}.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Location: {{interviewLocation}}
- Interviewer(s): {{interviewers}}

Please confirm your availability by replying to this email.

Best regards,
{{recruiterName}}
{{companyName}}`,
      type: 'interview_invite',
      variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'interviewLocation', 'interviewers', 'recruiterName'],
    },
    {
      name: 'Application Status Update',
      subject: 'Update on your application - {{jobTitle}}',
      body: `Dear {{candidateName}},

We wanted to update you on the status of your application for the {{jobTitle}} position at {{companyName}}.

Your application has been moved to the {{newStatus}} stage. {{additionalMessage}}

We appreciate your interest in joining our team.

Best regards,
The {{companyName}} Team`,
      type: 'status_update',
      variables: ['candidateName', 'jobTitle', 'companyName', 'newStatus', 'additionalMessage'],
    },
    {
      name: 'Job Offer',
      subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
      body: `Dear {{candidateName}},

Congratulations! We are excited to extend an offer for the {{jobTitle}} position at {{companyName}}.

Offer Details:
- Position: {{jobTitle}}
- Start Date: {{startDate}}
- Salary: {{salary}}
- Benefits: {{benefits}}

Please review the attached offer letter and let us know your decision by {{offerDeadline}}.

We look forward to welcoming you to our team!

Best regards,
{{recruiterName}}
{{companyName}}`,
      type: 'offer',
      variables: ['candidateName', 'jobTitle', 'companyName', 'startDate', 'salary', 'benefits', 'offerDeadline', 'recruiterName'],
    },
    {
      name: 'Application Rejection',
      subject: 'Thank you for your interest - {{jobTitle}}',
      body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We encourage you to apply for future opportunities that match your background and interests.

Best regards,
The {{companyName}} Team`,
      type: 'rejection',
      variables: ['candidateName', 'jobTitle', 'companyName'],
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.create({
      data: template,
    });
  }

  console.log('✅ Created email templates');

  // Create ML training dataset entries
  await prisma.trainingDataset.create({
    data: {
      name: 'Kaggle Resume Dataset',
      description: '2400+ labeled resumes for candidate classification and skills extraction',
      source: 'kaggle',
      datasetPath: './ml_models/data/resume_dataset.csv',
      features: [
        'resume_text',
        'category',
        'years_experience',
        'education_level',
        'skills_extracted',
        'industry_experience'
      ],
      targetVariable: 'priority_score',
      recordCount: 2400,
      version: '1.0',
      metadata: {
        kaggle_url: 'https://www.kaggle.com/datasets/spidy20/resume-dataset',
        license: 'Public Domain',
        categories: 25,
        description: 'Resume dataset with job categories for ML training'
      },
    },
  });

  // Create a demo ML model entry
  await prisma.mLModel.create({
    data: {
      name: 'Candidate Priority Classifier v1',
      type: 'candidate_scoring',
      version: '1.0',
      modelPath: './backend/ml-models/legacy/candidate_scoring_v1.pkl',
      accuracy: 0.847,
      precision: 0.823,
      recall: 0.789,
      f1Score: 0.805,
      trainingData: {
        datasetName: 'Kaggle Resume Dataset',
        recordCount: 2400,
        features: [
          'years_experience',
          'education_level',
          'skills_match_score',
          'resume_quality',
          'application_completeness',
          'location_match',
          'salary_match'
        ],
        hyperparameters: {
          algorithm: 'RandomForest',
          n_estimators: 100,
          max_depth: 10,
          random_state: 42
        }
      },
      features: [
        'years_experience',
        'education_level',
        'technical_skills_count',
        'soft_skills_count',
        'skills_match_score',
        'role_relevance',
        'resume_quality_score',
        'cover_letter_present',
        'portfolio_present',
        'application_completeness',
        'response_time',
        'location_match',
        'salary_expectation_match',
        'availability_match'
      ],
      isActive: false, // Not active by default - requires manual activation
      trainedAt: new Date(),
    },
  });

  console.log('✅ Created ML training dataset and model entries');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('Admin: admin@talentsol-demo.com / password123');
  console.log('Recruiter: recruiter@talentsol-demo.com / password123');
  console.log('\n🤖 ML Features:');
  console.log('- ML models and datasets registered');
  console.log('- Ready for Kaggle dataset integration');
  console.log('- API endpoints: /api/ml/*');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
