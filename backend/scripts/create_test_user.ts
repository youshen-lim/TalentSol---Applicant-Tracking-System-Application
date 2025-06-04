import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('🔧 Creating Test User for Authentication...');
  
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@talentsol.com' }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      
      // Generate token for existing user
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
      const token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          companyId: existingUser.companyId,
        },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      console.log('\n🔑 Authentication Token:');
      console.log(token);
      console.log('\n💡 Use this token in your frontend localStorage:');
      console.log(`localStorage.setItem('authToken', '${token}');`);
      
      return;
    }
    
    // Check if company exists
    let company = await prisma.company.findFirst({
      where: { id: 'comp_1' }
    });
    
    if (!company) {
      console.log('📝 Creating test company...');
      company = await prisma.company.create({
        data: {
          id: 'comp_1',
          name: 'TalentSol Demo Company',
          domain: 'talentsol.com',
          settings: {
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD'
          }
        }
      });
      console.log('✅ Test company created');
    }
    
    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        id: 'user_test_1',
        email: 'test@talentsol.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        companyId: company.id,
      }
    });

    // Create user settings separately
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        browserNotifications: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC'
      }
    });
    
    console.log('✅ Test user created successfully');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Company: ${company.name}`);
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log('\n🔑 Authentication Token:');
    console.log(token);
    
    console.log('\n💡 To use this token in your frontend:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Run this command:');
    console.log(`   localStorage.setItem('authToken', '${token}');`);
    console.log('4. Refresh the Dashboard page');
    
    console.log('\n🎉 Test user setup completed!');
    console.log('📊 Your Dashboard metrics should now work properly');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
