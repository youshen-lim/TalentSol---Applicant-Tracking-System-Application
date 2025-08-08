import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Minimal Data Generation for TalentSol ATS
 * Creates exactly: 50 candidates, 50 applications, 10 interviews, 3 jobs
 */

const CANDIDATE_NAMES = [
  { firstName: 'Sarah', lastName: 'Chen' },
  { firstName: 'Marcus', lastName: 'Johnson' },
  { firstName: 'Emily', lastName: 'Rodriguez' },
  { firstName: 'David', lastName: 'Kim' },
  { firstName: 'Jessica', lastName: 'Thompson' },
  { firstName: 'Alex', lastName: 'Rivera' },
  { firstName: 'Priya', lastName: 'Patel' },
  { firstName: 'Michael', lastName: 'Brown' },
  { firstName: 'Jennifer', lastName: 'Wilson' },
  { firstName: 'Robert', lastName: 'Garcia' },
  { firstName: 'Lisa', lastName: 'Martinez' },
  { firstName: 'James', lastName: 'Anderson' },
  { firstName: 'Maria', lastName: 'Taylor' },
  { firstName: 'John', lastName: 'Thomas' },
  { firstName: 'Ashley', lastName: 'Jackson' },
  { firstName: 'Christopher', lastName: 'White' },
  { firstName: 'Amanda', lastName: 'Harris' },
  { firstName: 'Daniel', lastName: 'Martin' },
  { firstName: 'Michelle', lastName: 'Lee' },
  { firstName: 'Matthew', lastName: 'Clark' },
  { firstName: 'Stephanie', lastName: 'Lewis' },
  { firstName: 'Anthony', lastName: 'Robinson' },
  { firstName: 'Nicole', lastName: 'Walker' },
  { firstName: 'Kevin', lastName: 'Hall' },
  { firstName: 'Elizabeth', lastName: 'Allen' },
  { firstName: 'Brian', lastName: 'Young' },
  { firstName: 'Helen', lastName: 'King' },
  { firstName: 'Ryan', lastName: 'Wright' },
  { firstName: 'Samantha', lastName: 'Lopez' },
  { firstName: 'Jason', lastName: 'Hill' },
  { firstName: 'Rachel', lastName: 'Scott' },
  { firstName: 'William', lastName: 'Green' },
  { firstName: 'Laura', lastName: 'Adams' },
  { firstName: 'Steven', lastName: 'Baker' },
  { firstName: 'Karen', lastName: 'Gonzalez' },
  { firstName: 'Paul', lastName: 'Nelson' },
  { firstName: 'Susan', lastName: 'Carter' },
  { firstName: 'Mark', lastName: 'Mitchell' },
  { firstName: 'Linda', lastName: 'Perez' },
  { firstName: 'Charles', lastName: 'Roberts' },
  { firstName: 'Barbara', lastName: 'Turner' },
  { firstName: 'Joseph', lastName: 'Phillips' },
  { firstName: 'Nancy', lastName: 'Campbell' },
  { firstName: 'Thomas', lastName: 'Parker' },
  { firstName: 'Betty', lastName: 'Evans' },
  { firstName: 'Richard', lastName: 'Edwards' },
  { firstName: 'Dorothy', lastName: 'Collins' },
  { firstName: 'Donald', lastName: 'Stewart' },
  { firstName: 'Sandra', lastName: 'Sanchez' },
  { firstName: 'Kenneth', lastName: 'Morris' }
];

const JOB_DATA = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS']
  },
  {
    title: 'Product Manager',
    department: 'Product',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping']
  },
  {
    title: 'UX/UI Designer',
    department: 'Design',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping']
  }
];

const APPLICATION_STATUSES = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
const SOURCES = ['linkedin', 'indeed', 'company_website', 'referral', 'glassdoor'];

async function generateMinimalData() {
  console.log('🚀 Starting minimal data generation...');
  console.log('📊 Target: 50 candidates, 50 applications, 10 interviews, 3 jobs');

  try {
    // Step 1: Setup company and users
    const { company, adminUser } = await setupBaseData();

    // Step 2: Create exactly 3 jobs
    const jobs = await createJobs(company.id, adminUser.id);
    console.log(`✅ Created ${jobs.length} jobs`);

    // Step 3: Create exactly 50 candidates
    const candidates = await createCandidates();
    console.log(`✅ Created ${candidates.length} candidates`);

    // Step 4: Create exactly 50 applications (1 per candidate)
    const applications = await createApplications(candidates, jobs);
    console.log(`✅ Created ${applications.length} applications`);

    // Step 5: Create exactly 10 interviews
    const interviews = await createInterviews(applications, adminUser.id);
    console.log(`✅ Created ${interviews.length} interviews`);

    // Step 6: Add some documents and notifications
    await createDocuments(applications.slice(0, 20)); // 20 documents
    await createNotifications(applications.slice(0, 15), adminUser.id); // 15 notifications

    // Step 7: Verify data
    await verifyData();

    console.log('\n🎉 Minimal data generation completed successfully!');

  } catch (error) {
    console.error('❌ Minimal data generation failed:', error);
    throw error;
  }
}

async function setupBaseData() {
  // Get or create demo company
  let company = await prisma.company.findFirst({
    where: { name: 'TalentSol Demo Company' }
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'TalentSol Demo Company',
        domain: 'talentsol-demo.com',
      },
    });
  }

  // Create admin user
  const passwordHash = await bcrypt.hash('password123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@talentsol-demo.com' },
    update: {},
    create: {
      email: 'admin@talentsol-demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      companyId: company.id,
    },
  });

  return { company, adminUser };
}

async function createJobs(companyId: string, createdById: string) {
  const jobs: any[] = [];
  
  for (const jobData of JOB_DATA) {
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        department: jobData.department,
        location: JSON.stringify({ city: 'San Francisco', state: 'CA', remote: true }),
        employmentType: 'full_time',
        experienceLevel: 'mid',
        salary: JSON.stringify({ min: 80000, max: 120000, currency: 'USD' }),
        description: `We are looking for a talented ${jobData.title} to join our team.`,
        responsibilities: JSON.stringify([`Lead ${jobData.title.toLowerCase()} initiatives`, 'Collaborate with team']),
        requiredQualifications: JSON.stringify(['Bachelor\'s degree', '3+ years experience']),
        preferredQualifications: JSON.stringify(['Master\'s degree', '5+ years experience']),
        skills: JSON.stringify(jobData.skills),
        status: 'open',
        companyId,
        createdById,
      },
    });
    jobs.push(job);
  }

  return jobs;
}

async function createCandidates() {
  const candidates: any[] = [];
  
  for (let i = 0; i < 50; i++) {
    const nameData = CANDIDATE_NAMES[i];
    
    const candidate = await prisma.candidate.create({
      data: {
        firstName: nameData.firstName,
        lastName: nameData.lastName,
        email: `${nameData.firstName.toLowerCase()}.${nameData.lastName.toLowerCase()}@email.com`,
        phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
        location: JSON.stringify({ city: 'San Francisco', state: 'CA', country: 'USA', remote: true }),
        linkedinUrl: `https://linkedin.com/in/${nameData.firstName.toLowerCase()}${nameData.lastName.toLowerCase()}`,
        willingToRelocate: Math.random() > 0.5,
        workAuthorization: 'authorized',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    });
    
    candidates.push(candidate);
  }

  return candidates;
}

async function createApplications(candidates: any[], jobs: any[]) {
  const applications: any[] = [];
  
  for (let i = 0; i < 50; i++) {
    const candidate = candidates[i];
    const job = jobs[i % 3]; // Distribute across 3 jobs
    const submittedDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
    const status = APPLICATION_STATUSES[Math.floor(Math.random() * APPLICATION_STATUSES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        status: status as any,
        submittedAt: submittedDate,
        hiredAt: status === 'hired' ? new Date(submittedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        candidateInfo: JSON.stringify({
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
        }),
        professionalInfo: JSON.stringify({
          currentTitle: job.title,
          currentCompany: 'Previous Company',
          experience: '3-5',
          expectedSalary: { min: 90000, max: 130000, currency: 'USD', negotiable: true },
          noticePeriod: '2 weeks',
          remoteWork: true,
        }),
        metadata: JSON.stringify({
          source: source as any,
          ipAddress: `192.168.1.${100 + i}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          formVersion: '2.0',
          completionTime: 300 + Math.random() * 600,
          gdprConsent: true,
          marketingConsent: Math.random() > 0.5,
        }),
        scoring: JSON.stringify({
          automaticScore: 60 + Math.random() * 40,
          skillMatches: job.skills.slice(0, Math.floor(Math.random() * job.skills.length) + 1),
          qualificationsMet: Math.random() > 0.3,
          experienceMatch: 70 + Math.random() * 30,
          salaryMatch: 80 + Math.random() * 20,
          locationMatch: 90 + Math.random() * 10,
          flags: [],
        }),
        activity: JSON.stringify([
          {
            type: 'application_submitted',
            timestamp: submittedDate.toISOString(),
            description: `${candidate.firstName} ${candidate.lastName} submitted application`,
          },
        ]),
      },
    });

    applications.push(application);
  }

  return applications;
}

async function createInterviews(applications: any[], createdById: string) {
  const interviews: any[] = [];
  
  // Create exactly 10 interviews from the first 10 applications
  for (let i = 0; i < 10; i++) {
    const application = applications[i];
    const interviewDate = new Date(application.submittedAt.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000);

    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        type: ['technical', 'behavioral', 'panel'][i % 3],
        scheduledDate: interviewDate,
        location: i % 2 === 0 ? 'Video Call' : 'Office',
        status: 'scheduled',
        notes: `Interview ${i + 1} scheduled`,
        createdById,
      } as any,
    });

    interviews.push(interview);
  }

  return interviews;
}

async function createDocuments(applications: any[]) {
  for (const app of applications) {
    await prisma.document.create({
      data: {
        applicationId: app.id,
        filename: `resume_${app.candidateId}.pdf`,
        fileType: 'application/pdf',
        fileSize: Math.floor(Math.random() * 2000000) + 500000,
        fileUrl: `/uploads/resumes/resume_${app.candidateId}.pdf`,
        documentType: 'resume',
      },
    });
  }
}

async function createNotifications(applications: any[], userId: string) {
  for (const app of applications) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'application_received',
        title: 'New Application Received',
        message: `New application for ${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`,
        metadata: JSON.stringify({
          applicationId: app.id,
          candidateId: app.candidateId,
        }),
        isRead: Math.random() > 0.5,
        createdAt: app.submittedAt,
      },
    });
  }
}

async function verifyData() {
  const counts = await Promise.all([
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.interview.count(),
    prisma.job.count(),
    prisma.document.count(),
    prisma.notification.count(),
  ]);

  const [candidates, applications, interviews, jobs, documents, notifications] = counts;

  console.log('\n📊 Final Data Summary:');
  console.log(`👥 Candidates: ${candidates}`);
  console.log(`📝 Applications: ${applications}`);
  console.log(`🎯 Interviews: ${interviews}`);
  console.log(`💼 Jobs: ${jobs}`);
  console.log(`📄 Documents: ${documents}`);
  console.log(`🔔 Notifications: ${notifications}`);

  // Verify targets
  const success = candidates === 50 && applications === 50 && interviews === 10 && jobs === 3;
  console.log(`\n✅ Target Achievement: ${success ? 'SUCCESS' : 'PARTIAL'}`);
  
  if (!success) {
    console.log('⚠️  Some targets not met, but data is still usable');
  }
}

// Export and execution
export { generateMinimalData };

// Script execution
async function runMinimalDataGeneration() {
  try {
    await generateMinimalData();
  } catch (error) {
    console.error('❌ Minimal data generation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMinimalDataGeneration();
}
