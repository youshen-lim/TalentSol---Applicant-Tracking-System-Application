import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX3Rlc3RfMSIsImVtYWlsIjoidGVzdEB0YWxlbnRzb2wuY29tIiwicm9sZSI6ImFkbWluIiwiY29tcGFueUlkIjoiY29tcF8xIiwiaWF0IjoxNzQ4OTgwOTM1LCJleHAiOjE3NDk1ODU3MzV9.OeawUrwpxzEb9DwAaIu_tN4dSh3iTL9a-C0AUO9gxEc';

async function testDashboardAPI() {
  console.log('🔍 Testing Dashboard API to see actual growth calculation...');
  
  try {
    // Test Dashboard Stats endpoint
    console.log('\n📊 Testing /analytics/dashboard...');
    const dashboardResponse = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API Response:');
      console.log(`   Total Candidates: ${dashboardData.summary?.totalCandidates || 'N/A'}`);
      console.log(`   Total Applications: ${dashboardData.summary?.totalApplications || 'N/A'}`);
      
      if (dashboardData.changeMetrics?.totalCandidates) {
        const change = dashboardData.changeMetrics.totalCandidates;
        console.log(`\n📈 Change Metrics for Total Candidates:`);
        console.log(`   Current: ${change.current || 'N/A'}`);
        console.log(`   Previous: ${change.previous || 'N/A'}`);
        console.log(`   Change: ${change.change || 'N/A'}%`);
        
        if (change.current && change.previous) {
          const calculatedChange = Math.round(((change.current - change.previous) / change.previous) * 100);
          console.log(`   Manual calculation: ((${change.current} - ${change.previous}) / ${change.previous}) * 100 = ${calculatedChange}%`);
        }
      }
      
      // Show the raw response structure
      console.log(`\n🔍 Raw changeMetrics structure:`);
      console.log(JSON.stringify(dashboardData.changeMetrics, null, 2));
      
    } else {
      console.log(`❌ Dashboard API failed: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
      const errorText = await dashboardResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
    // Test Change Metrics endpoint specifically
    console.log('\n📊 Testing /analytics/changes...');
    const changesResponse = await fetch(`${API_BASE}/analytics/changes`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (changesResponse.ok) {
      const changesData = await changesResponse.json();
      console.log('✅ Changes API Response:');
      console.log(JSON.stringify(changesData, null, 2));
    } else {
      console.log(`❌ Changes API failed: ${changesResponse.status} ${changesResponse.statusText}`);
      const errorText = await changesResponse.text();
      console.log(`   Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
    console.log('\n💡 Make sure the backend server is running on port 3001');
  }
}

testDashboardAPI();
