// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// const client_1 = require("@prisma/client");
// const bcrypt = require("bcrypt");
// const prisma = new client_1.PrismaClient();
// async function main() {
//     console.log('🌱 Starting database seed...');
//     const adminPassword = await bcrypt.hash('admin123', 12);
//     const admin = await prisma.user.upsert({
//         where: { email: 'admin@pemilu.com' },
//         update: {},
//         create: {
//             email: 'admin@pemilu.com',
//             name: 'System Administrator',
//             password: adminPassword,
//             role: client_1.UserRole.ADMIN,
//         },
//     });
//     const voterPassword = await bcrypt.hash('voter123', 12);
//     const voter1 = await prisma.user.upsert({
//         where: { email: 'voter1@pemilu.com' },
//         update: {},
//         create: {
//             email: 'voter1@pemilu.com',
//             name: 'John Doe',
//             password: voterPassword,
//             role: client_1.UserRole.VOTER,
//         },
//     });
//     const voter2 = await prisma.user.upsert({
//         where: { email: 'voter2@pemilu.com' },
//         update: {},
//         create: {
//             email: 'voter2@pemilu.com',
//             name: 'Jane Smith',
//             password: voterPassword,
//             role: client_1.UserRole.VOTER,
//         },
//     });
//     const election = await prisma.election.upsert({
//         where: { id: 1 },
//         update: {},
//         create: {
//             title: 'Presidential Election 2024',
//             description: 'Choose the next president of our organization',
//             startDate: new Date('2024-01-01T00:00:00Z'),
//             endDate: new Date('2024-12-31T23:59:59Z'),
//             isActive: true,
//         },
//     });
//     const candidate1 = await prisma.candidate.upsert({
//         where: { id: 1 },
//         update: {},
//         create: {
//             name: 'Alice Johnson',
//             description: 'Experienced leader with a vision for change',
//             electionId: election.id,
//         },
//     });
//     const candidate2 = await prisma.candidate.upsert({
//         where: { id: 2 },
//         update: {},
//         create: {
//             name: 'Bob Wilson',
//             description: 'Innovative thinker focused on progress',
//             electionId: election.id,
//         },
//     });
//     const candidate3 = await prisma.candidate.upsert({
//         where: { id: 3 },
//         update: {},
//         create: {
//             name: 'Carol Davis',
//             description: 'Community advocate with proven results',
//             electionId: election.id,
//         },
//     });
//     console.log('✅ Database seeded successfully!');
//     console.log('📊 Created:');
//     console.log(`   - Admin: ${admin.email} (password: admin123)`);
//     console.log(`   - Voter 1: ${voter1.email} (password: voter123)`);
//     console.log(`   - Voter 2: ${voter2.email} (password: voter123)`);
//     console.log(`   - Election: ${election.title}`);
//     console.log(`   - Candidates: ${candidate1.name}, ${candidate2.name}, ${candidate3.name}`);
// }
// main()
//     .catch((e) => {
//     console.error('❌ Seed failed:', e);
//     process.exit(1);
// })
//     .finally(async () => {
//     await prisma.$disconnect();
// });
// //# sourceMappingURL=seed.js.map