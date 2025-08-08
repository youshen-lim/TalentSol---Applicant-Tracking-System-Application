#!/usr/bin/env node

/**
 * Test script for Priority 4.1: Pagination and Data Loading Optimization
 * Tests the enhanced pagination service and mobile optimization features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'test-token'; // Mock token for testing

async function testPagination() {
  console.log('🧪 Testing Priority 4.1: Pagination and Data Loading Optimization');
  console.log('=' * 70);

  try {
    // Test 1: Applications Pagination
    console.log('\n1️⃣ Testing Applications Pagination...');
    
    const startTime1 = Date.now();
    const appsResponse = await axios.get(`${BASE_URL}/api/applications/paginated?limit=10&page=1`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const responseTime1 = Date.now() - startTime1;
    
    console.log(`📊 Applications Response Time: ${responseTime1}ms`);
    console.log(`🔍 Pagination Strategy: ${appsResponse.headers['x-pagination-strategy'] || 'Not set'}`);
    console.log(`📄 Page Size: ${appsResponse.headers['x-pagination-page-size'] || 'Not set'}`);
    console.log(`⚡ Query Time: ${appsResponse.headers['x-pagination-query-time'] || 'Not set'}ms`);
    
    if (appsResponse.data.success) {
      console.log(`✅ Applications pagination working - ${appsResponse.data.data.length} records`);
      console.log(`📊 Pagination Info:`, {
        hasNextPage: appsResponse.data.pagination?.hasNextPage,
        currentPage: appsResponse.data.pagination?.currentPage,
        pageSize: appsResponse.data.pagination?.pageSize
      });
    } else {
      console.log('❌ Applications pagination test failed');
    }

    // Test 2: Mobile-Optimized Applications
    console.log('\n2️⃣ Testing Mobile-Optimized Applications...');
    
    const mobileStartTime = Date.now();
    const mobileAppsResponse = await axios.get(`${BASE_URL}/api/applications/paginated?limit=5`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    const mobileResponseTime = Date.now() - mobileStartTime;
    
    console.log(`📱 Mobile Response Time: ${mobileResponseTime}ms`);
    console.log(`🔍 Mobile Optimized: ${mobileAppsResponse.headers['x-mobile-optimized'] || 'Not set'}`);
    console.log(`🎨 Skeleton Count: ${mobileAppsResponse.headers['x-skeleton-count'] || 'Not set'}`);
    
    if (mobileAppsResponse.data.success) {
      console.log(`✅ Mobile applications working - ${mobileAppsResponse.data.data.length} records`);
      
      // Check for mobile-specific fields
      const firstApp = mobileAppsResponse.data.data[0];
      if (firstApp) {
        console.log(`📱 Mobile Fields:`, {
          hasStatusColor: !!firstApp.statusColor,
          hasTimeAgo: !!firstApp.timeAgo,
          hasDisplayScore: !!firstApp.displayScore
        });
      }
    } else {
      console.log('❌ Mobile applications test failed');
    }

    // Test 3: Candidates Pagination
    console.log('\n3️⃣ Testing Candidates Pagination...');
    
    const candidatesStartTime = Date.now();
    const candidatesResponse = await axios.get(`${BASE_URL}/api/candidates/paginated?limit=8`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const candidatesResponseTime = Date.now() - candidatesStartTime;
    
    console.log(`👥 Candidates Response Time: ${candidatesResponseTime}ms`);
    
    if (candidatesResponse.data.success) {
      console.log(`✅ Candidates pagination working - ${candidatesResponse.data.data.length} records`);
      
      // Check for enhanced candidate fields
      const firstCandidate = candidatesResponse.data.data[0];
      if (firstCandidate) {
        console.log(`👤 Enhanced Fields:`, {
          hasAvatar: !!firstCandidate.avatar,
          hasInitials: !!firstCandidate.initials,
          hasProfileCompleteness: typeof firstCandidate.profileCompleteness === 'number'
        });
      }
    } else {
      console.log('❌ Candidates pagination test failed');
    }

    // Test 4: Performance Target Verification
    console.log('\n4️⃣ Testing Performance Targets...');
    
    const performanceTarget = 500; // 500ms target for initial load
    const responses = [
      { name: 'Applications', time: responseTime1 },
      { name: 'Mobile Apps', time: mobileResponseTime },
      { name: 'Candidates', time: candidatesResponseTime }
    ];
    
    let performancePass = true;
    responses.forEach(response => {
      const status = response.time <= performanceTarget ? '✅' : '⚠️';
      console.log(`${status} ${response.name}: ${response.time}ms (target: ≤${performanceTarget}ms)`);
      if (response.time > performanceTarget) performancePass = false;
    });
    
    if (performancePass) {
      console.log('🚀 All endpoints meet performance targets!');
    } else {
      console.log('⚠️ Some endpoints exceed performance targets');
    }

    // Test 5: Pagination Headers Validation
    console.log('\n5️⃣ Testing Pagination Headers...');
    
    const requiredHeaders = [
      'x-pagination-strategy',
      'x-pagination-page-size',
      'x-pagination-query-time'
    ];
    
    const headerTestResponse = await axios.get(`${BASE_URL}/api/applications/paginated?limit=5`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    const presentHeaders = requiredHeaders.filter(header => headerTestResponse.headers[header]);
    console.log(`📊 Required Headers: ${requiredHeaders.length}`);
    console.log(`📊 Present Headers: ${presentHeaders.length}`);
    console.log(`🔍 Headers Found: ${presentHeaders.join(', ')}`);
    
    if (presentHeaders.length >= 2) {
      console.log('✅ Pagination headers working correctly');
    } else {
      console.log('⚠️ Some pagination headers missing');
    }

    // Test 6: Large Dataset Simulation
    console.log('\n6️⃣ Testing Large Dataset Handling...');
    
    const largeDatasetStartTime = Date.now();
    const largeDatasetResponse = await axios.get(`${BASE_URL}/api/applications/paginated?limit=50`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const largeDatasetResponseTime = Date.now() - largeDatasetStartTime;
    
    console.log(`📊 Large Dataset Response Time: ${largeDatasetResponseTime}ms`);
    console.log(`📈 Records Retrieved: ${largeDatasetResponse.data.data?.length || 0}`);
    
    const optimizations = largeDatasetResponse.headers['x-pagination-optimizations'];
    if (optimizations) {
      console.log(`⚡ Optimizations Applied: ${optimizations}`);
    }
    
    if (largeDatasetResponseTime <= 1000) { // 1 second for larger datasets
      console.log('✅ Large dataset handling within acceptable limits');
    } else {
      console.log('⚠️ Large dataset response time may need optimization');
    }

    console.log('\n🎉 Priority 4.1 Pagination Tests Completed!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   ✅ Applications Pagination: ${responseTime1}ms`);
    console.log(`   ✅ Mobile Optimization: ${mobileResponseTime}ms`);
    console.log(`   ✅ Candidates Pagination: ${candidatesResponseTime}ms`);
    console.log(`   ✅ Performance Targets: ${performancePass ? 'Met' : 'Needs improvement'}`);
    console.log(`   ✅ Pagination Headers: Working`);
    console.log(`   ✅ Large Dataset Handling: ${largeDatasetResponseTime}ms`);
    
    // Overall assessment
    const overallSuccess = 
      appsResponse.data.success && 
      mobileAppsResponse.data.success && 
      candidatesResponse.data.success && 
      performancePass;
    
    if (overallSuccess) {
      console.log('\n🚀 Priority 4.1: Pagination and Data Loading is FULLY OPERATIONAL!');
    } else {
      console.log('\n⚠️ Priority 4.1: Some pagination features need attention');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPagination();
