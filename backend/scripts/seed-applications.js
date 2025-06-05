const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedApplications() {
  try {
    console.log('🌱 Starting to seed applications...');

    // First, let's check if we have any companies
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ No company found. Creating a default company...');
      const newCompany = await prisma.company.create({
        data: {
          id: 'comp_1',
          name: 'TalentSol Demo Company',
          domain: 'talentsol.com',
        },
      });
      console.log('✅ Created company:', newCompany.name);
    }

    // Check if we have any jobs
    let job = await prisma.job.findFirst({
      where: { companyId: 'comp_1' }
    });

    if (!job) {
      console.log('❌ No jobs found. Creating a sample job...');
      job = await prisma.job.create({
        data: {
          id: 'job_1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          companyId: 'comp_1',
          status: 'active',
          description: 'We are looking for a Senior Software Engineer to join our team.',
          employmentType: 'full-time',
          experienceLevel: 'senior',
          maxApplications: 100,
          currentApplications: 0,
          source: 'internal',
        },
      });
      console.log('✅ Created job:', job.title);
    }

    // Create some candidate sources
    const sources = [
      { id: 'src_1', name: 'LinkedIn', category: 'social_media' },
      { id: 'src_2', name: 'Indeed', category: 'job_board' },
      { id: 'src_3', name: 'Company Website', category: 'company_website' },
      { id: 'src_4', name: 'Referral', category: 'referral' },
    ];

    for (const sourceData of sources) {
      await prisma.candidateSource.upsert({
        where: { id: sourceData.id },
        update: {},
        create: sourceData,
      });
    }
    console.log('✅ Created candidate sources');

    // Create sample candidates and applications
    const candidates = [
      {
        id: 'cand_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        sourceId: 'src_1',
      },
      {
        id: 'cand_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        sourceId: 'src_2',
      },
      {
        id: 'cand_3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0103',
        sourceId: 'src_3',
      },
      {
        id: 'cand_4',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1-555-0104',
        sourceId: 'src_4',
      },
      {
        id: 'cand_5',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        phone: '+1-555-0105',
        sourceId: 'src_1',
      },
    ];

    for (const candidateData of candidates) {
      await prisma.candidate.upsert({
        where: { id: candidateData.id },
        update: {},
        create: candidateData,
      });
    }
    console.log('✅ Created candidates');

    // Create applications
    const applications = [
      {
        id: 'app_1',
        jobId: job.id,
        candidateId: 'cand_1',
        status: 'applied',
        submittedAt: new Date('2024-01-15'),
        score: 85,
        sourceId: 'src_1',
        candidateInfo: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        activity: [],
        tags: ['experienced', 'javascript'],
        communicationHistory: [],
      },
      {
        id: 'app_2',
        jobId: job.id,
        candidateId: 'cand_2',
        status: 'screening',
        submittedAt: new Date('2024-01-16'),
        score: 78,
        sourceId: 'src_2',
        candidateInfo: { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
        activity: [],
        tags: ['react', 'frontend'],
        communicationHistory: [],
      },
      {
        id: 'app_3',
        jobId: job.id,
        candidateId: 'cand_3',
        status: 'interview',
        submittedAt: new Date('2024-01-17'),
        score: 92,
        sourceId: 'src_3',
        candidateInfo: { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com' },
        activity: [],
        tags: ['senior', 'fullstack'],
        communicationHistory: [],
      },
      {
        id: 'app_4',
        jobId: job.id,
        candidateId: 'cand_4',
        status: 'offer',
        submittedAt: new Date('2024-01-18'),
        score: 88,
        sourceId: 'src_4',
        candidateInfo: { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@example.com' },
        activity: [],
        tags: ['nodejs', 'backend'],
        communicationHistory: [],
      },
      {
        id: 'app_5',
        jobId: job.id,
        candidateId: 'cand_5',
        status: 'hired',
        submittedAt: new Date('2024-01-19'),
        hiredAt: new Date('2024-01-25'),
        score: 95,
        sourceId: 'src_1',
        candidateInfo: { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' },
        activity: [],
        tags: ['team-lead', 'architecture'],
        communicationHistory: [],
      },
    ];

    for (const appData of applications) {
      await prisma.application.upsert({
        where: { id: appData.id },
        update: {},
        create: appData,
      });
    }

    console.log('✅ Created applications');
    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Created ${applications.length} applications for job: ${job.title}`);

  } catch (error) {
    console.error('❌ Error seeding applications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedApplications();
