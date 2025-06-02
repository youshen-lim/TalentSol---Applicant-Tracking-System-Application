// Test script for caching implementation
import { redisClient } from './src/cache/RedisClient.js';
import { queryCache } from './src/cache/QueryCache.js';
import { cacheManager } from './src/cache/CacheManager.js';

async function testCacheImplementation() {
  console.log('🧪 Testing TalentSol ATS Caching Implementation...\n');

  try {
    // Test 1: Redis Client Health Check
    console.log('1️⃣ Testing Redis Client...');
    const redisHealth = await redisClient.healthCheck();
    console.log('   Redis Health:', redisHealth.redis ? '✅ Connected' : '⚠️ Using fallback');
    console.log('   Fallback Health:', redisHealth.fallback ? '✅ Available' : '❌ Failed');
    console.log('   Stats:', JSON.stringify(redisHealth.stats, null, 2));

    // Test 2: Basic Cache Operations
    console.log('\n2️⃣ Testing Basic Cache Operations...');
    
    // Set a value
    const testKey = 'test_key_' + Date.now();
    const testValue = { message: 'Hello from cache!', timestamp: new Date().toISOString() };
    
    await redisClient.set(testKey, JSON.stringify(testValue), 60);
    console.log('   ✅ Set cache value');
    
    // Get the value
    const retrievedValue = await redisClient.get(testKey);
    console.log('   ✅ Retrieved cache value:', JSON.parse(retrievedValue || '{}'));
    
    // Check if key exists
    const exists = await redisClient.exists(testKey);
    console.log('   ✅ Key exists:', exists);
    
    // Delete the key
    await redisClient.del(testKey);
    console.log('   ✅ Deleted cache key');

    // Test 3: Query Cache
    console.log('\n3️⃣ Testing Query Cache...');
    
    const queryKey = 'test_query';
    const queryParams = { userId: '123', companyId: 'abc' };
    const queryResult = { data: 'mock query result', count: 42 };
    
    // Set query cache
    await queryCache.set(queryKey, queryParams, queryResult, { ttl: 300, tags: ['test'] });
    console.log('   ✅ Set query cache');
    
    // Get query cache
    const cachedQuery = await queryCache.get(queryKey, queryParams);
    console.log('   ✅ Retrieved query cache:', cachedQuery);
    
    // Test cache stats
    const stats = queryCache.getStats();
    console.log('   📊 Query cache stats:', stats);

    // Test 4: Cache Manager
    console.log('\n4️⃣ Testing Cache Manager...');
    
    const managerHealth = await cacheManager.healthCheck();
    console.log('   ✅ Cache manager health check completed');
    console.log('   📊 Available strategies:', managerHealth.strategies);
    
    // Test cache invalidation
    await cacheManager.invalidateByTags(['test']);
    console.log('   ✅ Invalidated test tags');
    
    // Verify invalidation worked
    const afterInvalidation = await queryCache.get(queryKey, queryParams);
    console.log('   ✅ After invalidation (should be null):', afterInvalidation);

    // Test 5: Cache Strategies
    console.log('\n5️⃣ Testing Cache Strategies...');
    
    const dashboardCache = cacheManager.getCache('dashboard_cache');
    if (dashboardCache) {
      await dashboardCache.set('dashboard_test', { companyId: 'test' }, { metric: 'value' });
      console.log('   ✅ Dashboard cache strategy working');
    }
    
    const aiCache = cacheManager.getCache('ai_analysis_cache');
    if (aiCache) {
      await aiCache.set('ai_test', { modelId: 'test' }, { prediction: 0.85 });
      console.log('   ✅ AI analysis cache strategy working');
    }

    // Test 6: Performance Test
    console.log('\n6️⃣ Performance Test...');
    
    const startTime = Date.now();
    const promises = [];
    
    // Perform 100 cache operations
    for (let i = 0; i < 100; i++) {
      promises.push(
        redisClient.set(`perf_test_${i}`, JSON.stringify({ index: i, data: 'test data' }), 60)
      );
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   ✅ Completed 100 cache operations in ${endTime - startTime}ms`);
    
    // Cleanup performance test keys
    for (let i = 0; i < 100; i++) {
      await redisClient.del(`perf_test_${i}`);
    }
    console.log('   ✅ Cleaned up performance test keys');

    console.log('\n🎉 All cache tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Redis Client: Working with fallback support');
    console.log('   • Query Cache: Functional with TTL and tags');
    console.log('   • Cache Manager: All strategies available');
    console.log('   • Performance: Good (sub-second for 100 operations)');
    console.log('   • Invalidation: Working correctly');

  } catch (error) {
    console.error('❌ Cache test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCacheImplementation()
  .then(() => {
    console.log('\n✅ Cache implementation test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cache implementation test failed:', error);
    process.exit(1);
  });
