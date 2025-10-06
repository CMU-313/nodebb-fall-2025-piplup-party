#!/usr/bin/env node

/**
 * Test runner for urgency feature tests
 * 
 * This script runs all urgency-related tests to verify the implementation
 * meets the acceptance criteria:
 * 
 * 1. "Mark as urgent/not urgent" option exists under topic tools dropdown menu, 
 *    for both topic list view and per topic view
 * 2. Clicking that option adds/removes urgent tag from posts.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Urgency Feature Tests...\n');

// Test files to run
const testFiles = [
	'./urgency.js',
	'./frontend-urgency.js', 
	'./urgency-acceptance.js' ];

// Run each test file
async function runTests() {
	for (const testFile of testFiles) {
		console.log(`📋 Running ${testFile}...`);
		
		const testProcess = spawn('npx', ['mocha', testFile, '--timeout', '30000'], {
			stdio: 'inherit',
			cwd: path.resolve(__dirname),
		});

		await new Promise((resolve, reject) => {
			testProcess.on('close', (code) => {
				if (code === 0) {
					console.log(`✅ ${testFile} passed\n`);
					resolve();
				} else {
					console.log(`❌ ${testFile} failed with code ${code}\n`);
					reject(new Error(`Test ${testFile} failed`));
				}
			});
		});
	}
	
	console.log('🎉 All urgency tests completed successfully!');
}

runTests().catch((error) => {
	console.error('💥 Test suite failed:', error.message);
	process.exit(1);
});
