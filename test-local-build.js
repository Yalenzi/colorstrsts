#!/usr/bin/env node

/**
 * Test Local Build Script
 * سكريبت اختبار البناء المحلي
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔧 Testing Local Build');
console.log('🔧 اختبار البناء المحلي');
console.log('='.repeat(50));

// Function to run command and capture output
const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output);
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output);
    });

    process.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

// Main test function
const testBuild = async () => {
  try {
    console.log('\n📦 Step 1: Installing dependencies...');
    const installResult = await runCommand('npm', ['install']);
    
    if (installResult.code !== 0) {
      console.log('❌ npm install failed');
      return;
    }
    
    console.log('✅ Dependencies installed successfully');

    console.log('\n🔧 Step 2: Running build...');
    const buildResult = await runCommand('npm', ['run', 'build']);
    
    if (buildResult.code === 0) {
      console.log('\n🎉 Build completed successfully!');
      console.log('🎉 تم إكمال البناء بنجاح!');
      
      // Check if out directory was created
      if (fs.existsSync('out')) {
        console.log('✅ Static export directory created');
        
        // List some key files
        const outFiles = fs.readdirSync('out');
        console.log(`📁 Generated ${outFiles.length} files in out directory`);
        
        // Check for key pages
        const keyPages = ['index.html', 'ar.html', 'en.html'];
        keyPages.forEach(page => {
          if (outFiles.includes(page)) {
            console.log(`✅ ${page} generated`);
          } else {
            console.log(`⚠️ ${page} not found`);
          }
        });
      } else {
        console.log('⚠️ Static export directory not created');
      }
    } else {
      console.log('\n❌ Build failed!');
      console.log('❌ فشل البناء!');
      
      // Analyze error output
      if (buildResult.stderr.includes('useAuth must be used within an AuthProvider')) {
        console.log('\n💡 Auth provider error detected');
        console.log('Check that all components using useAuth import from @/components/providers');
      }
      
      if (buildResult.stderr.includes('pages without a React Component as default export')) {
        console.log('\n💡 Default export error detected');
        console.log('Check that all page components have export default statements');
      }
      
      if (buildResult.stderr.includes('Module not found')) {
        console.log('\n💡 Import error detected');
        console.log('Check for missing files or incorrect import paths');
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
};

// Check environment first
const checkEnvironment = () => {
  console.log('\n🔍 Checking environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);
  
  // Check if package.json exists
  if (fs.existsSync('package.json')) {
    console.log('✅ package.json found');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      console.log(`Project: ${packageJson.name || 'Unknown'}`);
      console.log(`Version: ${packageJson.version || 'Unknown'}`);
      
      if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`Build script: ${packageJson.scripts.build}`);
      } else {
        console.log('❌ No build script found in package.json');
        return false;
      }
    } catch (error) {
      console.log('❌ Error reading package.json:', error.message);
      return false;
    }
  } else {
    console.log('❌ package.json not found');
    return false;
  }
  
  return true;
};

// Run the test
const main = async () => {
  if (checkEnvironment()) {
    await testBuild();
  } else {
    console.log('❌ Environment check failed');
  }
  
  console.log('\n🏁 Test completed');
  console.log('🏁 اكتمل الاختبار');
};

main();
