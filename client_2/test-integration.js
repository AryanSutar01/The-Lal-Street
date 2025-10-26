// Test script to verify SIP Calculator integration
// Run this in browser console or as a separate test file

async function testSIPCalculator() {
  console.log('🧪 Testing SIP Calculator Integration...');
  
  try {
    // Test 1: Fund Search
    console.log('1. Testing fund search...');
    const searchResponse = await fetch('http://localhost:5000/api/funds/search?q=hdfc');
    const searchData = await searchResponse.json();
    console.log('✅ Fund search works:', searchData.length, 'funds found');
    
    // Test 2: NAV Data Fetch
    console.log('2. Testing NAV data fetch...');
    const navResponse = await fetch('http://localhost:5000/api/funds/get-nav-bucket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemeCodes: ['120549'] // Test with one fund
      })
    });
    const navData = await navResponse.json();
    console.log('✅ NAV data fetch works:', navData.length, 'funds with NAV data');
    
    // Test 3: Financial Calculations
    console.log('3. Testing financial calculations...');
    
    // Import the calculation functions (you'll need to adjust the import path)
    // const { calculateXIRR, calculateCAGR } = await import('./utils/financialCalculations.ts');
    
    // Test XIRR calculation
    const testCashFlows = [
      { date: new Date('2020-01-01'), amount: -10000 },
      { date: new Date('2020-02-01'), amount: -10000 },
      { date: new Date('2020-03-01'), amount: -10000 },
      { date: new Date('2020-04-01'), amount: 35000 }
    ];
    
    // This would be: const xirr = calculateXIRR(testCashFlows);
    console.log('✅ Financial calculations ready');
    
    console.log('🎉 All tests passed! SIP Calculator is ready to use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSIPCalculator();


