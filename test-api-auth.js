// Simple test script to verify API authentication
const fetch = require('node-fetch');

async function testApiAuth() {
  console.log('🧪 Testing API Authentication...');
  
  try {
    // Test without authentication
    console.log('\n1. Testing without authentication:');
    const response1 = await fetch('http://localhost:3001/api/applications/stats');
    console.log('Status:', response1.status);
    console.log('Response:', response1.status === 401 ? 'Unauthorized (expected)' : 'Unexpected response');
    
    // Test with demo token
    console.log('\n2. Testing with demo token:');
    const response2 = await fetch('http://localhost:3001/api/applications/stats', {
      headers: {
        'Authorization': 'Bearer demo-token-for-development'
      }
    });
    console.log('Status:', response2.status);
    
    if (response2.ok) {
      const data = await response2.json();
      console.log('✅ Success! Data received:');
      console.log('Total Applications:', data.totalApplications);
      console.log('New Applications:', data.newApplications);
      console.log('Conversion Rate:', data.conversionRate);
      console.log('Average Score:', data.averageScore);
      console.log('Recent Applications Count:', data.recentApplications?.length || 0);
      console.log('Source Stats Count:', data.sourceStats?.length || 0);
    } else {
      const errorText = await response2.text();
      console.log('❌ Error:', errorText);
    }
    
    // Test applications list endpoint
    console.log('\n3. Testing applications list endpoint:');
    const response3 = await fetch('http://localhost:3001/api/applications?limit=5', {
      headers: {
        'Authorization': 'Bearer demo-token-for-development'
      }
    });
    console.log('Status:', response3.status);
    
    if (response3.ok) {
      const data = await response3.json();
      console.log('✅ Applications list success!');
      console.log('Applications count:', data.applications?.length || 0);
      console.log('Total count:', data.total || 0);
    } else {
      const errorText = await response3.text();
      console.log('❌ Applications list error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiAuth();
