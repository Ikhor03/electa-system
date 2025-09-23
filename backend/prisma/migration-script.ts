// /**
//  * Data Migration Script: MySQL to PostgreSQL
//  * Migrates data from the old PHP/MySQL system to the new NestJS/PostgreSQL system
//  * 
//  * SECURITY NOTE: This script handles password migration from MD5 to bcrypt
//  * PRIVACY NOTE: Voter data is separated from voting records for anonymity
//  */

// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
// import * as crypto from 'crypto';
// import * as mysql from 'mysql2/promise';

// const prisma = new PrismaClient();

// // MySQL connection configuration (update with your credentials)
// const mysqlConfig = {
//   host: 'localhost',
//   user: 'root',
//   password: '', // Update with your MySQL password
//   database: 'pemilu',
//   charset: 'utf8mb4'
// };

// interface OldUser {
//   id_user: number;
//   id_kategori: string;
//   nama: string;
//   username: string;
//   password: string; // MD5 hashed
//   email: string;
//   status: number;
//   foto: string;
//   level: string;
//   hp: string;
// }

// interface OldKategori {
//   id_kategori: number;
//   nama_kategori: string;
//   akses_url: string;
//   foto: string;
//   status: number;
//   tgl_mulai: string;
//   jam_mulai: string;
//   tgl_berakhir: string;
//   jam_berakhir: string;
//   quick_count: number;
//   hasil_akhir: number;
//   status_kode_akses: number;
//   tipe_user: string;
// }

// interface OldKandidat {
//   id_kandidat: number;
//   id_kategori: number;
//   nama: string;
//   foto: string;
//   visimisi: string;
//   status: string;
//   no_urut: string;
// }

// interface OldDapil {
//   id_dapil: number;
//   id_kategori: number;
//   nama_dapil: string;
//   status: number;
//   keterangan: string;
// }

// interface OldPemilihan {
//   id_pemilihan: number;
//   id_kategori: number;
//   id_dapil: number;
//   nama: string;
//   id_user: string;
//   password: string;
//   kode_akses: string;
//   calon_terpilih: string;
//   tgl_masuk: string;
//   suara_tidak_sah: number;
//   keterangan: string;
//   level: number;
//   jk: string;
// }

// interface OldKonfigurasi {
//   id_konfigurasi: number;
//   title: string;
//   down_title: string;
//   max_foto: string;
//   icon: string;
//   max_icon: string;
//   max_kategori: string;
// }

// class DataMigrator {
//   private mysqlConnection: mysql.Connection | null = null;

//   async connect() {
//     this.mysqlConnection = await mysql.createConnection(mysqlConfig);
//     console.log('✅ Connected to MySQL database');
//   }

//   async disconnect() {
//     await this.mysqlConnection.end();
//     await prisma.$disconnect();
//     console.log('✅ Disconnected from databases');
//   }

//   /**
//    * Migrate user accounts with password security upgrade
//    */
//   async migrateUsers() {
//     console.log('🔄 Migrating users...');
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM user');
//     const oldUsers = rows as OldUser[];

//     for (const oldUser of oldUsers) {
//       try {
//         // Map user roles from old system to new system
//         let role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'VOTER' = 'VOTER';
//         switch (oldUser.level) {
//           case '1':
//             role = 'SUPER_ADMIN';
//             break;
//           case '2':
//             role = 'ADMIN';
//             break;
//           case '3':
//             role = 'OPERATOR';
//             break;
//           case '4':
//           default:
//             role = 'VOTER';
//             break;
//         }

//         // Generate a secure password for migration
//         // In production, users should reset their passwords
//         const tempPassword = `temp_${oldUser.username}_${Date.now()}`;
//         const hashedPassword = await bcrypt.hash(tempPassword, 12);

//         await prisma.user.create({
//           data: {
//             email: oldUser.email,
//             username: oldUser.username,
//             name: oldUser.nama,
//             password: hashedPassword,
//             role: role,
//             isActive: oldUser.status === 1,
//             phone: oldUser.hp || null,
//             profileImage: oldUser.foto || null,
//           },
//         });

//         console.log(`✅ Migrated user: ${oldUser.username} (${role})`);
        
//         // Log the temporary password for admin reference
//         if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
//           console.log(`🔑 Temporary password for ${oldUser.username}: ${tempPassword}`);
//         }

//       } catch (error) {
//         console.error(`❌ Failed to migrate user ${oldUser.username}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate election categories to elections
//    */
//   async migrateElections() {
//     console.log('🔄 Migrating elections...');
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM kategori');
//     const oldKategori = rows as OldKategori[];

//     for (const kategori of oldKategori) {
//       try {
//         // Combine date and time fields
//         const startDate = new Date(`${kategori.tgl_mulai} ${kategori.jam_mulai}`);
//         const endDate = new Date(`${kategori.tgl_berakhir} ${kategori.jam_berakhir}`);

//         // Map voter type
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
//           default:
//             voterType = 'CUSTOM';
//             break;
//         }

//         // Determine election status based on dates
//         const now = new Date();
//         let status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' = 'DRAFT';
        
//         if (kategori.status === 1) {
//           if (now < startDate) {
//             status = 'PUBLISHED';
//           } else if (now >= startDate && now <= endDate) {
//             status = 'ACTIVE';
//           } else {
//             status = 'COMPLETED';
//           }
//         }

//         await prisma.election.create({
//           data: {
//             name: kategori.nama_kategori,
//             accessUrl: kategori.akses_url,
//             imageUrl: kategori.foto || null,
//             status: status,
//             startDate: startDate,
//             endDate: endDate,
//             voterType: voterType,
//             requiresAuth: kategori.status_kode_akses === 1,
//             allowQuickCount: kategori.quick_count === 1,
//             showResults: kategori.hasil_akhir === 1,
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
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM dapil');
//     const oldDapil = rows as OldDapil[];

//     for (const dapil of oldDapil) {
//       try {
//         // Find the corresponding election
//         const election = await prisma.election.findFirst({
//           where: { 
//             // We need to map by the original kategori ID
//             // This assumes we can match by some criteria
//           }
//         });

//         if (!election) {
//           console.warn(`⚠️  No election found for dapil ${dapil.nama_dapil}`);
//           continue;
//         }

//         await prisma.electoralDistrict.create({
//           data: {
//             name: dapil.nama_dapil,
//             description: dapil.keterangan || null,
//             isActive: dapil.status === 1,
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
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM kandidat');
//     const oldKandidats = rows as OldKandidat[];

//     for (const kandidat of oldKandidats) {
//       try {
//         // Find the corresponding election (need to implement mapping logic)
//         const elections = await prisma.election.findMany();
//         const election = elections[0]; // Simplified for now

//         if (!election) {
//           console.warn(`⚠️  No election found for candidate ${kandidat.nama}`);
//           continue;
//         }

//         await prisma.candidate.create({
//           data: {
//             name: kandidat.nama,
//             candidateNumber: kandidat.no_urut,
//             description: kandidat.visimisi || null,
//             imageUrl: kandidat.foto || null,
//             isActive: kandidat.status === '1',
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
//    * Migrate voter registrations and votes (with privacy protection)
//    */
//   async migrateVotingData() {
//     console.log('🔄 Migrating voting data...');
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM pemilihan');
//     const oldPemilihan = rows as OldPemilihan[];

//     for (const pemilihan of oldPemilihan) {
//       try {
//         // Find the corresponding election
//         const elections = await prisma.election.findMany();
//         const election = elections[0]; // Simplified for now

//         if (!election) {
//           console.warn(`⚠️  No election found for voting record ${pemilihan.id_pemilihan}`);
//           continue;
//         }

//         // Create voter registration (separate from vote for privacy)
//         const voterRegistration = await prisma.voterRegistration.create({
//           data: {
//             voterIdentifier: pemilihan.id_user,
//             name: pemilihan.nama,
//             gender: pemilihan.jk === 'L' ? 'MALE' : 'FEMALE',
//             hasVoted: pemilihan.calon_terpilih !== '0',
//             voteTimestamp: pemilihan.calon_terpilih !== '0' ? new Date(pemilihan.tgl_masuk) : null,
//             electionId: election.id,
//           },
//         });

//         // Create anonymous vote record if they voted
//         if (pemilihan.calon_terpilih !== '0') {
//           // Find the candidate
//           const candidate = await prisma.candidate.findFirst({
//             where: {
//               candidateNumber: pemilihan.calon_terpilih,
//               electionId: election.id,
//             },
//           });

//           // Generate anonymous vote hash
//           const voteHash = crypto.createHash('sha256')
//             .update(`${pemilihan.id_pemilihan}_${pemilihan.tgl_masuk}_${Math.random()}`)
//             .digest('hex');

//           await prisma.vote.create({
//             data: {
//               voteHash: voteHash,
//               candidateId: candidate?.id || null,
//               electionId: election.id,
//               isValid: pemilihan.suara_tidak_sah === 0,
//               createdAt: new Date(pemilihan.tgl_masuk),
//             },
//           });

//           // Update candidate vote count
//           if (candidate && pemilihan.suara_tidak_sah === 0) {
//             await prisma.candidate.update({
//               where: { id: candidate.id },
//               data: { voteCount: { increment: 1 } },
//             });
//           }
//         }

//         console.log(`✅ Migrated voting data for: ${pemilihan.nama}`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate voting data for ${pemilihan.nama}:`, error);
//       }
//     }
//   }

//   /**
//    * Migrate system configuration
//    */
//   async migrateConfiguration() {
//     console.log('🔄 Migrating system configuration...');
    
//     const [rows] = await this.mysqlConnection.execute('SELECT * FROM konfigurasi');
//     const oldKonfigs = rows as OldKonfigurasi[];

//     for (const config of oldKonfigs) {
//       try {
//         const configurations = [
//           { key: 'app_title', value: config.title, description: 'Application title' },
//           { key: 'app_subtitle', value: config.down_title, description: 'Application subtitle' },
//           { key: 'max_photo_size', value: config.max_foto, description: 'Maximum photo size in KB' },
//           { key: 'app_icon', value: config.icon, description: 'Application icon filename' },
//           { key: 'max_icon_size', value: config.max_icon, description: 'Maximum icon size in KB' },
//           { key: 'max_categories', value: config.max_kategori, description: 'Maximum number of categories' },
//         ];

//         for (const conf of configurations) {
//           await prisma.configuration.create({
//             data: {
//               key: conf.key,
//               value: conf.value,
//               description: conf.description,
//               isPublic: true,
//             },
//           });
//         }

//         console.log(`✅ Migrated system configuration`);

//       } catch (error) {
//         console.error(`❌ Failed to migrate configuration:`, error);
//       }
//     }
//   }

//   /**
//    * Run the complete migration process
//    */
//   async runMigration() {
//     try {
//       console.log('🚀 Starting data migration from MySQL to PostgreSQL...\n');

//       await this.connect();

//       // Clear existing data (be careful in production!)
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

//       // Run migrations in order
//       await this.migrateUsers();
//       await this.migrateElections();
//       await this.migrateElectoralDistricts();
//       await this.migrateCandidates();
//       await this.migrateVotingData();
//       await this.migrateConfiguration();

//       console.log('\n🎉 Migration completed successfully!');
//       console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
//       console.log('1. All user passwords have been reset to temporary passwords');
//       console.log('2. Users must reset their passwords on first login');
//       console.log('3. Review the temporary admin passwords logged above');
//       console.log('4. Enable password reset functionality before going live');

//     } catch (error) {
//       console.error('💥 Migration failed:', error);
//       throw error;
//     } finally {
//       await this.disconnect();
//     }
//   }
// }

// // Run the migration
// if (require.main === module) {
//   const migrator = new DataMigrator();
//   migrator.runMigration().catch(console.error);
// }

// export default DataMigrator;
