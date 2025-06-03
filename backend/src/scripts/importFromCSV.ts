import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * CSV Import Script for TalentSol ATS
 * Imports data from the complete CSV file into the database
 */

interface CSVRow {
  candidate_id: string;
  job_id: string;
  application_id: string;
  application_status: string;
  submitted_date: string;
  score: string;
  skills: string;
  department: string;
  experience_level: string;
  remote_work: string;
  expected_salary_min: string;
  expected_salary_max: string;
  first_name: string;
  last_name: string;
  email: string;
  location_city: string;
  location_state: string;
}

async function importFromCSV() {
  console.log('📊 Starting CSV import for TalentSol ATS...');

  try {
    // Step 1: Clear existing data to ensure clean import
    await clearExistingData();

    // Step 2: Setup base data
    const { company, adminUser } = await setupBaseData();

    // Step 3: Read and parse CSV
    const csvData = await readCSVFile();
    console.log(`📄 Read ${csvData.length} rows from CSV`);

    // Step 4: Extract unique entities from flat CSV structure
    const uniqueJobs = extractUniqueJobs(csvData);
    const uniqueCandidates = extractUniqueCandidates(csvData);
    const applications = extractApplications(csvData);
    const interviews = extractInterviews(csvData);

    // Step 5: Import in correct order
    await importJobs(uniqueJobs, company.id, adminUser.id);
    await importCandidates(uniqueCandidates);
    await importApplications(applications);
    await importInterviews(interviews, adminUser.id);

    // Step 6: Verify import
    await verifyImport();

    console.log('\n🎉 CSV import completed successfully!');

  } catch (error) {
    console.error('❌ CSV import failed:', error);
    throw error;
  }
}

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');

  // Delete in reverse dependency order
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();

  console.log('✅ Existing data cleared');
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

async function readCSVFile(): Promise<CSVRow[]> {
  const csvPath = path.join(process.cwd(), 'data', 'talentsol_complete_data.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row as CSVRow);
  }

  return data;
}

function extractUniqueJobs(data: CSVRow[]) {
  const jobMap = new Map<string, CSVRow>();

  data.forEach(row => {
    if (!jobMap.has(row.job_id)) {
      jobMap.set(row.job_id, row);
    }
  });

  return Array.from(jobMap.values());
}

function extractUniqueCandidates(data: CSVRow[]) {
  const candidateMap = new Map<string, CSVRow>();

  data.forEach(row => {
    if (!candidateMap.has(row.candidate_id) && row.first_name && row.last_name) {
      candidateMap.set(row.candidate_id, row);
    }
  });

  return Array.from(candidateMap.values());
}

function extractApplications(data: CSVRow[]) {
  const applicationMap = new Map<string, CSVRow>();

  data.forEach(row => {
    if (!applicationMap.has(row.application_id) && row.application_id) {
      applicationMap.set(row.application_id, row);
    }
  });

  return Array.from(applicationMap.values());
}

function extractInterviews(data: CSVRow[]) {
  // For now, we'll create interviews for applications with 'interview' status
  return data.filter(row =>
    row.application_status === 'interview' &&
    row.application_id
  );
}

async function importJobs(jobRows: CSVRow[], companyId: string, createdById: string) {
  console.log(`💼 Importing ${jobRows.length} jobs...`);

  // Create job title mapping based on department
  const jobTitleMap: Record<string, string> = {
    'Engineering': 'Senior Software Engineer',
    'Product': 'Product Manager',
    'Design': 'UX/UI Designer'
  };

  for (const row of jobRows) {
    const skills = row.skills ? row.skills.split(',').map(s => s.trim()) : [];
    const salaryMin = parseInt(row.expected_salary_min) || 80000;
    const salaryMax = parseInt(row.expected_salary_max) || 120000;
    const jobTitle = jobTitleMap[row.department] || 'Software Engineer';

    await prisma.job.create({
      data: {
        id: row.job_id,
        title: jobTitle,
        department: row.department,
        location: {
          city: row.location_city || 'San Francisco',
          state: row.location_state || 'CA',
          remote: row.remote_work === 'True'
        },
        employmentType: 'full_time',
        experienceLevel: 'mid',
        salary: {
          min: salaryMin,
          max: salaryMax,
          currency: 'USD'
        },
        description: `We are looking for a talented ${jobTitle} to join our ${row.department} team.`,
        responsibilities: [`Lead ${jobTitle.toLowerCase()} initiatives`, 'Collaborate with cross-functional teams'],
        requiredQualifications: ['Bachelor\'s degree', '3+ years experience'],
        preferredQualifications: ['Master\'s degree', '5+ years experience'],
        skills,
        status: 'open',
        companyId,
        createdById,
      },
    });
  }

  console.log(`✅ Imported ${jobRows.length} jobs`);
}

async function importCandidates(candidateRows: CSVRow[]) {
  console.log(`👥 Importing ${candidateRows.length} candidates...`);

  for (const row of candidateRows) {
    // Extract phone from email field if it contains phone number
    const phone = row.email && row.email.startsWith('+1-') ? row.email : '+1-555-0000';
    const email = row.email && row.email.includes('@') ? row.email : `${row.first_name?.toLowerCase()}.${row.last_name?.toLowerCase()}@email.com`;

    await prisma.candidate.create({
      data: {
        id: row.candidate_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: email,
        phone: phone,
        location: {
          city: row.location_city || 'Unknown',
          state: row.location_state || 'CA',
          country: 'USA',
          remote: row.remote_work === 'True'
        },
        linkedinUrl: `https://linkedin.com/in/${row.first_name?.toLowerCase()}${row.last_name?.toLowerCase()}`,
        willingToRelocate: row.remote_work === 'True',
        workAuthorization: 'authorized',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ Imported ${candidateRows.length} candidates`);
}

async function importApplications(applicationRows: CSVRow[]) {
  console.log(`📝 Importing ${applicationRows.length} applications...`);

  for (const row of applicationRows) {
    const submittedDate = new Date(row.submitted_date);
    const hiredDate = row.application_status === 'hired' ? submittedDate : null;
    const skills = row.skills ? row.skills.split(',').map(s => s.trim()) : [];
    const score = parseFloat(row.score) || 75;
    const salaryMin = parseInt(row.expected_salary_min) || 80000;
    const salaryMax = parseInt(row.expected_salary_max) || 120000;

    // Extract phone and email properly
    const phone = row.email && row.email.startsWith('+1-') ? row.email : '+1-555-0000';
    const email = row.email && row.email.includes('@') ? row.email : `${row.first_name?.toLowerCase()}.${row.last_name?.toLowerCase()}@email.com`;

    await prisma.application.create({
      data: {
        id: row.application_id,
        jobId: row.job_id,
        candidateId: row.candidate_id,
        status: row.application_status as any,
        submittedAt: submittedDate,
        hiredAt: hiredDate,
        candidateInfo: {
          firstName: row.first_name,
          lastName: row.last_name,
          email: email,
          phone: phone,
          location: {
            city: row.location_city || 'Unknown',
            state: row.location_state || 'CA',
            country: 'USA'
          },
        },
        professionalInfo: {
          currentTitle: 'Software Engineer',
          currentCompany: 'Previous Company',
          experience: row.experience_level,
          expectedSalary: {
            min: salaryMin,
            max: salaryMax,
            currency: 'USD',
            negotiable: true
          },
          noticePeriod: '2 weeks',
          remoteWork: row.remote_work === 'True',
        },
        metadata: {
          source: 'website' as any,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          formVersion: '2.0',
          completionTime: 300 + Math.random() * 600,
          gdprConsent: true,
          marketingConsent: Math.random() > 0.5,
        },
        scoring: {
          automaticScore: score,
          skillMatches: skills,
          qualificationsMet: score > 80,
          experienceMatch: score,
          salaryMatch: 85,
          locationMatch: 90,
          flags: [],
        },
        activity: [
          {
            type: 'application_submitted',
            timestamp: submittedDate.toISOString(),
            description: `${row.first_name} ${row.last_name} submitted application`,
          },
        ],
      },
    });
  }

  console.log(`✅ Imported ${applicationRows.length} applications`);
}

async function importInterviews(interviewRows: CSVRow[], createdById: string) {
  console.log(`🎯 Importing ${interviewRows.length} interviews...`);

  for (const row of interviewRows) {
    // Create a scheduled date based on submitted date + some days
    const submittedDate = new Date(row.submitted_date);
    const scheduledDate = new Date(submittedDate.getTime() + (Math.random() * 14 + 1) * 24 * 60 * 60 * 1000);

    await prisma.interview.create({
      data: {
        id: `int_${row.application_id}`,
        applicationId: row.application_id,
        type: 'technical' as any,
        scheduledAt: scheduledDate,
        duration: 60,
        location: Math.random() > 0.5 ? 'Video Call' : 'Office',
        status: 'scheduled',
        notes: `Technical interview with ${row.first_name} ${row.last_name}`,
        createdById,
      },
    });
  }

  console.log(`✅ Imported ${interviewRows.length} interviews`);
}

async function verifyImport() {
  const counts = await Promise.all([
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.interview.count(),
    prisma.job.count(),
  ]);

  const [candidates, applications, interviews, jobs] = counts;

  console.log('\n📊 Import Verification:');
  console.log(`👥 Candidates: ${candidates}`);
  console.log(`📝 Applications: ${applications}`);
  console.log(`🎯 Interviews: ${interviews}`);
  console.log(`💼 Jobs: ${jobs}`);

  console.log(`\n✅ Import Status: SUCCESS`);
  console.log('📈 Data imported successfully from CSV');

  // Verify relationships
  const candidatesWithApps = await prisma.candidate.count({
    where: { applications: { some: {} } }
  });

  console.log(`🔗 Candidates with applications: ${candidatesWithApps}/${candidates}`);

  // Show sample data
  const sampleCandidate = await prisma.candidate.findFirst({
    include: {
      applications: {
        include: {
          job: true,
          interviews: true
        }
      }
    }
  });

  if (sampleCandidate) {
    console.log(`\n🔍 Sample candidate: ${sampleCandidate.firstName} ${sampleCandidate.lastName}`);
    console.log(`   Applications: ${sampleCandidate.applications.length}`);
  }
}

// Export and execution
export { importFromCSV };

// Script execution
async function runCSVImport() {
  try {
    await importFromCSV();
  } catch (error) {
    console.error('❌ CSV import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCSVImport();
}
