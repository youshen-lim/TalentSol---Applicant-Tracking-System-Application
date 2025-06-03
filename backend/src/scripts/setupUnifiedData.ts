import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Unified Data Setup Script for TalentSol ATS
 * Creates candidate-centric data architecture with realistic data
 */

interface UnifiedCandidate {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location: any;
  };
  professionalInfo: {
    currentTitle: string;
    currentCompany: string;
    experience: string;
    skills: string[];
    expectedSalary: any;
    noticePeriod: string;
    remoteWork: boolean;
  };
  applications: Array<{
    jobId: string;
    status: string;
    submittedAt: Date;
    hiredAt?: Date;
    source: string;
    score: number;
  }>;
  interviews: Array<{
    applicationId: string;
    type: string;
    scheduledAt: Date;
    status: string;
  }>;
}

const candidateProfiles = [
  {
    firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@email.com',
    currentTitle: 'Senior Frontend Developer', currentCompany: 'TechCorp',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    experience: '5-10', remoteWork: true,
    location: { city: 'San Francisco', state: 'CA', country: 'USA', remote: true }
  },
  {
    firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.johnson@email.com',
    currentTitle: 'Product Manager', currentCompany: 'StartupXYZ',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
    experience: '3-5', remoteWork: true,
    location: { city: 'Austin', state: 'TX', country: 'USA', remote: false }
  },
  {
    firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@email.com',
    currentTitle: 'UX/UI Designer', currentCompany: 'DesignStudio',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    experience: '3-5', remoteWork: true,
    location: { city: 'New York', state: 'NY', country: 'USA', remote: false }
  },
  {
    firstName: 'David', lastName: 'Kim', email: 'david.kim@email.com',
    currentTitle: 'DevOps Engineer', currentCompany: 'CloudTech',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Python'],
    experience: '5-10', remoteWork: true,
    location: { city: 'Seattle', state: 'WA', country: 'USA', remote: true }
  },
  {
    firstName: 'Jessica', lastName: 'Thompson', email: 'jessica.thompson@email.com',
    currentTitle: 'Data Scientist', currentCompany: 'Analytics Inc',
    skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau'],
    experience: '3-5', remoteWork: true,
    location: { city: 'Chicago', state: 'IL', country: 'USA', remote: false }
  },
  {
    firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@email.com',
    currentTitle: 'Full Stack Developer', currentCompany: 'WebSolutions',
    skills: ['JavaScript', 'Python', 'React', 'Django', 'PostgreSQL'],
    experience: '3-5', remoteWork: true,
    location: { city: 'Denver', state: 'CO', country: 'USA', remote: true }
  },
  {
    firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@email.com',
    currentTitle: 'Marketing Manager', currentCompany: 'GrowthCorp',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    experience: '3-5', remoteWork: false,
    location: { city: 'Los Angeles', state: 'CA', country: 'USA', remote: false }
  },
  {
    firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com',
    currentTitle: 'Sales Representative', currentCompany: 'SalesPro',
    skills: ['B2B Sales', 'CRM', 'Lead Generation', 'Negotiation'],
    experience: '1-3', remoteWork: false,
    location: { city: 'Miami', state: 'FL', country: 'USA', remote: false }
  }
];

const jobTitles = [
  'Senior React Developer', 'Product Designer', 'DevOps Engineer',
  'Data Scientist', 'Marketing Manager', 'Sales Representative',
  'Full Stack Developer', 'UX Researcher', 'Backend Engineer',
  'Product Manager'
];

const applicationStatuses = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
const sources = ['linkedin', 'indeed', 'company_website', 'referral', 'glassdoor'];

async function setupUnifiedData() {
  console.log('🚀 Setting up unified candidate-centric data architecture...');

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

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
      console.log('✅ Created demo company');
    }

    // Create admin user if not exists
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@talentsol-demo.com' }
    });

    if (!adminExists) {
      const passwordHash = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@talentsol-demo.com',
          passwordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          companyId: company.id,
        },
      });
      console.log('✅ Created admin user');
    }

    // Create jobs if not exist
    let jobs = await prisma.job.findMany({
      where: { companyId: company.id }
    });

    if (jobs.length === 0) {
      const jobPromises = jobTitles.map(title => 
        prisma.job.create({
          data: {
            title,
            department: getDepartmentForTitle(title),
            location: { city: 'San Francisco', state: 'CA', remote: true },
            employmentType: 'full_time',
            experienceLevel: 'mid',
            salary: { min: 80000, max: 120000, currency: 'USD' },
            description: `We are looking for a talented ${title} to join our team.`,
            responsibilities: [`Lead ${title.toLowerCase()} initiatives`, 'Collaborate with team'],
            requiredQualifications: ['Bachelor\'s degree', '3+ years experience'],
            preferredQualifications: ['Master\'s degree', '5+ years experience'],
            skills: getSkillsForTitle(title),
            status: 'open',
            companyId: company.id,
            createdById: adminExists?.id || (await prisma.user.findFirst({ where: { companyId: company.id } }))!.id,
          },
        })
      );
      jobs = await Promise.all(jobPromises);
      console.log(`✅ Created ${jobs.length} job openings`);
    }

    // Create unified candidate data
    console.log('📊 Creating unified candidate-centric data...');
    
    for (let i = 0; i < candidateProfiles.length; i++) {
      const profile = candidateProfiles[i];
      
      // Check if candidate already exists
      const existingCandidate = await prisma.candidate.findFirst({
        where: { email: profile.email }
      });

      if (existingCandidate) {
        console.log(`⏭️  Candidate ${profile.firstName} ${profile.lastName} already exists`);
        continue;
      }

      // Create candidate (Primary Entity)
      const candidate = await prisma.candidate.create({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: `+1-555-010${i + 1}`,
          location: profile.location,
          linkedinUrl: `https://linkedin.com/in/${profile.firstName.toLowerCase()}${profile.lastName.toLowerCase()}`,
          portfolioUrl: profile.skills.includes('Design') ? `https://${profile.firstName.toLowerCase()}designs.com` : undefined,
          willingToRelocate: profile.remoteWork,
          workAuthorization: 'authorized',
        },
      });

      console.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName} (ID: ${candidate.id})`);

      // Create 1-3 applications per candidate
      const numApplications = Math.floor(Math.random() * 3) + 1;
      const selectedJobs = jobs.sort(() => 0.5 - Math.random()).slice(0, numApplications);

      for (const job of selectedJobs) {
        const submittedDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
        const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const hiredAt = status === 'hired' ? new Date(submittedDate.getTime() + Math.random() * 45 * 24 * 60 * 60 * 1000) : null;

        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            candidateId: candidate.id, // KEY: Linked to candidate
            status: status as any,
            submittedAt: submittedDate,
            hiredAt,
            candidateInfo: {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: `+1-555-010${i + 1}`,
              location: profile.location,
            },
            professionalInfo: {
              currentTitle: profile.currentTitle,
              currentCompany: profile.currentCompany,
              experience: profile.experience,
              expectedSalary: { min: 90000, max: 130000, currency: 'USD', negotiable: true },
              noticePeriod: '2-4 weeks',
              remoteWork: profile.remoteWork,
            },
            metadata: {
              source: source as any,
              ipAddress: `192.168.1.${100 + i}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              formVersion: '2.0',
              completionTime: 300 + Math.random() * 600,
              gdprConsent: true,
              marketingConsent: Math.random() > 0.5,
            },
            scoring: {
              automaticScore: 60 + Math.random() * 40,
              skillMatches: profile.skills.slice(0, Math.floor(Math.random() * profile.skills.length) + 1),
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
                description: `${candidate.firstName} ${candidate.lastName} submitted application`,
              },
            ],
          },
        });

        console.log(`  📝 Application: ${job.title} (${status}) - Candidate ID: ${candidate.id}`);

        // Create interviews for advanced applications
        if (['interview', 'assessment', 'offer', 'hired'].includes(status)) {
          const interviewDate = new Date(submittedDate.getTime() + Math.random() * 21 * 24 * 60 * 60 * 1000);
          
          await prisma.interview.create({
            data: {
              applicationId: application.id,
              type: Math.random() > 0.5 ? 'technical' : 'behavioral',
              scheduledAt: interviewDate,
              duration: 60,
              location: Math.random() > 0.5 ? 'Video Call' : 'Office',
              status: 'scheduled',
              notes: `Interview with ${candidate.firstName} ${candidate.lastName} for ${job.title}`,
              createdById: adminExists?.id || (await prisma.user.findFirst({ where: { companyId: company.id } }))!.id,
            },
          });

          console.log(`    🎯 Interview scheduled for ${candidate.firstName} ${candidate.lastName}`);
        }
      }
    }

    console.log('\n🎉 Unified candidate-centric data setup completed!');
    console.log('\n📊 Data Summary:');
    
    const stats = await Promise.all([
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.job.count({ where: { companyId: company.id } }),
    ]);

    console.log(`- Candidates: ${stats[0]} (Primary entities)`);
    console.log(`- Applications: ${stats[1]} (Linked to candidates)`);
    console.log(`- Interviews: ${stats[2]} (Linked via applications)`);
    console.log(`- Jobs: ${stats[3]} (Referenced by applications)`);
    console.log('\n✅ All data is unified around candidate_ID as primary key');

  } catch (error) {
    console.error('❌ Unified data setup failed:', error);
    throw error;
  }
}

function getDepartmentForTitle(title: string): string {
  if (title.includes('Developer') || title.includes('Engineer')) return 'Engineering';
  if (title.includes('Designer') || title.includes('UX')) return 'Design';
  if (title.includes('Product')) return 'Product';
  if (title.includes('Marketing')) return 'Marketing';
  if (title.includes('Sales')) return 'Sales';
  if (title.includes('Data')) return 'Data';
  return 'General';
}

function getSkillsForTitle(title: string): string[] {
  const skillMap: Record<string, string[]> = {
    'Senior React Developer': ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    'Product Designer': ['Figma', 'Adobe Creative Suite', 'Prototyping'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    'Marketing Manager': ['Digital Marketing', 'SEO', 'Analytics'],
    'Sales Representative': ['B2B Sales', 'CRM', 'Lead Generation'],
  };
  return skillMap[title] || ['Communication', 'Problem Solving'];
}

// Run the script
setupUnifiedData()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
