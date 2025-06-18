/**
 * ML Data Seeding Script
 * Populates database with ML-aligned sample data for candidate recommendations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data aligned with ML training dataset columns
const sampleJobs = [
  {
    title: 'Senior Frontend Developer',
    role: 'software developer',
    workType: 'full-time',
    companySizeCategory: 'medium',
    salaryMin: 120000,
    salaryMax: 150000,
    salaryCurrency: 'USD',
    locationCity: 'San Francisco',
    locationState: 'CA',
    locationCountry: 'USA',
    locationLatitude: 37.7749,
    locationLongitude: -122.4194,
    remoteWorkAllowed: true,
    preference: 'Both',
    requiredSkillsArray: JSON.stringify(['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML']),
    preferredSkillsArray: JSON.stringify(['Node.js', 'GraphQL', 'AWS', 'Docker']),
    industryTags: JSON.stringify(['Technology', 'Software', 'Web Development']),
    jobPortal: 'TalentSol',
    contactPerson: 'Sarah Johnson',
    contactInfo: 'sarah.johnson@company.com',
    experienceLevel: 'senior',
    description: 'We are looking for a Senior Frontend Developer to join our growing team...',
    requiredQualifications: 'Bachelor\'s degree in Computer Science or related field',
    skills: 'React, TypeScript, JavaScript, CSS, HTML, Node.js',
    benefits: 'Health insurance, 401k, flexible PTO, remote work options',
  },
  {
    title: 'Marketing Manager',
    role: 'marketing manager',
    workType: 'full-time',
    companySizeCategory: 'large',
    salaryMin: 80000,
    salaryMax: 110000,
    salaryCurrency: 'USD',
    locationCity: 'New York',
    locationState: 'NY',
    locationCountry: 'USA',
    locationLatitude: 40.7128,
    locationLongitude: -74.0060,
    remoteWorkAllowed: false,
    preference: 'Both',
    requiredSkillsArray: JSON.stringify(['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics']),
    preferredSkillsArray: JSON.stringify(['Google Ads', 'Facebook Ads', 'HubSpot', 'Salesforce']),
    industryTags: JSON.stringify(['Marketing', 'Digital', 'E-commerce']),
    jobPortal: 'TalentSol',
    contactPerson: 'Mike Chen',
    contactInfo: 'mike.chen@company.com',
    experienceLevel: 'mid',
    description: 'Join our marketing team to drive growth and brand awareness...',
    requiredQualifications: 'Bachelor\'s degree in Marketing, Business, or related field',
    skills: 'Digital Marketing, SEO, Content Marketing, Analytics, Google Ads',
    benefits: 'Health insurance, dental, vision, 401k, gym membership',
  },
  {
    title: 'Data Scientist',
    role: 'data scientist',
    workType: 'full-time',
    companySizeCategory: 'startup',
    salaryMin: 130000,
    salaryMax: 180000,
    salaryCurrency: 'USD',
    locationCity: 'Austin',
    locationState: 'TX',
    locationCountry: 'USA',
    locationLatitude: 30.2672,
    locationLongitude: -97.7431,
    remoteWorkAllowed: true,
    preference: 'Both',
    requiredSkillsArray: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'Statistics']),
    preferredSkillsArray: JSON.stringify(['TensorFlow', 'PyTorch', 'AWS', 'Docker', 'Kubernetes']),
    industryTags: JSON.stringify(['Technology', 'AI/ML', 'Data Science']),
    jobPortal: 'TalentSol',
    contactPerson: 'Dr. Lisa Wang',
    contactInfo: 'lisa.wang@company.com',
    experienceLevel: 'senior',
    description: 'We\'re seeking a Data Scientist to build ML models and drive insights...',
    requiredQualifications: 'Master\'s degree in Data Science, Statistics, or related field',
    skills: 'Python, Machine Learning, SQL, Statistics, TensorFlow, PyTorch',
    benefits: 'Equity, health insurance, unlimited PTO, learning budget',
  },
];

const sampleCandidates = [
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@email.com',
    phone: '+1-555-0101',
    experienceYears: 5,
    currentPosition: 'Senior Frontend Developer',
    currentCompany: 'Tech Corp',
    educationLevel: 'bachelor',
    educationField: 'Computer Science',
    skillsArray: JSON.stringify(['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS']),
    certifications: JSON.stringify(['AWS Certified Developer', 'React Certification']),
    languagesSpoken: JSON.stringify(['English', 'Mandarin']),
    availabilityStatus: 'employed',
    noticePeriodDays: 14,
    expectedSalaryMin: 130000,
    expectedSalaryMax: 160000,
    salaryCurrency: 'USD',
    preferredWorkType: 'full-time',
    remoteWorkPreference: 'hybrid',
    locationCity: 'San Francisco',
    locationState: 'CA',
    locationCountry: 'USA',
    locationLatitude: 37.7749,
    locationLongitude: -122.4194,
    willingToRelocate: false,
    preferredCompanySize: 'medium',
    industryPreferences: JSON.stringify(['Technology', 'FinTech']),
    careerGoals: JSON.stringify(['Technical Leadership', 'Product Development']),
    personalityTraits: JSON.stringify({ openness: 0.8, conscientiousness: 0.9, extraversion: 0.6 }),
    workValues: JSON.stringify(['Innovation', 'Work-Life Balance', 'Growth']),
  },
  {
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@email.com',
    phone: '+1-555-0102',
    experienceYears: 7,
    currentPosition: 'Marketing Director',
    currentCompany: 'Growth Inc',
    educationLevel: 'master',
    educationField: 'Marketing',
    skillsArray: JSON.stringify(['Digital Marketing', 'SEO', 'Google Ads', 'Analytics', 'Content Strategy']),
    certifications: JSON.stringify(['Google Ads Certified', 'HubSpot Certified', 'Facebook Blueprint']),
    languagesSpoken: JSON.stringify(['English', 'Spanish']),
    availabilityStatus: 'available',
    noticePeriodDays: 30,
    expectedSalaryMin: 90000,
    expectedSalaryMax: 120000,
    salaryCurrency: 'USD',
    preferredWorkType: 'full-time',
    remoteWorkPreference: 'flexible',
    locationCity: 'Austin',
    locationState: 'TX',
    locationCountry: 'USA',
    locationLatitude: 30.2672,
    locationLongitude: -97.7431,
    willingToRelocate: true,
    preferredCompanySize: 'large',
    industryPreferences: JSON.stringify(['Marketing', 'E-commerce', 'SaaS']),
    careerGoals: JSON.stringify(['VP Marketing', 'CMO', 'Startup Founder']),
    personalityTraits: JSON.stringify({ openness: 0.9, conscientiousness: 0.8, extraversion: 0.9 }),
    workValues: JSON.stringify(['Leadership', 'Impact', 'Innovation']),
  },
  {
    firstName: 'Dr. Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0103',
    experienceYears: 8,
    currentPosition: 'Senior Data Scientist',
    currentCompany: 'AI Labs',
    educationLevel: 'phd',
    educationField: 'Statistics',
    skillsArray: JSON.stringify(['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'R']),
    certifications: JSON.stringify(['AWS ML Specialty', 'Google Cloud ML Engineer', 'Kaggle Expert']),
    languagesSpoken: JSON.stringify(['English', 'Spanish', 'Portuguese']),
    availabilityStatus: 'employed',
    noticePeriodDays: 21,
    expectedSalaryMin: 150000,
    expectedSalaryMax: 200000,
    salaryCurrency: 'USD',
    preferredWorkType: 'full-time',
    remoteWorkPreference: 'remote',
    locationCity: 'Boston',
    locationState: 'MA',
    locationCountry: 'USA',
    locationLatitude: 42.3601,
    locationLongitude: -71.0589,
    willingToRelocate: false,
    preferredCompanySize: 'startup',
    industryPreferences: JSON.stringify(['AI/ML', 'Healthcare', 'FinTech']),
    careerGoals: JSON.stringify(['Chief Data Officer', 'ML Research', 'AI Startup']),
    personalityTraits: JSON.stringify({ openness: 0.95, conscientiousness: 0.9, extraversion: 0.4 }),
    workValues: JSON.stringify(['Research', 'Innovation', 'Impact']),
  },
  {
    firstName: 'Alex',
    lastName: 'Kim',
    email: 'alex.kim@email.com',
    phone: '+1-555-0104',
    experienceYears: 3,
    currentPosition: 'Full Stack Developer',
    currentCompany: 'StartupXYZ',
    educationLevel: 'bachelor',
    educationField: 'Computer Science',
    skillsArray: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB']),
    certifications: JSON.stringify(['AWS Cloud Practitioner', 'MongoDB Certified']),
    languagesSpoken: JSON.stringify(['English', 'Korean']),
    availabilityStatus: 'available',
    noticePeriodDays: 7,
    expectedSalaryMin: 100000,
    expectedSalaryMax: 130000,
    salaryCurrency: 'USD',
    preferredWorkType: 'full-time',
    remoteWorkPreference: 'remote',
    locationCity: 'Seattle',
    locationState: 'WA',
    locationCountry: 'USA',
    locationLatitude: 47.6062,
    locationLongitude: -122.3321,
    willingToRelocate: true,
    preferredCompanySize: 'startup',
    industryPreferences: JSON.stringify(['Technology', 'Gaming', 'E-commerce']),
    careerGoals: JSON.stringify(['Senior Developer', 'Tech Lead', 'CTO']),
    personalityTraits: JSON.stringify({ openness: 0.8, conscientiousness: 0.7, extraversion: 0.7 }),
    workValues: JSON.stringify(['Learning', 'Flexibility', 'Innovation']),
  },
  {
    firstName: 'Jessica',
    lastName: 'Brown',
    email: 'jessica.brown@email.com',
    phone: '+1-555-0105',
    experienceYears: 6,
    currentPosition: 'Product Marketing Manager',
    currentCompany: 'SaaS Solutions',
    educationLevel: 'master',
    educationField: 'Business Administration',
    skillsArray: JSON.stringify(['Product Marketing', 'Go-to-Market', 'Customer Research', 'Positioning']),
    certifications: JSON.stringify(['Product Marketing Certified', 'Pragmatic Marketing']),
    languagesSpoken: JSON.stringify(['English', 'French']),
    availabilityStatus: 'employed',
    noticePeriodDays: 30,
    expectedSalaryMin: 95000,
    expectedSalaryMax: 125000,
    salaryCurrency: 'USD',
    preferredWorkType: 'full-time',
    remoteWorkPreference: 'hybrid',
    locationCity: 'Denver',
    locationState: 'CO',
    locationCountry: 'USA',
    locationLatitude: 39.7392,
    locationLongitude: -104.9903,
    willingToRelocate: false,
    preferredCompanySize: 'medium',
    industryPreferences: JSON.stringify(['SaaS', 'B2B', 'Technology']),
    careerGoals: JSON.stringify(['VP Product Marketing', 'CMO', 'Product Strategy']),
    personalityTraits: JSON.stringify({ openness: 0.8, conscientiousness: 0.85, extraversion: 0.8 }),
    workValues: JSON.stringify(['Strategy', 'Customer Focus', 'Growth']),
  },
];

const sampleJobMarketData = [
  {
    averageSalary: 135000,
    salaryPercentile25: 120000,
    salaryPercentile75: 150000,
    demandScore: 0.8,
    supplyScore: 0.6,
    competitionLevel: 0.7,
    timeToFillAverage: 45,
    applicationVolume: 150,
    qualityScore: 0.75,
    locationDemand: 0.9,
    remoteCompatibility: 0.8,
    relocationLikelihood: 0.3,
    industryGrowthRate: 0.15,
    roleEvolutionScore: 0.7,
    automationRisk: 0.2,
    skillsEvolutionRate: 0.6,
  },
  {
    averageSalary: 95000,
    salaryPercentile25: 80000,
    salaryPercentile75: 110000,
    demandScore: 0.7,
    supplyScore: 0.8,
    competitionLevel: 0.6,
    timeToFillAverage: 30,
    applicationVolume: 200,
    qualityScore: 0.7,
    locationDemand: 0.8,
    remoteCompatibility: 0.6,
    relocationLikelihood: 0.4,
    industryGrowthRate: 0.12,
    roleEvolutionScore: 0.8,
    automationRisk: 0.4,
    skillsEvolutionRate: 0.7,
  },
  {
    averageSalary: 155000,
    salaryPercentile25: 130000,
    salaryPercentile75: 180000,
    demandScore: 0.9,
    supplyScore: 0.4,
    competitionLevel: 0.9,
    timeToFillAverage: 60,
    applicationVolume: 80,
    qualityScore: 0.85,
    locationDemand: 0.85,
    remoteCompatibility: 0.9,
    relocationLikelihood: 0.5,
    industryGrowthRate: 0.25,
    roleEvolutionScore: 0.9,
    automationRisk: 0.1,
    skillsEvolutionRate: 0.8,
  },
];

async function seedMLData() {
  console.log('🌱 Starting ML data seeding...');

  try {
    // Get the admin company
    const company = await prisma.company.findFirst({
      where: { name: 'TalentSol Demo Company' },
    });

    if (!company) {
      throw new Error('Demo company not found. Please run basic seed first.');
    }

    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@talentsol.com' },
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Please run basic seed first.');
    }

    // Create enhanced jobs
    console.log('📋 Creating enhanced jobs...');
    const createdJobs = [];
    
    for (const jobData of sampleJobs) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          companyId: company.id,
          createdById: adminUser.id,
          status: 'open',
          postedDate: new Date(),
        },
      });
      createdJobs.push(job);
      console.log(`✅ Created job: ${job.title}`);
    }

    // Create enhanced candidates
    console.log('👥 Creating enhanced candidates...');
    const createdCandidates = [];
    
    for (const candidateData of sampleCandidates) {
      const candidate = await prisma.candidate.create({
        data: candidateData,
      });
      createdCandidates.push(candidate);
      console.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName}`);
    }

    // Create job market data
    console.log('📊 Creating job market data...');
    for (let i = 0; i < createdJobs.length; i++) {
      await prisma.jobMarketData.create({
        data: {
          jobId: createdJobs[i].id,
          ...sampleJobMarketData[i],
        },
      });
      console.log(`✅ Created market data for: ${createdJobs[i].title}`);
    }

    // Create candidate profiles
    console.log('🎯 Creating candidate profiles...');
    for (const candidate of createdCandidates) {
      await prisma.candidateProfile.create({
        data: {
          candidateId: candidate.id,
          skillsScore: 70 + Math.random() * 30,
          experienceScore: 60 + Math.random() * 40,
          educationScore: 65 + Math.random() * 35,
          locationFlexibility: Math.random(),
          salaryFlexibility: Math.random(),
          cultureScore: 70 + Math.random() * 30,
          performancePrediction: 0.7 + Math.random() * 0.3,
          retentionPrediction: 0.6 + Math.random() * 0.4,
          marketValue: candidate.expectedSalaryMin ? 
            candidate.expectedSalaryMin + Math.random() * 20000 : 
            100000 + Math.random() * 50000,
          demandScore: Math.random(),
          rarityScore: Math.random(),
          competitionLevel: Math.random(),
        },
      });
      console.log(`✅ Created profile for: ${candidate.firstName} ${candidate.lastName}`);
    }

    // Create some sample applications
    console.log('📝 Creating sample applications...');
    for (let i = 0; i < Math.min(createdJobs.length, createdCandidates.length); i++) {
      await prisma.application.create({
        data: {
          jobId: createdJobs[i].id,
          candidateId: createdCandidates[i].id,
          status: 'applied',
          submittedAt: new Date(),
          candidateInfo: JSON.stringify({
            firstName: createdCandidates[i].firstName,
            lastName: createdCandidates[i].lastName,
            email: createdCandidates[i].email,
          }),
          score: 70 + Math.floor(Math.random() * 30),
        },
      });
      console.log(`✅ Created application: ${createdCandidates[i].firstName} -> ${createdJobs[i].title}`);
    }

    console.log('🎉 ML data seeding completed successfully!');
    console.log(`📊 Created: ${createdJobs.length} jobs, ${createdCandidates.length} candidates`);

  } catch (error) {
    console.error('❌ Error seeding ML data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedMLData()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedMLData };
