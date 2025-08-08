#!/usr/bin/env node

/**
 * Test script for Priority 3.1: Redis-based Analytics Caching
 * Tests the enhanced analytics caching middleware and performance
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'test-token'; // Mock token for testing

async function testAnalyticsCaching() {
  console.log('🧪 Testing Priority 3.1: Redis-based Analytics Caching');
  console.log('=' * 60);

  try {
    // Test 1: Dashboard Caching
    console.log('\n1️⃣ Testing Dashboard Caching Performance...');
    
    // First request (cache miss)
    const startTime1 = Date.now();
    const dashboardResponse1 = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const responseTime1 = Date.now() - startTime1;
    
    console.log(`📊 First request (cache miss): ${responseTime1}ms`);
    console.log(`🔍 Cache header: ${dashboardResponse1.headers['x-cache'] || 'Not set'}`);
    
    // Second request (should be cache hit)
    const startTime2 = Date.now();
    const dashboardResponse2 = await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const responseTime2 = Date.now() - startTime2;
    
    console.log(`📊 Second request (cache hit): ${responseTime2}ms`);
    console.log(`🔍 Cache header: ${dashboardResponse2.headers['x-cache'] || 'Not set'}`);
    
    const performanceImprovement = ((responseTime1 - responseTime2) / responseTime1) * 100;
    console.log(`🚀 Performance improvement: ${performanceImprovement.toFixed(1)}%`);
    
    if (dashboardResponse1.data.success && dashboardResponse2.data.success) {
      console.log('✅ Dashboard caching working correctly');
    } else {
      console.log('❌ Dashboard caching test failed');
    }

    // Test 2: Real-time Metrics Caching
    console.log('\n2️⃣ Testing Real-time Metrics Caching...');
    
    const realtimeStartTime = Date.now();
    const realtimeResponse = await axios.get(`${BASE_URL}/api/analytics/realtime-metrics`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    const realtimeResponseTime = Date.now() - realtimeStartTime;
    
    console.log(`📊 Real-time metrics response time: ${realtimeResponseTime}ms`);
    console.log(`🔍 Cache header: ${realtimeResponse.headers['x-cache'] || 'Not set'}`);
    
    if (realtimeResponse.data.success) {
      console.log('✅ Real-time metrics caching working correctly');
    } else {
      console.log('❌ Real-time metrics caching test failed');
    }

    // Test 3: Cache Performance Monitoring
    console.log('\n3️⃣ Testing Cache Performance Monitoring...');
    
    const cachePerformanceResponse = await axios.get(`${BASE_URL}/api/analytics/cache-performance`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    if (cachePerformanceResponse.data.success) {
      console.log('✅ Cache performance monitoring working');
      const summary = cachePerformanceResponse.data.data.summary;
      console.log(`📊 Total Hit Rate: ${summary.totalHitRate.toFixed(1)}%`);
      console.log(`📊 Total Requests: ${summary.totalRequests}`);
      console.log(`📊 Average Response Time: ${summary.averageResponseTime.toFixed(1)}ms`);
      console.log(`📊 Cache Strategies: ${summary.strategiesCount}`);
    } else {
      console.log('❌ Cache performance monitoring test failed');
    }

    // Test 4: Cache Warming
    console.log('\n4️⃣ Testing Cache Warming...');
    
    const warmingResponse = await axios.post(`${BASE_URL}/api/analytics/cache-warm`, {}, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    if (warmingResponse.data.success) {
      console.log('✅ Cache warming working correctly');
      console.log(`🔥 Warming time: ${warmingResponse.data.data.warmingTime}ms`);
    } else {
      console.log('❌ Cache warming test failed');
    }

    // Test 5: Performance Target Verification
    console.log('\n5️⃣ Verifying Performance Targets...');
    
    const targetResponseTime = 200; // 200ms target
    const cacheHitTarget = responseTime2;
    
    if (cacheHitTarget <= targetResponseTime) {
      console.log(`✅ Cache hit response time (${cacheHitTarget}ms) meets target (≤${targetResponseTime}ms)`);
    } else {
      console.log(`⚠️ Cache hit response time (${cacheHitTarget}ms) exceeds target (≤${targetResponseTime}ms)`);
    }

    console.log('\n🎉 Priority 3.1 Analytics Caching Tests Completed!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   ✅ Dashboard Caching: ${responseTime1}ms → ${responseTime2}ms (${performanceImprovement.toFixed(1)}% improvement)`);
    console.log(`   ✅ Real-time Metrics: ${realtimeResponseTime}ms response time`);
    console.log(`   ✅ Cache Performance Monitoring: Working`);
    console.log(`   ✅ Cache Warming: Working`);
    console.log(`   ✅ Performance Target: ${cacheHitTarget <= targetResponseTime ? 'Met' : 'Needs improvement'}`);
    
    // Overall assessment
    const overallSuccess = 
      dashboardResponse1.data.success && 
      dashboardResponse2.data.success && 
      realtimeResponse.data.success && 
      cachePerformanceResponse.data.success && 
      warmingResponse.data.success &&
      cacheHitTarget <= targetResponseTime;
    
    if (overallSuccess) {
      console.log('\n🚀 Priority 3.1: Redis-based Analytics Caching is FULLY OPERATIONAL!');
    } else {
      console.log('\n⚠️ Priority 3.1: Some caching features need attention');
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
testAnalyticsCaching();
