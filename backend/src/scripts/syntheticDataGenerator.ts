import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Comprehensive Synthetic Data Generator for TalentSol ATS
 * Generates realistic candidate-centric data in batches
 */

// Data Templates and Generators
const FIRST_NAMES = [
  'Sarah', 'Marcus', 'Emily', 'David', 'Jessica', 'Alex', 'Priya', 'Michael',
  'Jennifer', 'Robert', 'Lisa', 'James', 'Maria', 'John', 'Ashley', 'Christopher',
  'Amanda', 'Daniel', 'Michelle', 'Matthew', 'Stephanie', 'Anthony', 'Nicole',
  'Kevin', 'Elizabeth', 'Brian', 'Helen', 'Ryan', 'Samantha', 'Jason'
];

const LAST_NAMES = [
  'Chen', 'Johnson', 'Rodriguez', 'Kim', 'Thompson', 'Rivera', 'Patel', 'Brown',
  'Smith', 'Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Lee',
  'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen'
];

const COMPANIES = [
  'TechCorp', 'StartupXYZ', 'DesignStudio', 'CloudTech', 'Analytics Inc',
  'WebSolutions', 'GrowthCorp', 'SalesPro', 'DataDriven', 'InnovateLab',
  'DigitalFirst', 'ScaleUp', 'NextGen', 'FutureTech', 'SmartSystems',
  'GlobalTech', 'AgileWorks', 'CodeCraft', 'PixelPerfect', 'CloudNine'
];

const JOB_TITLES = [
  'Senior Frontend Developer',
  'Product Manager',
  'UX/UI Designer'
];

const SKILLS_BY_ROLE = {
  'Frontend': ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Sass', 'Webpack'],
  'Backend': ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
  'DevOps': ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'CI/CD'],
  'Data': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Tableau', 'Power BI'],
  'Design': ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing'],
  'Product': ['Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'Analytics', 'A/B Testing'],
  'Marketing': ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Email Marketing', 'Analytics'],
  'Sales': ['B2B Sales', 'CRM', 'Lead Generation', 'Negotiation', 'Account Management', 'Prospecting']
};

const LOCATIONS = [
  { city: 'San Francisco', state: 'CA', country: 'USA', remote: true },
  { city: 'New York', state: 'NY', country: 'USA', remote: false },
  { city: 'Austin', state: 'TX', country: 'USA', remote: true },
  { city: 'Seattle', state: 'WA', country: 'USA', remote: true },
  { city: 'Chicago', state: 'IL', country: 'USA', remote: false },
  { city: 'Denver', state: 'CO', country: 'USA', remote: true },
  { city: 'Los Angeles', state: 'CA', country: 'USA', remote: false },
  { city: 'Boston', state: 'MA', country: 'USA', remote: true },
  { city: 'Miami', state: 'FL', country: 'USA', remote: false },
  { city: 'Portland', state: 'OR', country: 'USA', remote: true }
];

const APPLICATION_STATUSES = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
const SOURCES = ['linkedin', 'indeed', 'company_website', 'referral', 'glassdoor', 'angellist', 'stackoverflow'];
const INTERVIEW_TYPES = ['phone_screen', 'technical', 'behavioral', 'panel', 'final', 'cultural_fit'];

interface BatchConfig {
  candidatesPerBatch: number;
  applicationsPerCandidate: { min: number; max: number };
  interviewProbability: number;
  hireProbability: number;
  timeRangeMonths: number;
}

class SyntheticDataGenerator {
  private batchSize: number;
  private totalBatches: number;
  private currentBatch: number = 0;

  constructor(batchSize: number = 10, totalBatches: number = 5) {
    this.batchSize = batchSize;
    this.totalBatches = totalBatches;
  }

  async generateAllData() {
    console.log('🚀 Starting comprehensive synthetic data generation...');
    console.log(`📊 Configuration: ${this.totalBatches} batches × ${this.batchSize} candidates = ${this.totalBatches * this.batchSize} total candidates`);

    try {
      // Step 1: Setup base data
      await this.setupBaseData();

      // Step 2: Generate candidate batches
      for (let batch = 1; batch <= this.totalBatches; batch++) {
        this.currentBatch = batch;
        await this.generateCandidateBatch(batch);
        
        // Progress indicator
        const progress = Math.round((batch / this.totalBatches) * 100);
        console.log(`📈 Progress: ${progress}% (Batch ${batch}/${this.totalBatches})`);
        
        // Small delay between batches to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Step 3: Generate additional data
      await this.generateNotifications();
      await this.generateDocuments();
      await this.generateMLData();

      // Step 4: Verify data integrity
      await this.verifyDataIntegrity();

      console.log('🎉 Comprehensive synthetic data generation completed!');

    } catch (error) {
      console.error('❌ Data generation failed:', error);
      throw error;
    }
  }

  private async setupBaseData() {
    console.log('🏗️ Setting up base data (companies, users, jobs)...');

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

    // Create admin and recruiter users
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

    const recruiterUser = await prisma.user.upsert({
      where: { email: 'recruiter@talentsol-demo.com' },
      update: {},
      create: {
        email: 'recruiter@talentsol-demo.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Recruiter',
        role: 'recruiter',
        companyId: company.id,
      },
    });

    // Create diverse job openings
    const existingJobs = await prisma.job.count({ where: { companyId: company.id } });
    
    if (existingJobs < 20) {
      const jobsToCreate = JOB_TITLES.map(title => ({
        title,
        department: this.getDepartmentForTitle(title),
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        employmentType: Math.random() > 0.8 ? 'contract' : 'full_time',
        experienceLevel: this.getRandomExperienceLevel(),
        salary: this.generateSalaryRange(title),
        description: `We are seeking a talented ${title} to join our growing team. This role offers exciting opportunities to work on cutting-edge projects.`,
        responsibilities: this.generateResponsibilities(title),
        requiredQualifications: this.generateQualifications(title, true),
        preferredQualifications: this.generateQualifications(title, false),
        skills: this.getSkillsForTitle(title),
        status: Math.random() > 0.1 ? 'open' : 'closed',
        companyId: company.id,
        createdById: Math.random() > 0.5 ? adminUser.id : recruiterUser.id,
      }));

      await prisma.job.createMany({ data: jobsToCreate });
      console.log(`✅ Created ${jobsToCreate.length} job openings`);
    }

    return { company, adminUser, recruiterUser };
  }

  private async generateCandidateBatch(batchNumber: number) {
    console.log(`👥 Generating candidate batch ${batchNumber}/${this.totalBatches}...`);

    const { company } = await this.setupBaseData();
    const jobs = await prisma.job.findMany({ where: { companyId: company.id } });

    const batchConfig: BatchConfig = {
      candidatesPerBatch: this.batchSize,
      applicationsPerCandidate: { min: 1, max: 1 }, // Exactly 1 application per candidate
      interviewProbability: 0.2, // 20% chance for interviews (to get ~10 interviews)
      hireProbability: 0.1,
      timeRangeMonths: 6,
    };

    const candidates = [];
    
    for (let i = 0; i < batchConfig.candidatesPerBatch; i++) {
      const candidateData = this.generateCandidateProfile(batchNumber, i);
      
      // Create candidate
      const candidate = await prisma.candidate.create({
        data: candidateData,
      });

      candidates.push(candidate);

      // Generate applications for this candidate
      const numApplications = Math.floor(
        Math.random() * (batchConfig.applicationsPerCandidate.max - batchConfig.applicationsPerCandidate.min + 1)
      ) + batchConfig.applicationsPerCandidate.min;

      const selectedJobs = this.shuffleArray([...jobs]).slice(0, numApplications);

      for (const job of selectedJobs) {
        await this.generateApplicationWithTimeline(
          candidate,
          job,
          batchConfig
        );
      }
    }

    console.log(`✅ Batch ${batchNumber}: Created ${candidates.length} candidates with applications`);
  }

  private generateCandidateProfile(batchNumber: number, index: number) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    return {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${batchNumber}.${index}@email.com`,
      phone: `+1-555-${String(batchNumber).padStart(2, '0')}${String(index).padStart(2, '0')}`,
      location,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${batchNumber}`,
      portfolioUrl: Math.random() > 0.7 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev` : null,
      willingToRelocate: Math.random() > 0.4,
      workAuthorization: this.getRandomWorkAuth(),
      createdAt: this.getRandomDateInRange(12), // Last 12 months
    };
  }

  private async generateApplicationWithTimeline(candidate: any, job: any, config: BatchConfig) {
    const submittedDate = this.getRandomDateInRange(config.timeRangeMonths);
    const status = this.getWeightedApplicationStatus();
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

    // Calculate progression dates
    const statusDates = this.calculateStatusProgression(submittedDate, status);

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        status: status as any,
        submittedAt: submittedDate,
        hiredAt: statusDates.hiredAt,
        candidateInfo: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
        },
        professionalInfo: this.generateProfessionalInfo(job.title),
        metadata: {
          source: source as any,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          formVersion: '2.0',
          completionTime: 300 + Math.random() * 1200,
          gdprConsent: true,
          marketingConsent: Math.random() > 0.3,
        },
        scoring: this.generateScoringData(job.skills),
        activity: this.generateActivityTimeline(submittedDate, status, candidate),
      },
    });

    // Generate interviews if application progressed
    if (['interview', 'assessment', 'offer', 'hired'].includes(status) && Math.random() < config.interviewProbability) {
      await this.generateInterviewsForApplication(application, statusDates);
    }

    return application;
  }

  private async generateInterviewsForApplication(application: any, statusDates: any) {
    const numInterviews = Math.floor(Math.random() * 3) + 1; // 1-3 interviews
    const interviewTypes = this.shuffleArray([...INTERVIEW_TYPES]).slice(0, numInterviews);

    for (let i = 0; i < interviewTypes.length; i++) {
      const interviewDate = new Date(
        application.submittedAt.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000 + Math.random() * 7 * 24 * 60 * 60 * 1000
      );

      await prisma.interview.create({
        data: {
          applicationId: application.id,
          type: interviewTypes[i],
          scheduledAt: interviewDate,
          duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
          location: Math.random() > 0.6 ? 'Video Call' : 'Office',
          status: this.getInterviewStatus(application.status),
          notes: `${interviewTypes[i]} interview with ${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`,
          feedback: this.generateInterviewFeedback(),
          createdById: (await prisma.user.findFirst())!.id,
        },
      });
    }
  }

  // Helper methods for data generation
  private getDepartmentForTitle(title: string): string {
    if (title.includes('Developer') || title.includes('Engineer') || title.includes('QA')) return 'Engineering';
    if (title.includes('Designer') || title.includes('UX')) return 'Design';
    if (title.includes('Product')) return 'Product';
    if (title.includes('Marketing') || title.includes('Content')) return 'Marketing';
    if (title.includes('Sales') || title.includes('Business Development')) return 'Sales';
    if (title.includes('Data') || title.includes('Machine Learning')) return 'Data Science';
    return 'General';
  }

  private getSkillsForTitle(title: string): string[] {
    if (title.includes('Frontend') || title.includes('React')) return SKILLS_BY_ROLE.Frontend;
    if (title.includes('Backend') || title.includes('API')) return SKILLS_BY_ROLE.Backend;
    if (title.includes('DevOps') || title.includes('Infrastructure')) return SKILLS_BY_ROLE.DevOps;
    if (title.includes('Data') || title.includes('ML')) return SKILLS_BY_ROLE.Data;
    if (title.includes('Designer') || title.includes('UX')) return SKILLS_BY_ROLE.Design;
    if (title.includes('Product')) return SKILLS_BY_ROLE.Product;
    if (title.includes('Marketing')) return SKILLS_BY_ROLE.Marketing;
    if (title.includes('Sales')) return SKILLS_BY_ROLE.Sales;
    return ['Communication', 'Problem Solving', 'Teamwork'];
  }

  private getRandomDateInRange(months: number): Date {
    const now = new Date();
    const pastDate = new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
    return new Date(pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()));
  }

  private getWeightedApplicationStatus(): string {
    const weights = {
      'applied': 0.25,
      'screening': 0.20,
      'interview': 0.20,
      'assessment': 0.15,
      'offer': 0.08,
      'hired': 0.07,
      'rejected': 0.05
    };

    const random = Math.random();
    let cumulative = 0;

    for (const [status, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) return status;
    }

    return 'applied';
  }

  private calculateStatusProgression(submittedDate: Date, finalStatus: string) {
    const statusOrder = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired'];
    const finalIndex = statusOrder.indexOf(finalStatus);
    
    let hiredAt = null;
    if (finalStatus === 'hired') {
      // 1-45 days from application to hire
      hiredAt = new Date(submittedDate.getTime() + (Math.random() * 45 + 1) * 24 * 60 * 60 * 1000);
    }

    return { hiredAt };
  }

  private generateProfessionalInfo(jobTitle: string) {
    const currentCompany = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    const experienceLevels = ['1-3', '3-5', '5-10', '10+'];
    
    return {
      currentTitle: this.generateSimilarTitle(jobTitle),
      currentCompany,
      experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
      expectedSalary: this.generateSalaryExpectation(),
      noticePeriod: ['2 weeks', '1 month', '2 months'][Math.floor(Math.random() * 3)],
      remoteWork: Math.random() > 0.4,
    };
  }

  private generateScoringData(jobSkills: string[]) {
    const candidateSkills = this.shuffleArray([...jobSkills]).slice(0, Math.floor(Math.random() * jobSkills.length) + 1);
    
    return {
      automaticScore: 60 + Math.random() * 40,
      skillMatches: candidateSkills,
      qualificationsMet: Math.random() > 0.3,
      experienceMatch: 70 + Math.random() * 30,
      salaryMatch: 80 + Math.random() * 20,
      locationMatch: 85 + Math.random() * 15,
      flags: Math.random() > 0.9 ? ['incomplete_profile'] : [],
    };
  }

  private generateActivityTimeline(submittedDate: Date, status: string, candidate: any) {
    const activities = [{
      type: 'application_submitted',
      timestamp: submittedDate.toISOString(),
      description: `${candidate.firstName} ${candidate.lastName} submitted application`,
    }];

    if (status !== 'applied') {
      activities.push({
        type: 'status_changed',
        timestamp: new Date(submittedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Status changed to ${status}`,
      });
    }

    return activities;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRandomExperienceLevel(): string {
    const levels = ['entry', 'mid', 'senior', 'lead'];
    const weights = [0.2, 0.4, 0.3, 0.1];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < levels.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return levels[i];
    }
    return 'mid';
  }

  private generateSalaryRange(title: string) {
    const baseSalaries: Record<string, { min: number; max: number }> = {
      'Senior Frontend Developer': { min: 120000, max: 160000 },
      'Backend Engineer': { min: 110000, max: 150000 },
      'DevOps Engineer': { min: 130000, max: 170000 },
      'Data Scientist': { min: 125000, max: 165000 },
      'Product Manager': { min: 140000, max: 180000 },
      'Product Designer': { min: 100000, max: 140000 },
      'Marketing Manager': { min: 90000, max: 130000 },
      'Sales Representative': { min: 60000, max: 100000 },
    };

    const defaultRange = { min: 80000, max: 120000 };
    const range = baseSalaries[title] || defaultRange;

    return {
      min: range.min,
      max: range.max,
      currency: 'USD',
      negotiable: Math.random() > 0.3,
    };
  }

  private generateSalaryExpectation() {
    const base = 80000 + Math.random() * 100000;
    return {
      min: Math.round(base),
      max: Math.round(base * 1.2),
      currency: 'USD',
      negotiable: Math.random() > 0.4,
    };
  }

  private generateResponsibilities(title: string): string[] {
    const commonResponsibilities = [
      `Lead ${title.toLowerCase()} initiatives and projects`,
      'Collaborate with cross-functional teams',
      'Mentor junior team members',
      'Participate in code/design reviews',
      'Contribute to technical documentation',
    ];

    const specificResponsibilities: Record<string, string[]> = {
      'Frontend': ['Develop responsive web applications', 'Optimize application performance', 'Implement UI/UX designs'],
      'Backend': ['Design and implement APIs', 'Optimize database queries', 'Ensure system scalability'],
      'DevOps': ['Manage CI/CD pipelines', 'Monitor system performance', 'Implement security best practices'],
      'Data': ['Analyze large datasets', 'Build predictive models', 'Create data visualizations'],
      'Design': ['Create user-centered designs', 'Conduct user research', 'Develop design systems'],
      'Product': ['Define product roadmap', 'Gather user requirements', 'Analyze product metrics'],
      'Marketing': ['Develop marketing strategies', 'Create content campaigns', 'Analyze campaign performance'],
      'Sales': ['Generate new business opportunities', 'Manage client relationships', 'Meet sales targets'],
    };

    const category = this.getCategoryFromTitle(title);
    const specific = specificResponsibilities[category] || [];

    return [...commonResponsibilities.slice(0, 3), ...specific.slice(0, 2)];
  }

  private generateQualifications(title: string, required: boolean): string[] {
    const baseQualifications = [
      "Bachelor's degree in relevant field",
      `${required ? '3+' : '5+'} years of professional experience`,
      'Strong communication skills',
      'Experience working in agile environments',
    ];

    const specificQualifications: Record<string, string[]> = {
      'Frontend': ['Proficiency in React/Vue/Angular', 'Experience with modern JavaScript', 'Knowledge of responsive design'],
      'Backend': ['Experience with server-side languages', 'Database design knowledge', 'API development experience'],
      'DevOps': ['Cloud platform experience (AWS/Azure/GCP)', 'Container orchestration knowledge', 'Infrastructure as code'],
      'Data': ['Statistical analysis experience', 'Machine learning knowledge', 'Programming skills in Python/R'],
      'Design': ['Proficiency in design tools', 'User research experience', 'Portfolio of design work'],
      'Product': ['Product management experience', 'Analytics and data-driven decision making', 'Stakeholder management'],
      'Marketing': ['Digital marketing experience', 'Content creation skills', 'Marketing analytics knowledge'],
      'Sales': ['B2B sales experience', 'CRM software proficiency', 'Negotiation skills'],
    };

    const category = this.getCategoryFromTitle(title);
    const specific = specificQualifications[category] || [];

    return [...baseQualifications.slice(0, required ? 2 : 1), ...specific.slice(0, required ? 2 : 3)];
  }

  private getCategoryFromTitle(title: string): string {
    if (title.includes('Frontend') || title.includes('React')) return 'Frontend';
    if (title.includes('Backend') || title.includes('API')) return 'Backend';
    if (title.includes('DevOps')) return 'DevOps';
    if (title.includes('Data') || title.includes('ML')) return 'Data';
    if (title.includes('Designer') || title.includes('UX')) return 'Design';
    if (title.includes('Product')) return 'Product';
    if (title.includes('Marketing')) return 'Marketing';
    if (title.includes('Sales')) return 'Sales';
    return 'General';
  }

  private generateSimilarTitle(jobTitle: string): string {
    const variations: Record<string, string[]> = {
      'Senior Frontend Developer': ['Frontend Developer', 'React Developer', 'JavaScript Developer'],
      'Backend Engineer': ['Software Engineer', 'API Developer', 'Server Developer'],
      'DevOps Engineer': ['Site Reliability Engineer', 'Infrastructure Engineer', 'Cloud Engineer'],
      'Data Scientist': ['Data Analyst', 'ML Engineer', 'Research Scientist'],
      'Product Manager': ['Associate Product Manager', 'Product Owner', 'Strategy Manager'],
      'Product Designer': ['UX Designer', 'UI Designer', 'Visual Designer'],
      'Marketing Manager': ['Digital Marketing Manager', 'Growth Manager', 'Brand Manager'],
      'Sales Representative': ['Account Executive', 'Business Development Rep', 'Sales Associate'],
    };

    const options = variations[jobTitle] || [jobTitle];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getRandomWorkAuth(): string {
    const options = ['authorized', 'visa_required', 'citizen', 'permanent_resident'];
    const weights = [0.7, 0.1, 0.15, 0.05];
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < options.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return options[i];
    }
    return 'authorized';
  }

  private getInterviewStatus(applicationStatus: string): string {
    if (['hired', 'offer'].includes(applicationStatus)) return 'completed';
    if (applicationStatus === 'rejected') return Math.random() > 0.5 ? 'completed' : 'cancelled';
    return Math.random() > 0.2 ? 'scheduled' : 'completed';
  }

  private generateInterviewFeedback() {
    const positiveComments = [
      'Strong technical skills and good communication',
      'Excellent problem-solving approach',
      'Great cultural fit for the team',
      'Impressive portfolio and experience',
      'Clear thinking and good questions',
    ];

    const neutralComments = [
      'Solid candidate with room for growth',
      'Good technical foundation, needs more experience',
      'Decent interview, some areas for improvement',
      'Average performance, meets basic requirements',
    ];

    const negativeComments = [
      'Technical skills below requirements',
      'Communication needs improvement',
      'Not a good fit for current role',
      'Lacks required experience level',
    ];

    const random = Math.random();
    if (random < 0.6) return positiveComments[Math.floor(Math.random() * positiveComments.length)];
    if (random < 0.85) return neutralComments[Math.floor(Math.random() * neutralComments.length)];
    return negativeComments[Math.floor(Math.random() * negativeComments.length)];
  }

  private async generateNotifications() {
    console.log('🔔 Generating notifications...');

    const applications = await prisma.application.findMany({
      include: { candidate: true, job: true },
      take: 50,
      orderBy: { submittedAt: 'desc' }
    });

    const users = await prisma.user.findMany();

    for (const app of applications.slice(0, 20)) {
      await prisma.notification.create({
        data: {
          userId: users[Math.floor(Math.random() * users.length)].id,
          type: 'application_received',
          title: 'New Application Received',
          message: `${app.candidate.firstName} ${app.candidate.lastName} applied for ${app.job.title}`,
          data: {
            applicationId: app.id,
            candidateId: app.candidateId,
            jobId: app.jobId,
          },
          read: Math.random() > 0.3,
          createdAt: app.submittedAt,
        },
      });
    }

    console.log('✅ Generated notifications');
  }

  private async generateDocuments() {
    console.log('📄 Generating documents...');

    const applications = await prisma.application.findMany({ take: 100 });

    for (const app of applications.slice(0, 50)) {
      if (Math.random() > 0.3) { // 70% chance of having documents
        await prisma.document.create({
          data: {
            applicationId: app.id,
            filename: `resume_${app.candidateId}.pdf`,
            fileType: 'application/pdf',
            fileSize: Math.floor(Math.random() * 2000000) + 500000, // 0.5-2.5MB
            fileUrl: `/uploads/resumes/resume_${app.candidateId}.pdf`,
            documentType: 'resume',
          },
        });

        if (Math.random() > 0.6) { // 40% chance of cover letter
          await prisma.document.create({
            data: {
              applicationId: app.id,
              filename: `cover_letter_${app.candidateId}.pdf`,
              fileType: 'application/pdf',
              fileSize: Math.floor(Math.random() * 500000) + 100000, // 0.1-0.6MB
              fileUrl: `/uploads/cover_letters/cover_letter_${app.candidateId}.pdf`,
              documentType: 'cover_letter',
            },
          });
        }
      }
    }

    console.log('✅ Generated documents');
  }

  private async generateMLData() {
    console.log('🤖 Generating ML predictions...');

    const mlModel = await prisma.mLModel.findFirst();
    if (!mlModel) return;

    const applications = await prisma.application.findMany({ take: 100 });

    for (const app of applications.slice(0, 30)) {
      await prisma.mLPrediction.create({
        data: {
          modelId: mlModel.id,
          applicationId: app.id,
          predictionType: 'priority_score',
          inputFeatures: {
            experience_years: Math.floor(Math.random() * 10) + 1,
            skills_match: Math.random(),
            education_level: Math.floor(Math.random() * 4) + 1,
            location_match: Math.random(),
          },
          prediction: {
            score: Math.random() * 100,
            priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          },
          confidence: 0.7 + Math.random() * 0.3,
          explanation: {
            top_features: ['experience_match', 'skills_alignment', 'education_level'],
            feature_importance: [0.4, 0.35, 0.25],
          },
        },
      });
    }

    console.log('✅ Generated ML predictions');
  }

  private async verifyDataIntegrity() {
    console.log('🔍 Verifying data integrity...');

    const counts = await Promise.all([
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.job.count(),
      prisma.notification.count(),
      prisma.document.count(),
      prisma.mLPrediction.count(),
    ]);

    const [candidates, applications, interviews, jobs, notifications, documents, predictions] = counts;

    console.log('\n📊 Final Data Summary:');
    console.log(`👥 Candidates: ${candidates} (Primary entities)`);
    console.log(`📝 Applications: ${applications} (Linked to candidates)`);
    console.log(`🎯 Interviews: ${interviews} (Linked via applications)`);
    console.log(`💼 Jobs: ${jobs} (Referenced by applications)`);
    console.log(`🔔 Notifications: ${notifications}`);
    console.log(`📄 Documents: ${documents}`);
    console.log(`🤖 ML Predictions: ${predictions}`);

    // Verify candidate-centric relationships
    const candidatesWithApps = await prisma.candidate.count({
      where: { applications: { some: {} } }
    });

    console.log(`\n✅ Data Integrity Check:`);
    console.log(`- Candidates with applications: ${candidatesWithApps}/${candidates} (${Math.round(candidatesWithApps/candidates*100)}%)`);
    console.log(`- Average applications per candidate: ${Math.round(applications/candidates*10)/10}`);
    console.log(`- Interview rate: ${Math.round(interviews/applications*100)}%`);

    if (candidatesWithApps === candidates) {
      console.log('✅ All candidates have applications - data integrity verified!');
    } else {
      console.log('⚠️  Some candidates missing applications - check data generation');
    }
  }
}

// Export and execution
export { SyntheticDataGenerator };

// Script execution
async function runSyntheticDataGeneration() {
  const generator = new SyntheticDataGenerator(10, 5); // 10 candidates × 5 batches = 50 total

  try {
    await generator.generateAllData();
    console.log('\n🎉 Synthetic data generation completed successfully!');
    console.log('🚀 You can now start the backend and see data in the dashboard!');
  } catch (error) {
    console.error('❌ Synthetic data generation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSyntheticDataGeneration();
}
