// This script checks for required environment variables
const fs = require('fs');
const path = require('path');

const requiredVars = [
  'AUTH_SECRET',
  // Add other required variables here
];

function checkEnvVars() {
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease add these variables to your environment or .env file.');
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'All required environment variables are set.');
  }
}

checkEnvVars();