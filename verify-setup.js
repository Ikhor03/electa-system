#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Phase 1 Foundation Setup...\n');

const checks = [
  {
    name: 'Monorepo Structure',
    check: () => {
      const workspaceFile = path.join(__dirname, 'pnpm-workspace.yaml');
      const packageJson = path.join(__dirname, 'package.json');
      return fs.existsSync(workspaceFile) && fs.existsSync(packageJson);
    }
  },
  {
    name: 'Backend Setup',
    check: () => {
      const backendDir = path.join(__dirname, 'backend');
      const packageJson = path.join(backendDir, 'package.json');
      const prismaSchema = path.join(backendDir, 'prisma', 'schema.prisma');
      return fs.existsSync(backendDir) && fs.existsSync(packageJson) && fs.existsSync(prismaSchema);
    }
  },
  {
    name: 'Frontend Setup',
    check: () => {
      const frontendDir = path.join(__dirname, 'frontend');
      const packageJson = path.join(frontendDir, 'package.json');
      const nextConfig = path.join(frontendDir, 'next.config.ts');
      return fs.existsSync(frontendDir) && fs.existsSync(packageJson);
    }
  },
  {
    name: 'Shared Package',
    check: () => {
      const sharedDir = path.join(__dirname, 'shared');
      const packageJson = path.join(sharedDir, 'package.json');
      const indexFile = path.join(sharedDir, 'src', 'index.ts');
      return fs.existsSync(sharedDir) && fs.existsSync(packageJson) && fs.existsSync(indexFile);
    }
  },
  {
    name: 'Docker Configuration',
    check: () => {
      const dockerCompose = path.join(__dirname, 'docker-compose.yml');
      return fs.existsSync(dockerCompose);
    }
  },
  {
    name: 'Development Configuration',
    check: () => {
      const eslintrc = path.join(__dirname, '.eslintrc.js');
      const prettierrc = path.join(__dirname, '.prettierrc');
      const gitignore = path.join(__dirname, '.gitignore');
      const readme = path.join(__dirname, 'README.md');
      return fs.existsSync(eslintrc) && fs.existsSync(prettierrc) && 
             fs.existsSync(gitignore) && fs.existsSync(readme);
    }
  }
];

let passed = 0;
let failed = 0;

checks.forEach(({ name, check }) => {
  const result = check();
  if (result) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 Phase 1 Foundation Setup completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Update backend/.env with your database configuration');
  console.log('2. Run: pnpm --filter backend db:migrate');
  console.log('3. Run: pnpm --filter backend db:seed');
  console.log('4. Run: pnpm dev');
  console.log('\n🔗 Useful Commands:');
  console.log('- pnpm dev                    # Start both backend and frontend');
  console.log('- pnpm --filter backend dev   # Start only backend');
  console.log('- pnpm --filter frontend dev  # Start only frontend');
  console.log('- docker-compose up -d        # Start PostgreSQL database');
} else {
  console.log('\n⚠️  Some checks failed. Please review the setup.');
  process.exit(1);
}
