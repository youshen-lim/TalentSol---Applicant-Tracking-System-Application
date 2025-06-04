import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testApiEndpoints() {
  console.log('🔍 Testing API Endpoints...');
  
  try {
    // Test Dashboard Stats endpoint
    console.log('\n📊 Testing /analytics/dashboard...');
    const dashboardResponse = await fetch(`${API_BASE}/analytics/dashboard`);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API Response:');
      console.log(`   Total Candidates: ${dashboardData.summary?.totalCandidates || 'N/A'}`);
      console.log(`   Total Applications: ${dashboardData.summary?.totalApplications || 'N/A'}`);
      console.log(`   Time to Hire: ${dashboardData.timeToHire?.averageDays || 'N/A'} days`);
      console.log(`   Total Hires: ${dashboardData.timeToHire?.totalHires || 'N/A'}`);
    } else {
      console.log(`❌ Dashboard API failed: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
      const errorText = await dashboardResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Test Upcoming Interviews endpoint
    console.log('\n📅 Testing /interviews/upcoming...');
    const interviewsResponse = await fetch(`${API_BASE}/interviews/upcoming`);
    
    if (interviewsResponse.ok) {
      const interviewsData = await interviewsResponse.json();
      console.log('✅ Interviews API Response:');
      console.log(`   Upcoming Interviews: ${interviewsData.data?.length || 0}`);
      
      if (interviewsData.data && interviewsData.data.length > 0) {
        console.log('   📋 Sample interviews:');
        interviewsData.data.slice(0, 3).forEach((interview: any) => {
          console.log(`      ${interview.id}: ${interview.candidateName} - ${interview.dateTime}`);
        });
      }
    } else {
      console.log(`❌ Interviews API failed: ${interviewsResponse.status} ${interviewsResponse.statusText}`);
      const errorText = await interviewsResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Test Time to Hire endpoint specifically
    console.log('\n🕒 Testing /analytics/time-to-hire...');
    const timeToHireResponse = await fetch(`${API_BASE}/analytics/time-to-hire`);
    
    if (timeToHireResponse.ok) {
      const timeToHireData = await timeToHireResponse.json();
      console.log('✅ Time to Hire API Response:');
      console.log(`   Average Time to Hire: ${timeToHireData.averageTimeToHire || 'N/A'} days`);
      console.log(`   Total Hires: ${timeToHireData.totalHires || 'N/A'}`);
    } else {
      console.log(`❌ Time to Hire API failed: ${timeToHireResponse.status} ${timeToHireResponse.statusText}`);
      const errorText = await timeToHireResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
    console.log('\n💡 Make sure the backend server is running on port 3001');
    console.log('   Run: npm run dev');
  }
}

testApiEndpoints();
