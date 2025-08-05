require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  if (!value && required) {
    log(`❌ ${name} is missing (required)`, 'red');
    return false;
  } else if (!value) {
    log(`⚠️  ${name} is not set (optional)`, 'yellow');
    return true;
  } else {
    log(`✅ ${name} is configured`, 'green');
    return true;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} is missing: ${filePath}`, 'red');
    return false;
  }
}

async function verifySetup() {
  log('🔍 Expense Tracker Backend Setup Verification', 'blue');
  log('=' .repeat(50), 'blue');

  let allGood = true;

  // Check environment file
  log('\n📋 Environment Configuration:', 'yellow');
  if (!checkFileExists('.env', '.env configuration file')) {
    log('   Run: cp .env.example .env', 'yellow');
    allGood = false;
  }

  // Check required environment variables
  allGood &= checkEnvVar('JWT_SECRET');
  allGood &= checkEnvVar('MAGIC_LINK_SECRET');
  
  // Check optional but recommended variables
  checkEnvVar('EMAIL_HOST', false);
  checkEnvVar('EMAIL_USER', false);
  checkEnvVar('EMAIL_PASS', false);
  checkEnvVar('DATABASE_PATH', false);
  checkEnvVar('FRONTEND_URL', false);
  checkEnvVar('SITE_URL', false);

  // Check directory structure
  log('\n📁 Directory Structure:', 'yellow');
  const requiredDirs = [
    'src',
    'src/controllers',
    'src/services',
    'src/routes',
    'src/middleware',
    'tests',
    'scripts'
  ];

  for (const dir of requiredDirs) {
    allGood &= checkFileExists(dir, `${dir} directory`);
  }

  // Check key files
  log('\n📄 Key Files:', 'yellow');
  const requiredFiles = [
    'package.json',
    'src/server.js',
    'src/app.js',
    'swagger.js',
    'README.md'
  ];

  for (const file of requiredFiles) {
    allGood &= checkFileExists(file, file);
  }

  // Check dependencies
  log('\n📦 Dependencies:', 'yellow');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'express',
      'sqlite3',
      'jsonwebtoken',
      'bcryptjs',
      'nodemailer',
      'joi',
      'helmet',
      'cors',
      'dotenv'
    ];

    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        log(`✅ ${dep} is installed`, 'green');
      } else {
        log(`❌ ${dep} is missing`, 'red');
        allGood = false;
      }
    }
  } catch (error) {
    log('❌ Error reading package.json', 'red');
    allGood = false;
  }

  // Check database initialization
  log('\n🗄️  Database:', 'yellow');
  const dbPath = process.env.DATABASE_PATH || './data/expense_tracker.db';
  
  if (dbPath === ':memory:') {
    log('✅ Using in-memory database (test mode)', 'green');
  } else {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      log(`⚠️  Database directory doesn't exist: ${dbDir}`, 'yellow');
      log('   It will be created automatically on first run', 'yellow');
    } else {
      log(`✅ Database directory exists: ${dbDir}`, 'green');
    }
  }

  // Security checks
  log('\n🔒 Security:', 'yellow');
  const jwtSecret = process.env.JWT_SECRET;
  const magicLinkSecret = process.env.MAGIC_LINK_SECRET;

  if (jwtSecret && jwtSecret.length < 32) {
    log('⚠️  JWT_SECRET should be at least 32 characters long', 'yellow');
  }

  if (magicLinkSecret && magicLinkSecret.length < 32) {
    log('⚠️  MAGIC_LINK_SECRET should be at least 32 characters long', 'yellow');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.EMAIL_HOST) {
      log('⚠️  Email configuration missing in production mode', 'yellow');
    }
    if (!process.env.FRONTEND_URL || !process.env.SITE_URL) {
      log('⚠️  Frontend/Site URLs should be configured in production', 'yellow');
    }
  }

  // Final result
  log('\n' + '=' .repeat(50), 'blue');
  if (allGood) {
    log('🎉 Setup verification completed successfully!', 'green');
    log('You can now start the server with: npm start', 'green');
    log('API documentation will be available at: http://localhost:3000/docs', 'blue');
  } else {
    log('❌ Setup verification failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

// Run verification
verifySetup().catch(error => {
  log(`❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
