const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    const candidateCount = await prisma.candidate.count();
    console.log(`🎯 Candidates in database: ${candidateCount}`);
    
    const applicationCount = await prisma.application.count();
    console.log(`📝 Applications in database: ${applicationCount}`);
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check your DATABASE_URL in .env file');
      console.log('3. Verify database exists and credentials are correct');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
