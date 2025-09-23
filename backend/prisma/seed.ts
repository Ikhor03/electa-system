import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pemilu.com',
      username: 'superadmin',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Create operator
  const operatorPassword = await bcrypt.hash('operator123', 12);
  const operator = await prisma.user.create({
    data: {
      email: 'operator@pemilu.com',
      username: 'operator',
      name: 'Election Operator',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });

  // Create voters
  const voter1Password = await bcrypt.hash('voter123', 12);
  const voter1 = await prisma.user.create({
    data: {
      email: 'voter1@pemilu.com',
      username: 'voter1',
      name: 'Ahmad Voter',
      password: voter1Password,
      role: 'VOTER',
    },
  });

  const voter2Password = await bcrypt.hash('voter123', 12);
  const voter2 = await prisma.user.create({
    data: {
      email: 'voter2@pemilu.com',
      username: 'voter2',
      name: 'Siti Voter',
      password: voter2Password,
      role: 'VOTER',
    },
  });

  // Create elections
  const presidentialElection = await prisma.election.create({
    data: {
      name: 'Pemilihan Kepala Daerah Garut 2024',
      description: 'Pemilihan Kepala Daerah dan Wakil Kepala Daerah Kabupaten Garut periode 2024-2029',
      accessUrl: 'pilkada-garut-2024',
      status: 'ACTIVE',
      startDate: new Date('2024-06-27T08:00:00+07:00'),
      endDate: new Date('2024-06-30T17:00:00+07:00'),
      voterType: 'NIK',
      requiresAuth: true,
      allowQuickCount: true,
      showResults: true,
      maxVotesPerUser: 1,
    },
  });

  const bemElection = await prisma.election.create({
    data: {
      name: 'Pemilihan Ketua BEM 2024',
      description: 'Pemilihan Ketua Badan Eksekutif Mahasiswa periode 2024-2025',
      accessUrl: 'bem-2024',
      status: 'COMPLETED',
      startDate: new Date('2024-06-20T08:00:00+07:00'),
      endDate: new Date('2024-06-20T17:00:00+07:00'),
      voterType: 'NPM',
      requiresAuth: true,
      allowQuickCount: false,
      showResults: true,
      maxVotesPerUser: 1,
    },
  });

  // Create electoral districts for Pilkada
  const dapil1 = await prisma.electoralDistrict.create({
    data: {
      name: 'DAPIL 1',
      description: 'Daerah Pemilihan 1 - Garut Utara',
      electionId: presidentialElection.id,
    },
  });

  const dapil2 = await prisma.electoralDistrict.create({
    data: {
      name: 'DAPIL 2',
      description: 'Daerah Pemilihan 2 - Garut Selatan',
      electionId: presidentialElection.id,
    },
  });

  // Create candidates for Pilkada
  const candidate1 = await prisma.candidate.create({
    data: {
      name: 'Afdi dan Fadlan',
      candidateNumber: '01',
      description: 'Visi adalah tujuan, masa depan, cita-cita, hal yang ingin dilakukan. Misi adalah langkah, bentuk atau cara serta bagaimana untuk mewujudkannya.',
      electionId: presidentialElection.id,
      position: 1,
    },
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      name: 'Odang & Dudung',
      candidateNumber: '02',
      description: 'Visi adalah tujuan, masa depan, cita-cita, hal yang ingin dilakukan. Misi adalah langkah, bentuk atau cara serta bagaimana untuk mewujudkannya.',
      electionId: presidentialElection.id,
      position: 2,
    },
  });

  const candidate3 = await prisma.candidate.create({
    data: {
      name: 'Cucung & Cicing',
      candidateNumber: '03',
      description: 'Mencerdaskan kehidupan bangsa',
      electionId: presidentialElection.id,
      position: 3,
    },
  });

  const candidate4 = await prisma.candidate.create({
    data: {
      name: 'Tatang & Tutung',
      candidateNumber: '04',
      description: 'Mencerdaskan kehidupan bangsa',
      electionId: presidentialElection.id,
      position: 4,
    },
  });

  // Create BEM candidate
  const bemCandidate = await prisma.candidate.create({
    data: {
      name: 'Nunung & Nining',
      candidateNumber: '01',
      description: 'Mencerdaskan kehidupan bangsa',
      electionId: bemElection.id,
      position: 1,
    },
  });

  // Create voter registrations
  const voterReg1 = await prisma.voterRegistration.create({
    data: {
      voterIdentifier: '3205012939149294',
      name: 'Anton',
      gender: 'MALE',
      hasVoted: false,
      electionId: presidentialElection.id,
      electoralDistrictId: dapil1.id,
    },
  });

  const voterReg2 = await prisma.voterRegistration.create({
    data: {
      voterIdentifier: '3205012939149295',
      name: 'Sarton',
      gender: 'MALE',
      hasVoted: false,
      electionId: presidentialElection.id,
      electoralDistrictId: dapil2.id,
    },
  });

  const voterReg3 = await prisma.voterRegistration.create({
    data: {
      voterIdentifier: '3205012939149296',
      name: 'Barton',
      gender: 'FEMALE',
      hasVoted: false,
      electionId: presidentialElection.id,
      electoralDistrictId: dapil1.id,
    },
  });

  // Create system configurations
  await prisma.configuration.createMany({
    data: [
      {
        key: 'app_title',
        value: 'E-VOTING',
        description: 'Application title',
        isPublic: true,
      },
      {
        key: 'app_subtitle',
        value: 'DAFTAR PEMILIHAN',
        description: 'Application subtitle',
        isPublic: true,
      },
      {
        key: 'max_photo_size',
        value: '400',
        description: 'Maximum photo size in KB',
        isPublic: false,
      },
      {
        key: 'app_icon',
        value: 'LOGO_PROZEN_WEB.png',
        description: 'Application icon filename',
        isPublic: true,
      },
      {
        key: 'jwt_expires_in',
        value: '15m',
        description: 'JWT token expiration time',
        isPublic: false,
      },
      {
        key: 'jwt_refresh_expires_in',
        value: '7d',
        description: 'JWT refresh token expiration time',
        isPublic: false,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - Super Admin: ${admin.email} (username: ${admin.username}, password: admin123)`);
  console.log(`   - Operator: ${operator.email} (username: ${operator.username}, password: operator123)`);
  console.log(`   - Voter 1: ${voter1.email} (username: ${voter1.username}, password: voter123)`);
  console.log(`   - Voter 2: ${voter2.email} (username: ${voter2.username}, password: voter123)`);
  console.log(`   - Elections: ${presidentialElection.name}, ${bemElection.name}`);
  console.log(`   - Candidates: ${candidate1.name}, ${candidate2.name}, ${candidate3.name}, ${candidate4.name}, ${bemCandidate.name}`);
  console.log(`   - Electoral Districts: ${dapil1.name}, ${dapil2.name}`);
  console.log(`   - Voter Registrations: ${voterReg1.name}, ${voterReg2.name}, ${voterReg3.name}`);
  console.log(`   - System Configurations: 6 settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
