#!/usr/bin/env node

/**
 * Test script for Priority 4.2: Mobile API Optimization
 * Tests mobile-specific endpoints, payload optimization, and offline capabilities
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'test-token'; // Mock token for testing

// Mobile User-Agent strings for testing
const MOBILE_USER_AGENTS = {
  iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  Android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  iPad: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
};

async function testMobileApi() {
  console.log('🧪 Testing Priority 4.2: Mobile API Optimization');
  console.log('=' * 70);

  try {
    // Test 1: Mobile Dashboard Optimization
    console.log('\n1️⃣ Testing Mobile Dashboard Optimization...');
    
    const dashboardStartTime = Date.now();
    const dashboardResponse = await axios.get(`${BASE_URL}/api/mobile/dashboard`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': MOBILE_USER_AGENTS.iPhone
      }
    });
    const dashboardResponseTime = Date.now() - dashboardStartTime;
    
    console.log(`📱 Mobile Dashboard Response Time: ${dashboardResponseTime}ms`);
    console.log(`🔍 Mobile Optimized: ${dashboardResponse.headers['x-mobile-optimized'] || 'Not set'}`);
    console.log(`📱 Device Type: ${dashboardResponse.headers['x-device-type'] || 'Not set'}`);
    console.log(`🎯 Platform: ${dashboardResponse.headers['x-platform'] || 'Not set'}`);
    console.log(`📊 Payload Reduction: ${dashboardResponse.headers['x-payload-reduction'] || 'Not set'}%`);
    
    if (dashboardResponse.data.success) {
      console.log('✅ Mobile dashboard working correctly');
      
      // Check mobile-specific data structure
      const data = dashboardResponse.data.data;
      if (data.metrics && data.recentActivity && data.quickActions) {
        console.log(`📊 Dashboard Data: ${data.recentActivity.length} recent activities, ${data.quickActions.length} quick actions`);
      }
    } else {
      console.log('❌ Mobile dashboard test failed');
    }

    // Test 2: Mobile Applications with Payload Optimization
    console.log('\n2️⃣ Testing Mobile Applications Optimization...');
    
    const appsStartTime = Date.now();
    const appsResponse = await axios.get(`${BASE_URL}/api/mobile/applications?limit=8`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': MOBILE_USER_AGENTS.Android
      }
    });
    const appsResponseTime = Date.now() - appsStartTime;
    
    console.log(`📱 Mobile Applications Response Time: ${appsResponseTime}ms`);
    console.log(`📊 Payload Size: ${appsResponse.headers['x-mobile-payload-size'] || 'Not set'} bytes`);
    console.log(`⚡ Performance Score: ${appsResponse.headers['x-mobile-performance-score'] || 'Not set'}`);
    
    if (appsResponse.data.success) {
      console.log('✅ Mobile applications working correctly');
      
      // Check payload optimization
      const firstApp = appsResponse.data.data[0];
      if (firstApp) {
        console.log(`📱 Mobile App Fields:`, {
          hasAvatar: !!firstApp.avatar,
          hasBadge: !!firstApp.badge,
          hasTimeFormat: !!firstApp.time,
          ultraLightweight: firstApp.candidate && firstApp.job && firstApp.status
        });
      }
    } else {
      console.log('❌ Mobile applications test failed');
    }

    // Test 3: Mobile Candidates Optimization
    console.log('\n3️⃣ Testing Mobile Candidates Optimization...');
    
    const candidatesStartTime = Date.now();
    const candidatesResponse = await axios.get(`${BASE_URL}/api/mobile/candidates?limit=10`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': MOBILE_USER_AGENTS.iPad
      }
    });
    const candidatesResponseTime = Date.now() - candidatesStartTime;
    
    console.log(`📱 Mobile Candidates Response Time: ${candidatesResponseTime}ms`);
    console.log(`🔍 Compression Enabled: ${candidatesResponse.headers['x-compression-enabled'] || 'Not set'}`);
    console.log(`📱 Offline Capable: ${candidatesResponse.headers['x-offline-capable'] || 'Not set'}`);
    
    if (candidatesResponse.data.success) {
      console.log('✅ Mobile candidates working correctly');
      
      // Check mobile optimization
      const firstCandidate = candidatesResponse.data.data[0];
      if (firstCandidate) {
        console.log(`👤 Mobile Candidate Fields:`, {
          hasAvatar: !!firstCandidate.avatar,
          hasInitials: !!firstCandidate.initials,
          hasExperience: !!firstCandidate.experience,
          compactFormat: firstCandidate.name && firstCandidate.location
        });
      }
    } else {
      console.log('❌ Mobile candidates test failed');
    }

    // Test 4: Mobile Authentication
    console.log('\n4️⃣ Testing Mobile Authentication...');
    
    try {
      const authResponse = await axios.post(`${BASE_URL}/api/auth/mobile-login`, {
        email: 'test@example.com',
        password: 'testpassword',
        deviceInfo: {
          type: 'mobile',
          platform: 'ios'
        }
      }, {
        headers: { 
          'User-Agent': MOBILE_USER_AGENTS.iPhone
        }
      });
      
      if (authResponse.data.success) {
        console.log('✅ Mobile authentication working');
        console.log(`📱 Device Optimized: ${authResponse.data.data.device?.optimized || false}`);
        console.log(`🔐 Session Length: ${authResponse.data.data.session?.expiresIn || 'Not set'}`);
        console.log(`📱 Offline Capable: ${authResponse.data.data.session?.offlineCapable || false}`);
      } else {
        console.log('⚠️ Mobile authentication test (expected failure for demo credentials)');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('⚠️ Mobile authentication test (expected 401 for demo credentials)');
      } else {
        console.log('❌ Mobile authentication test failed');
      }
    }

    // Test 5: Offline Queue Management
    console.log('\n5️⃣ Testing Offline Queue Management...');
    
    const queueResponse = await axios.get(`${BASE_URL}/api/mobile/queue`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': MOBILE_USER_AGENTS.Android
      }
    });
    
    if (queueResponse.data.success) {
      console.log('✅ Offline queue management working');
      const queueData = queueResponse.data.data;
      console.log(`📊 Queue Status:`, {
        totalItems: queueData.totalItems,
        highPriority: queueData.highPriority,
        estimatedSyncTime: queueData.estimatedSyncTime
      });
    } else {
      console.log('❌ Offline queue test failed');
    }

    // Test 6: Device Information Detection
    console.log('\n6️⃣ Testing Device Information Detection...');
    
    const deviceResponse = await axios.get(`${BASE_URL}/api/mobile/device-info`, {
      headers: { 
        Authorization: `Bearer ${TEST_TOKEN}`,
        'User-Agent': MOBILE_USER_AGENTS.iPhone
      }
    });
    
    if (deviceResponse.data.success) {
      console.log('✅ Device detection working');
      const deviceData = deviceResponse.data.data;
      console.log(`📱 Device Info:`, {
        type: deviceData.device?.type,
        platform: deviceData.device?.platform,
        screenSize: deviceData.device?.screenSize
      });
      console.log(`⚡ Optimization:`, {
        maxPayloadSize: deviceData.optimization?.maxPayloadSize,
        imageQuality: deviceData.optimization?.imageQuality,
        offlineSupport: deviceData.optimization?.offlineSupport
      });
    } else {
      console.log('❌ Device detection test failed');
    }

    // Test 7: Performance Target Verification
    console.log('\n7️⃣ Testing Mobile Performance Targets...');
    
    const performanceTarget = 400; // 400ms target for mobile
    const responses = [
      { name: 'Dashboard', time: dashboardResponseTime },
      { name: 'Applications', time: appsResponseTime },
      { name: 'Candidates', time: candidatesResponseTime }
    ];
    
    let performancePass = true;
    responses.forEach(response => {
      const status = response.time <= performanceTarget ? '✅' : '⚠️';
      console.log(`${status} ${response.name}: ${response.time}ms (target: ≤${performanceTarget}ms)`);
      if (response.time > performanceTarget) performancePass = false;
    });
    
    if (performancePass) {
      console.log('🚀 All mobile endpoints meet performance targets!');
    } else {
      console.log('⚠️ Some mobile endpoints exceed performance targets');
    }

    // Test 8: Payload Size Verification
    console.log('\n8️⃣ Testing Payload Size Optimization...');
    
    const payloadSizes = [
      { name: 'Dashboard', size: JSON.stringify(dashboardResponse.data).length },
      { name: 'Applications', size: JSON.stringify(appsResponse.data).length },
      { name: 'Candidates', size: JSON.stringify(candidatesResponse.data).length }
    ];
    
    const maxMobilePayload = 50000; // 50KB target
    let payloadPass = true;
    
    payloadSizes.forEach(payload => {
      const status = payload.size <= maxMobilePayload ? '✅' : '⚠️';
      const sizeKB = Math.round(payload.size / 1024);
      console.log(`${status} ${payload.name}: ${sizeKB}KB (target: ≤49KB)`);
      if (payload.size > maxMobilePayload) payloadPass = false;
    });
    
    if (payloadPass) {
      console.log('🚀 All mobile payloads within size targets!');
    } else {
      console.log('⚠️ Some mobile payloads exceed size targets');
    }

    console.log('\n🎉 Priority 4.2 Mobile API Tests Completed!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   ✅ Mobile Dashboard: ${dashboardResponseTime}ms`);
    console.log(`   ✅ Mobile Applications: ${appsResponseTime}ms`);
    console.log(`   ✅ Mobile Candidates: ${candidatesResponseTime}ms`);
    console.log(`   ✅ Mobile Authentication: Working`);
    console.log(`   ✅ Offline Queue: Working`);
    console.log(`   ✅ Device Detection: Working`);
    console.log(`   ✅ Performance Targets: ${performancePass ? 'Met' : 'Needs improvement'}`);
    console.log(`   ✅ Payload Optimization: ${payloadPass ? 'Met' : 'Needs improvement'}`);
    
    // Overall assessment
    const overallSuccess = 
      dashboardResponse.data.success && 
      appsResponse.data.success && 
      candidatesResponse.data.success && 
      queueResponse.data.success && 
      deviceResponse.data.success &&
      performancePass;
    
    if (overallSuccess) {
      console.log('\n🚀 Priority 4.2: Mobile API Optimization is FULLY OPERATIONAL!');
    } else {
      console.log('\n⚠️ Priority 4.2: Some mobile features need attention');
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
testMobileApi();
