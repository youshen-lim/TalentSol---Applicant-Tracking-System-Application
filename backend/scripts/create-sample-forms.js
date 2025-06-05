const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleForms() {
  try {
    console.log('🔧 Creating sample application forms...');

    // Get existing jobs to attach forms to
    const jobs = await prisma.job.findMany({
      where: {
        companyId: 'comp_1'
      },
      take: 3
    });

    if (jobs.length === 0) {
      console.log('❌ No jobs found for company comp_1');
      return;
    }

    // Get admin user to set as creator
    const adminUser = await prisma.user.findFirst({
      where: {
        companyId: 'comp_1',
        role: 'admin'
      }
    });

    if (!adminUser) {
      console.log('❌ No admin user found for company comp_1');
      return;
    }

    // Sample form sections
    const basicSections = JSON.stringify([
      {
        id: 'personal_info',
        title: 'Personal Information',
        fields: [
          { id: 'firstName', type: 'TEXT', label: 'First Name', required: true },
          { id: 'lastName', type: 'TEXT', label: 'Last Name', required: true },
          { id: 'email', type: 'EMAIL', label: 'Email Address', required: true },
          { id: 'phone', type: 'PHONE', label: 'Phone Number', required: true }
        ]
      },
      {
        id: 'experience',
        title: 'Experience',
        fields: [
          { id: 'resume', type: 'FILE', label: 'Resume', required: true },
          { id: 'coverLetter', type: 'TEXTAREA', label: 'Cover Letter', required: false },
          { id: 'experience', type: 'SELECT', label: 'Years of Experience', required: true, options: [
            { value: '0-1', label: '0-1 years' },
            { value: '2-5', label: '2-5 years' },
            { value: '5+', label: '5+ years' }
          ]}
        ]
      }
    ]);

    const settings = JSON.stringify({
      allowSave: true,
      autoSave: true,
      showProgress: true,
      multiStep: false,
      requireLogin: false,
      gdprCompliance: true,
      eeocQuestions: false
    });

    const emailSettings = JSON.stringify({
      confirmationTemplate: 'default',
      autoResponse: true,
      redirectUrl: 'https://talentsol.com/thank-you'
    });

    // Create forms for each job
    const formsData = [
      {
        jobId: jobs[0].id,
        title: `${jobs[0].title} Application Form`,
        description: `Apply for the ${jobs[0].title} position at our company.`,
        sections: basicSections,
        settings,
        emailSettings,
        status: 'live',
        createdById: adminUser.id,
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 500) + 100,
        submissionCount: Math.floor(Math.random() * 50) + 10
      },
      {
        jobId: jobs[1].id,
        title: `${jobs[1].title} Application Form`,
        description: `Apply for the ${jobs[1].title} position at our company.`,
        sections: basicSections,
        settings,
        emailSettings,
        status: 'live',
        createdById: adminUser.id,
        publishedAt: new Date(),
        viewCount: Math.floor(Math.random() * 300) + 50,
        submissionCount: Math.floor(Math.random() * 30) + 5
      },
      {
        jobId: jobs[2].id,
        title: `${jobs[2].title} Application Form`,
        description: `Apply for the ${jobs[2].title} position at our company.`,
        sections: basicSections,
        settings,
        emailSettings,
        status: 'draft',
        createdById: adminUser.id,
        viewCount: 0,
        submissionCount: 0
      }
    ];

    // Insert forms
    for (const formData of formsData) {
      try {
        const form = await prisma.applicationFormSchema.create({
          data: formData,
          include: {
            job: {
              select: {
                title: true,
                status: true
              }
            }
          }
        });
        console.log(`✅ Created form: ${form.title} for job: ${form.job.title}`);
      } catch (error) {
        console.log(`❌ Failed to create form for job ${formData.jobId}:`, error.message);
      }
    }

    console.log('🎉 Sample forms creation completed!');

  } catch (error) {
    console.error('❌ Error creating sample forms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleForms();
