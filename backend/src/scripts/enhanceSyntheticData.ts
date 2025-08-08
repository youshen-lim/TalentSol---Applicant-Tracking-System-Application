import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Enhanced synthetic data generation script
 * Creates unified candidate-centric data for TalentSol ATS
 */

interface CandidateProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: any;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle: string;
  currentCompany: string;
  experience: string;
  skills: string[];
  expectedSalary: any;
  noticePeriod: string;
  remoteWork: boolean;
}

const candidateProfiles: CandidateProfile[] = [
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@email.com',
    phone: '+1-555-0101',
    location: { city: 'San Francisco', state: 'CA', country: 'USA', remote: true },
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    portfolioUrl: 'https://sarahchen.dev',
    currentTitle: 'Senior Frontend Developer',
    currentCompany: 'TechCorp',
    experience: '5-10',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    expectedSalary: { min: 130000, max: 150000, currency: 'USD', negotiable: true },
    noticePeriod: '2 weeks',
    remoteWork: true,
  },
  {
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@email.com',
    phone: '+1-555-0102',
    location: { city: 'Austin', state: 'TX', country: 'USA', remote: false },
    linkedinUrl: 'https://linkedin.com/in/marcusjohnson',
    currentTitle: 'Product Manager',
    currentCompany: 'StartupXYZ',
    experience: '3-5',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping'],
    expectedSalary: { min: 110000, max: 130000, currency: 'USD', negotiable: true },
    noticePeriod: '4 weeks',
    remoteWork: true,
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0103',
    location: { city: 'New York', state: 'NY', country: 'USA', remote: false },
    linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
    portfolioUrl: 'https://emilydesigns.com',
    currentTitle: 'UX/UI Designer',
    currentCompany: 'DesignStudio',
    experience: '3-5',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    expectedSalary: { min: 95000, max: 115000, currency: 'USD', negotiable: true },
    noticePeriod: '3 weeks',
    remoteWork: true,
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@email.com',
    phone: '+1-555-0104',
    location: { city: 'Seattle', state: 'WA', country: 'USA', remote: true },
    linkedinUrl: 'https://linkedin.com/in/davidkim',
    currentTitle: 'DevOps Engineer',
    currentCompany: 'CloudTech',
    experience: '5-10',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Python'],
    expectedSalary: { min: 140000, max: 160000, currency: 'USD', negotiable: false },
    noticePeriod: '2 weeks',
    remoteWork: true,
  },
  {
    firstName: 'Jessica',
    lastName: 'Thompson',
    email: 'jessica.thompson@email.com',
    phone: '+1-555-0105',
    location: { city: 'Chicago', state: 'IL', country: 'USA', remote: false },
    linkedinUrl: 'https://linkedin.com/in/jessicathompson',
    currentTitle: 'Data Scientist',
    currentCompany: 'Analytics Inc',
    experience: '3-5',
    skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau', 'Statistics'],
    expectedSalary: { min: 120000, max: 140000, currency: 'USD', negotiable: true },
    noticePeriod: '4 weeks',
    remoteWork: true,
  },
];

const applicationStatuses = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
const sources = ['linkedin', 'indeed', 'company_website', 'referral', 'glassdoor'];

async function enhanceSyntheticData() {
  console.log('🚀 Starting enhanced synthetic data generation...');

  try {
    // Get the demo company
    const company = await prisma.company.findFirst({
      where: { name: 'TalentSol Demo Company' }
    });

    if (!company) {
      throw new Error('Demo company not found. Please run the seed script first.');
    }

    // Get existing jobs
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id }
    });

    if (jobs.length === 0) {
      throw new Error('No jobs found. Please run the seed script first.');
    }

    console.log(`Found ${jobs.length} jobs for company ${company.name}`);

    // Create enhanced candidates with applications
    for (let i = 0; i < candidateProfiles.length; i++) {
      const profile = candidateProfiles[i];
      
      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedinUrl: profile.linkedinUrl,
          portfolioUrl: profile.portfolioUrl,
          willingToRelocate: profile.remoteWork,
          workAuthorization: 'authorized',
        },
      });

      console.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName}`);

      // Create 1-3 applications for this candidate
      const numApplications = Math.floor(Math.random() * 3) + 1;
      const selectedJobs = jobs.sort(() => 0.5 - Math.random()).slice(0, numApplications);

      for (const job of selectedJobs) {
        const submittedDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Random date within last 60 days
        const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];

        // Set hiredAt if status is hired
        const hiredAt = status === 'hired' ? new Date(submittedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null;

        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            candidateId: candidate.id,
            status: status as any,
            submittedAt: submittedDate,
            hiredAt,
            candidateInfo: JSON.stringify({
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone,
              location: profile.location,
            }),
            professionalInfo: JSON.stringify({
              currentTitle: profile.currentTitle,
              currentCompany: profile.currentCompany,
              experience: profile.experience,
              expectedSalary: profile.expectedSalary,
              noticePeriod: profile.noticePeriod,
              remoteWork: profile.remoteWork,
            }),
            metadata: JSON.stringify({
              source: source as any,
              ipAddress: `192.168.1.${100 + Math.floor(Math.random() * 50)}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              formVersion: '2.0',
              completionTime: 300 + Math.random() * 900,
              gdprConsent: true,
              marketingConsent: Math.random() > 0.5,
            }),
            scoring: JSON.stringify({
              automaticScore: 60 + Math.random() * 40,
              skillMatches: profile.skills.slice(0, Math.floor(Math.random() * profile.skills.length) + 1),
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
                description: 'Application submitted',
              },
              ...(status !== 'applied' ? [{
                type: 'status_changed',
                timestamp: new Date(submittedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: `Status changed to ${status}`,
              }] : []),
            ]),
          },
        });

        console.log(`  📝 Created application for ${job.title} (${status})`);

        // Create interviews for applications in interview stage or beyond
        if (['interview', 'assessment', 'offer', 'hired'].includes(status)) {
          const interviewDate = new Date(submittedDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
          
          await prisma.interview.create({
            data: {
              applicationId: application.id,
              type: Math.random() > 0.5 ? 'technical' : 'behavioral',
              scheduledDate: interviewDate,
              location: Math.random() > 0.5 ? 'Video Call' : 'Office',
              status: 'scheduled',
              notes: `Interview scheduled for ${candidate.firstName} ${candidate.lastName}`,
              createdById: (await prisma.user.findFirst({ where: { companyId: company.id } }))!.id,
            } as any,
          });

          console.log(`  🎯 Created interview for ${candidate.firstName} ${candidate.lastName}`);
        }
      }
    }

    console.log('🎉 Enhanced synthetic data generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${candidateProfiles.length} enhanced candidate profiles`);
    console.log('- Generated realistic applications with proper status progression');
    console.log('- Created interviews for advanced-stage candidates');
    console.log('- All data is unified around candidate entities');

  } catch (error) {
    console.error('❌ Enhanced synthetic data generation failed:', error);
    throw error;
  }
}

// Run the script
enhanceSyntheticData()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
