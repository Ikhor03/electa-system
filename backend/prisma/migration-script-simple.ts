// /**
//  * Simplified Data Migration Script
//  * Creates sample data based on the existing PHP/MySQL system structure
//  * This version focuses on creating realistic test data without MySQL dependency
//  */

// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
// import * as crypto from 'crypto';

// const prisma = new PrismaClient();

// // Sample data based on the original pemilu.sql file
// const sampleData = {
//   users: [
//     { id: 1, nama: 'Admin', username: 'superadmin', email: 'admin@gmail.com', level: '1' },
//     { id: 6, nama: 'Luffy', username: 'lufy', email: 'sss@gmail.com', level: '4' },
//     { id: 7, nama: 'Jojo', username: 'jojo', email: 'jojo@gmail.com', level: '3' },
//     { id: 8, nama: 'Onica', username: 'onic', email: 'contoh@gmail.com', level: '3' },
//   ],
//   kategori: [
//     {
//       id: 2,
//       nama_kategori: 'Pemilihan Ketua BEM',
//       akses_url: 'asdsadas',
//       tgl_mulai: '2024-06-20',
//       jam_mulai: '08:00:00',
//       tgl_berakhir: '2024-06-20',
//       jam_berakhir: '12:00:00',
//       tipe_user: 'NPM'
//     },
//     {
//       id: 5,
//       nama_kategori: 'Pemilihan Kepala Daerah Garut',
//       akses_url: 'XehVPWvYk29q7p3b1r0f',
//       tgl_mulai: '2024-06-27',
//       jam_mulai: '08:00:00',
//       tgl_berakhir: '2024-06-30',
//       jam_berakhir: '11:00:00',
//       tipe_user: 'NIK'
//     }
//   ],
//   kandidat: [
//     { id: 17, id_kategori: 5, nama: 'Afdi dan Fadlan', no_urut: '01' },
//     { id: 1, id_kategori: 5, nama: 'Odang & Dudung', no_urut: '02' },
//     { id: 4, id_kategori: 5, nama: 'Cucung & Cicing', no_urut: '03' },
//     { id: 3, id_kategori: 5, nama: 'Tatang & Tutung', no_urut: '04' },
//     { id: 2, id_kategori: 2, nama: 'Nunung & Nining', no_urut: '01' },
//   ],
//   dapil: [
//     { id: 3, id_kategori: 5, nama_dapil: 'DAPIL 1' },
//     { id: 10, id_kategori: 5, nama_dapil: 'DAPIL 2' },
//     { id: 11, id_kategori: 5, nama_dapil: 'DAPIL 3' },
//     { id: 12, id_kategori: 5, nama_dapil: 'DAPIL 4' },
//   ],
//   pemilihan: [
//     { id_user: '3205012939149294', nama: 'Anton', id_kategori: 5, id_dapil: 3, jk: 'L' },
//     { id_user: '3205012939149295', nama: 'Sarton', id_kategori: 5, id_dapil: 10, jk: 'L' },
//     { id_user: '3205012939149296', nama: 'Barton', id_kategori: 5, id_dapil: 11, jk: 'P' },
//     { id_user: '3205012939149297', nama: 'Santon', id_kategori: 5, id_dapil: 12, jk: 'P' },
//   ]
// };

// class SimpleMigrator {
//   /**
//    * Migrate users with secure password hashing
//    */
//   async migrateUsers() {
//     console.log('🔄 Migrating users...');
    
//     for (const oldUser of sampleData.users) {
//       try {
//         // Map user roles
//         let role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'VOTER' = 'VOTER';
//         switch (oldUser.level) {
//           case '1':
//             role = 'SUPER_ADMIN';
//             break;
//           case '3':
//             role = 'OPERATOR';
//             break;
//           case '4':
//           default:
//             role = 'VOTER';
//             break;
//         }

//         // Generate secure password (users should reset in production)
//         const tempPassword = `temp_${oldUser.username}_123`;
//         const hashedPassword = await bcrypt.hash(tempPassword, 12);

//         await prisma.user.create({
//           data: {
//             email: oldUser.email,
//             username: oldUser.username,
//             name: oldUser.nama,
//             password: hashedPassword,
//             role: role,
//             isActive: true,
//           },
//         });

//         console.log(`✅ Migrated user: ${oldUser.username} (${role})`);
        
//         if (role === 'SUPER_ADMIN' || role === 'OPERATOR') {
//           console.log(`🔑 Temporary password for ${oldUser.username}: ${tempPassword}`);
//         }

//       } catch (error) {
//         console.error(`❌ Failed to migrate user ${oldUser.username}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate elections
//    */
//   async migrateElections() {
//     console.log('🔄 Migrating elections...');
    
//     for (const kategori of sampleData.kategori) {
//       try {
//         const startDate = new Date(`${kategori.tgl_mulai} ${kategori.jam_mulai}`);
//         const endDate = new Date(`${kategori.tgl_berakhir} ${kategori.jam_berakhir}`);

//         let voterType: 'NIK' | 'NPM' | 'NISN' | 'CUSTOM' = 'CUSTOM';
//         switch (kategori.tipe_user) {
//           case 'NIK':
//             voterType = 'NIK';
//             break;
//           case 'NPM':
//             voterType = 'NPM';
//             break;
//           case 'NISN':
//             voterType = 'NISN';
//             break;
//         }

//         const now = new Date();
//         let status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' = 'DRAFT';
        
//         if (now < startDate) {
//           status = 'PUBLISHED';
//         } else if (now >= startDate && now <= endDate) {
//           status = 'ACTIVE';
//         } else {
//           status = 'COMPLETED';
//         }

//         await prisma.election.create({
//           data: {
//             name: kategori.nama_kategori,
//             accessUrl: kategori.akses_url,
//             status: status,
//             startDate: startDate,
//             endDate: endDate,
//             voterType: voterType,
//             requiresAuth: true,
//             allowQuickCount: kategori.id === 5,
//             showResults: true,
//           },
//         });

//         console.log(`✅ Migrated election: ${kategori.nama_kategori}`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate election ${kategori.nama_kategori}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate electoral districts
//    */
//   async migrateElectoralDistricts() {
//     console.log('🔄 Migrating electoral districts...');
    
//     for (const dapil of sampleData.dapil) {
//       try {
//         // Find the corresponding election
//         const election = await prisma.election.findFirst({
//           where: { 
//             name: { contains: 'Garut' } // Match Pilkada Garut
//           }
//         });

//         if (!election) {
//           console.warn(`⚠️  No election found for dapil ${dapil.nama_dapil}`);
//           continue;
//         }

//         await prisma.electoralDistrict.create({
//           data: {
//             name: dapil.nama_dapil,
//             description: `Daerah Pemilihan ${dapil.nama_dapil}`,
//             isActive: true,
//             electionId: election.id,
//           },
//         });

//         console.log(`✅ Migrated electoral district: ${dapil.nama_dapil}`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate electoral district ${dapil.nama_dapil}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate candidates
//    */
//   async migrateCandidates() {
//     console.log('🔄 Migrating candidates...');
    
//     for (const kandidat of sampleData.kandidat) {
//       try {
//         // Find the corresponding election
//         let election;
//         if (kandidat.id_kategori === 5) {
//           election = await prisma.election.findFirst({
//             where: { name: { contains: 'Garut' } }
//           });
//         } else if (kandidat.id_kategori === 2) {
//           election = await prisma.election.findFirst({
//             where: { name: { contains: 'BEM' } }
//           });
//         }

//         if (!election) {
//           console.warn(`⚠️  No election found for candidate ${kandidat.nama}`);
//           continue;
//         }

//         await prisma.candidate.create({
//           data: {
//             name: kandidat.nama,
//             candidateNumber: kandidat.no_urut,
//             description: 'Visi dan misi untuk kemajuan bersama',
//             isActive: true,
//             electionId: election.id,
//           },
//         });

//         console.log(`✅ Migrated candidate: ${kandidat.nama} (#${kandidat.no_urut})`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate candidate ${kandidat.nama}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate voter registrations
//    */
//   async migrateVoterRegistrations() {
//     console.log('🔄 Migrating voter registrations...');
    
//     for (const pemilihan of sampleData.pemilihan) {
//       try {
//         // Find the corresponding election
//         const election = await prisma.election.findFirst({
//           where: { name: { contains: 'Garut' } }
//         });

//         if (!election) {
//           console.warn(`⚠️  No election found for voter ${pemilihan.nama}`);
//           continue;
//         }

//         // Find electoral district
//         const district = await prisma.electoralDistrict.findFirst({
//           where: { 
//             electionId: election.id,
//             name: sampleData.dapil.find(d => d.id === pemilihan.id_dapil)?.nama_dapil || 'DAPIL 1'
//           }
//         });

//         await prisma.voterRegistration.create({
//           data: {
//             voterIdentifier: pemilihan.id_user,
//             name: pemilihan.nama,
//             gender: pemilihan.jk === 'L' ? 'MALE' : 'FEMALE',
//             hasVoted: false,
//             electionId: election.id,
//             electoralDistrictId: district?.id,
//           },
//         });

//         console.log(`✅ Migrated voter registration: ${pemilihan.nama}`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate voter registration ${pemilihan.nama}:`, error);
//       }
//     }
//   }

//   /**
//    * Add system configuration
//    */
//   async addConfiguration() {
//     console.log('🔄 Adding system configuration...');
    
//     const configurations = [
//       { key: 'app_title', value: 'E-VOTING', description: 'Application title' },
//       { key: 'app_subtitle', value: 'DAFTAR PEMILIHAN', description: 'Application subtitle' },
//       { key: 'max_photo_size', value: '400', description: 'Maximum photo size in KB' },
//       { key: 'app_icon', value: 'LOGO_PROZEN_WEB.png', description: 'Application icon' },
//     ];

//     for (const config of configurations) {
//       try {
//         await prisma.configuration.create({
//           data: {
//             key: config.key,
//             value: config.value,
//             description: config.description,
//             isPublic: true,
//           },
//         });
//       } catch (error) {
//         console.error(`❌ Failed to add configuration ${config.key}:`, error);
//       }
//     }

//     console.log(`✅ Added system configuration`);
//   }

//   /**
//    * Run the complete migration
//    */
//   async runMigration() {
//     try {
//       console.log('🚀 Starting simplified data migration...\n');

//       // Clear existing data
//       console.log('🧹 Clearing existing data...');
//       await prisma.vote.deleteMany();
//       await prisma.voterRegistration.deleteMany();
//       await prisma.candidate.deleteMany();
//       await prisma.electoralDistrict.deleteMany();
//       await prisma.election.deleteMany();
//       await prisma.refreshToken.deleteMany();
//       await prisma.auditLog.deleteMany();
//       await prisma.configuration.deleteMany();
//       await prisma.user.deleteMany();

//       // Run migrations
//       await this.migrateUsers();
//       await this.migrateElections();
//       await this.migrateElectoralDistricts();
//       await this.migrateCandidates();
//       await this.migrateVoterRegistrations();
//       await this.addConfiguration();

//       console.log('\n🎉 Migration completed successfully!');
//       console.log('\n⚠️  IMPORTANT NOTES:');
//       console.log('1. All users have temporary passwords (temp_username_123)');
//       console.log('2. Users should reset passwords on first login');
//       console.log('3. This is sample data based on the original system');

//     } catch (error) {
//       console.error('💥 Migration failed:', error);
//       throw error;
//     } finally {
//       await prisma.$disconnect();
//     }
//   }
// }

// // Run the migration
// if (require.main === module) {
//   const migrator = new SimpleMigrator();
//   migrator.runMigration().catch(console.error);
// }

// export default SimpleMigrator;
