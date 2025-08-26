#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Final Build Test After Auth Fix');

const logFile = 'build-result.txt';

function writeResult(status, details) {
  const result = {
    timestamp: new Date().toISOString(),
    status: status,
    details: details
  };
  fs.writeFileSync(logFile, JSON.stringify(result, null, 2));
}

try {
  console.log('🏗️ Running Next.js build...');
  
  const buildOutput = execSync('npx next build', { 
    stdio: 'pipe',
    timeout: 300000,
    encoding: 'utf8'
  });
  
  console.log('🎉 BUILD SUCCESSFUL!');
  writeResult('SUCCESS', {
    message: 'Build completed successfully',
    output: buildOutput.split('\n').slice(-20) // Last 20 lines
  });
  
} catch (error) {
  console.log('❌ BUILD FAILED');
  
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
  
  writeResult('FAILED', {
    message: 'Build failed',
    error: errorOutput,
    authError: errorOutput.includes('useAuth must be used within an AuthProvider')
  });
}

console.log(`📝 Result written to: ${logFile}`);
