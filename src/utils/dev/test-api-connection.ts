// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await fetch('http://localhost:3001/api/jobs');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API test successful:', data);
    return data;
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
};

// Call this function to test
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
}
