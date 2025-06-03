import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Database Connection Checker and Auto-Fixer
 * Checks database connection and provides setup instructions
 */

async function checkDatabase() {
  console.log('🔍 Checking TalentSol database connection...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ` as Array<{ table_name: string }>;

    console.log(`📊 Found ${tables.length} tables in database`);

    if (tables.length === 0) {
      console.log('⚠️  No tables found. Database needs to be initialized.');
      return false;
    }

    // Check for required tables
    const requiredTables = ['candidates', 'applications', 'jobs', 'companies', 'users'];
    const existingTableNames = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));

    if (missingTables.length > 0) {
      console.log(`⚠️  Missing required tables: ${missingTables.join(', ')}`);
      return false;
    }

    // Check data counts
    const [candidateCount, applicationCount, jobCount] = await Promise.all([
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.job.count(),
    ]);

    console.log('\n📈 Data Summary:');
    console.log(`- Candidates: ${candidateCount}`);
    console.log(`- Applications: ${applicationCount}`);
    console.log(`- Jobs: ${jobCount}`);

    if (candidateCount === 0) {
      console.log('⚠️  No candidate data found. Database needs to be populated.');
      return false;
    }

    console.log('✅ Database is properly set up with data!');
    return true;

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n🔧 Database Connection Issue:');
        console.log('- PostgreSQL server is not running');
        console.log('- Start PostgreSQL service on your system');
        console.log('- Check if port 5432 is available');
      } else if (error.message.includes('authentication failed')) {
        console.log('\n🔧 Authentication Issue:');
        console.log('- Check DATABASE_URL in .env file');
        console.log('- Verify username and password');
        console.log('- Ensure database exists');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('\n🔧 Database Does Not Exist:');
        console.log('- Create the database first');
        console.log('- Run: createdb talentsol_ats');
      }
    }

    return false;
  }
}

async function provideDatabaseSetupInstructions() {
  console.log('\n🚀 Database Setup Instructions:');
  console.log('\n1. Install PostgreSQL:');
  console.log('   - macOS: brew install postgresql');
  console.log('   - Ubuntu: sudo apt install postgresql postgresql-contrib');
  console.log('   - Windows: Download from https://www.postgresql.org/download/');

  console.log('\n2. Start PostgreSQL service:');
  console.log('   - macOS: brew services start postgresql');
  console.log('   - Ubuntu: sudo systemctl start postgresql');
  console.log('   - Windows: Start from Services or pgAdmin');

  console.log('\n3. Create database and user:');
  console.log('   sudo -u postgres psql');
  console.log('   CREATE DATABASE talentsol_ats;');
  console.log('   CREATE USER talentsol_user WITH PASSWORD \'talentsol_password\';');
  console.log('   GRANT ALL PRIVILEGES ON DATABASE talentsol_ats TO talentsol_user;');
  console.log('   \\q');

  console.log('\n4. Update .env file:');
  console.log('   DATABASE_URL="postgresql://talentsol_user:talentsol_password@localhost:5432/talentsol_ats"');

  console.log('\n5. Initialize database:');
  console.log('   npm run db:push');
  console.log('   npm run setup-unified-data');
}

async function autoFixDatabase() {
  console.log('\n🔧 Attempting to auto-fix database setup...');

  try {
    // Check if .env file exists and has proper DATABASE_URL
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  .env file not found. Creating from template...');
      const envExamplePath = path.join(process.cwd(), '.env.example');
      
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from template');
      }
    }

    // Read current .env
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('username:password@localhost')) {
      console.log('⚠️  DATABASE_URL has placeholder credentials');
      
      // Update with proper credentials
      const updatedEnv = envContent.replace(
        'DATABASE_URL="postgresql://username:password@localhost:5432/talentsol_ats?schema=public"',
        'DATABASE_URL="postgresql://talentsol_user:talentsol_password@localhost:5432/talentsol_ats"'
      );
      
      fs.writeFileSync(envPath, updatedEnv);
      console.log('✅ Updated DATABASE_URL with proper credentials');
      console.log('⚠️  You still need to create the database and user (see instructions above)');
    }

  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
  }
}

// Main execution
async function main() {
  const isConnected = await checkDatabase();
  
  if (!isConnected) {
    await autoFixDatabase();
    await provideDatabaseSetupInstructions();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Follow the database setup instructions above');
    console.log('2. Run: npm run setup-unified-data');
    console.log('3. Start the backend: npm run dev');
    console.log('4. Check the dashboard for data');
    
    process.exit(1);
  } else {
    console.log('\n🎉 Database is ready! You can start the backend with: npm run dev');
  }
}

main()
  .catch((e) => {
    console.error('❌ Check failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
