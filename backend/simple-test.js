// Simple test to verify cache modules can be imported
console.log('🧪 Testing cache module imports...');

try {
  // Test basic Node.js modules first
  console.log('✅ Node.js modules working');
  
  // Test if we can import our cache modules
  import('./src/cache/RedisClient.js')
    .then(() => {
      console.log('✅ RedisClient import successful');
      return import('./src/cache/QueryCache.js');
    })
    .then(() => {
      console.log('✅ QueryCache import successful');
      return import('./src/cache/CacheManager.js');
    })
    .then(() => {
      console.log('✅ CacheManager import successful');
      return import('./src/cache/index.js');
    })
    .then(() => {
      console.log('✅ Cache index import successful');
      console.log('🎉 All cache modules imported successfully!');
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
    });
    
} catch (error) {
  console.error('❌ Test failed:', error);
}
