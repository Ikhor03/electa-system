# 🗄️ Database Analysis Report - Phase 2 Migration

**Date**: September 23, 2025  
**Source**: MySQL Database from PHP CodeIgniter System  
**Target**: PostgreSQL with Prisma ORM  

## 📊 Executive Summary

The existing Pemilu system uses a MySQL database with 8 main tables. The schema analysis reveals several areas for improvement including security vulnerabilities, missing foreign key constraints, and performance optimization opportunities.

## 🔍 Existing Database Schema Analysis

### 📋 **Table Structure Overview**

| Table | Purpose | Records | Issues Identified |
|-------|---------|---------|-------------------|
| `user` | User accounts & authentication | 11 users | MD5 password hashing, no foreign keys |
| `kategori` | Election categories/types | 3 elections | Complex datetime handling |
| `kandidat` | Candidates information | 5 candidates | No foreign key constraints |
| `dapil` | Electoral districts | 4 districts | Missing relationships |
| `pemilihan` | Voting records | 4 votes | Poor normalization |
| `konfigurasi` | System configuration | 1 config | Static configuration |
| `limit_login` | Login attempt limits | 1 record | Basic security |
| `sessions` | PHP session management | 4 sessions | Will be replaced by JWT |

---

## 🔍 **Detailed Table Analysis**

### 1. **`user` Table** - User Management
```sql
CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `id_kategori` char(11) DEFAULT NULL,    -- Should be foreign key
  `nama` char(30) NOT NULL,
  `username` char(20) NOT NULL,
  `password` char(50) NOT NULL,           -- MD5 hashed (SECURITY RISK)
  `email` char(40) NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1,
  `foto` char(50) NOT NULL,
  `level` char(1) NOT NULL,               -- Role system (1=admin, 2=voter, etc.)
  `hp` char(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ **CRITICAL**: MD5 password hashing (easily crackable)
- ❌ Missing foreign key for `id_kategori`
- ❌ No unique constraint on `email`
- ❌ No timestamps for account creation/updates
- ❌ Level system using char instead of enum

**Sample Data:**
- Admin: `superadmin` with MD5 password `0192023a7bbd73250516f069df18b500`
- Users with levels 1 (admin), 3 (operator), 4 (voter)

### 2. **`kategori` Table** - Election Categories
```sql
CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` char(150) NOT NULL,
  `akses_url` char(20) NOT NULL,          -- Unique access URL
  `foto` char(50) NOT NULL,
  `status` int(1) NOT NULL,
  `tgl_mulai` date NOT NULL,              -- Start date
  `jam_mulai` time NOT NULL,              -- Start time
  `tgl_berakhir` date NOT NULL,           -- End date
  `jam_berakhir` time NOT NULL,           -- End time
  `quick_count` int(1) NOT NULL,          -- Quick count feature
  `hasil_akhir` int(1) NOT NULL,          -- Final results
  `status_kode_akses` int(1) NOT NULL DEFAULT 1,
  `tipe_user` char(20) NOT NULL           -- User type (NIK, NPM, NISN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ Separate date and time fields (should be datetime)
- ❌ No timezone handling
- ❌ No validation for date ranges
- ❌ Boolean fields using int(1) instead of boolean

**Sample Data:**
- "Pemilihan Ketua BEM" (NPM-based voting)
- "Pemilihan Ketua Osis" (NISN-based voting)  
- "Pemilihan Kepala Daerah Garut" (NIK-based voting)

### 3. **`kandidat` Table** - Candidates
```sql
CREATE TABLE `kandidat` (
  `id_kandidat` int(11) NOT NULL,
  `id_kategori` int(11) NOT NULL,         -- Should be foreign key
  `nama` char(100) NOT NULL,
  `foto` char(50) NOT NULL,
  `visimisi` text DEFAULT NULL,           -- Vision & Mission
  `status` char(1) NOT NULL,              -- Active status
  `no_urut` char(3) NOT NULL              -- Candidate number
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ Missing foreign key constraint to `kategori`
- ❌ No unique constraint on `no_urut` per category
- ❌ Status using char instead of boolean
- ❌ No vote count tracking
- ❌ Missing timestamps

### 4. **`dapil` Table** - Electoral Districts
```sql
CREATE TABLE `dapil` (
  `id_dapil` int(11) NOT NULL,
  `id_kategori` int(11) NOT NULL,         -- Should be foreign key
  `nama_dapil` char(50) NOT NULL,
  `status` int(1) NOT NULL,
  `keterangan` char(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ Missing foreign key constraint
- ❌ No unique constraint on district names per category
- ❌ Limited description field

### 5. **`pemilihan` Table** - Voting Records
```sql
CREATE TABLE `pemilihan` (
  `id_pemilihan` int(11) NOT NULL,
  `id_kategori` int(11) NOT NULL,         -- Should be foreign key
  `id_dapil` int(11) NOT NULL,            -- Should be foreign key
  `nama` char(40) NOT NULL,
  `id_user` char(20) NOT NULL,            -- Voter ID (NIK/NPM/NISN)
  `password` char(40) DEFAULT NULL,       -- MD5 hashed
  `kode_akses` char(8) DEFAULT NULL,      -- Access code
  `calon_terpilih` char(3) NOT NULL DEFAULT '0',  -- Selected candidate
  `tgl_masuk` datetime NOT NULL DEFAULT current_timestamp(),
  `suara_tidak_sah` int(1) NOT NULL DEFAULT 0,    -- Invalid vote
  `keterangan` char(50) DEFAULT NULL,
  `level` int(1) NOT NULL DEFAULT 2,
  `jk` char(1) NOT NULL                   -- Gender
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ **CRITICAL**: Stores voter credentials (password) - privacy violation
- ❌ Missing foreign key constraints
- ❌ Poor normalization (mixing voter data with vote data)
- ❌ No unique constraint to prevent double voting
- ❌ MD5 password hashing

### 6. **`konfigurasi` Table** - System Configuration
```sql
CREATE TABLE `konfigurasi` (
  `id_konfigurasi` int(11) NOT NULL,
  `title` char(40) NOT NULL,
  `down_title` char(100) NOT NULL,
  `max_foto` char(6) NOT NULL,
  `icon` char(50) NOT NULL,
  `max_icon` char(3) NOT NULL,
  `max_kategori` char(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Issues Identified:**
- ❌ Static configuration (should use environment variables)
- ❌ No validation for numeric fields
- ❌ Limited extensibility

---

## 🚨 **Critical Security Issues**

### 1. **Password Security**
- **Issue**: MD5 hashing used for passwords
- **Risk**: MD5 is cryptographically broken and easily crackable
- **Solution**: Migrate to bcrypt with salt rounds ≥12

### 2. **Data Privacy**
- **Issue**: Voter passwords stored in `pemilihan` table
- **Risk**: Violates voter privacy and anonymity
- **Solution**: Separate voter authentication from voting records

### 3. **Missing Constraints**
- **Issue**: No foreign key constraints
- **Risk**: Data integrity issues, orphaned records
- **Solution**: Implement proper foreign key relationships

---

## 📈 **Performance Issues**

### 1. **Missing Indexes**
- No indexes on frequently queried fields
- No composite indexes for complex queries
- Session table lacks proper indexing

### 2. **Data Types**
- Using `char` instead of `varchar` wastes space
- Boolean values stored as `int(1)`
- Separate date/time fields instead of `datetime`

---

## 🎯 **Migration Strategy**

### **Phase 2A: Schema Design** ✅ In Progress
1. Design new PostgreSQL schema with Prisma
2. Implement proper foreign key relationships
3. Add security improvements (bcrypt, constraints)
4. Optimize data types and indexes

### **Phase 2B: Data Migration**
1. Create migration scripts for existing data
2. Hash password migration (MD5 → bcrypt)
3. Data validation and cleanup
4. Referential integrity checks

### **Phase 2C: Validation & Testing**
1. Data integrity verification
2. Performance testing
3. Security audit
4. Rollback procedures

---

## 🔄 **Proposed New Schema Structure**

### **Core Entities**
1. **Users** - Authentication and user management
2. **Elections** - Election configurations (replaces `kategori`)
3. **Candidates** - Candidate information
4. **ElectoralDistricts** - Geographic voting areas (replaces `dapil`)
5. **Votes** - Anonymous voting records
6. **VoterRegistrations** - Voter eligibility (separate from votes)

### **Security Enhancements**
- bcrypt password hashing
- JWT-based authentication
- Voter anonymity protection
- Audit logging
- Rate limiting

### **Performance Optimizations**
- Proper indexing strategy
- Optimized data types
- Query optimization
- Connection pooling

---

## 📊 **Data Volume Analysis**

| Table | Current Records | Estimated Growth | Migration Complexity |
|-------|----------------|------------------|---------------------|
| user | 11 | Low | Medium (password migration) |
| kategori | 3 | Low | Low |
| kandidat | 5 | Medium | Low |
| dapil | 4 | Low | Low |
| pemilihan | 4 | High | High (privacy concerns) |
| konfigurasi | 1 | None | Low |

---

## ✅ **Next Steps**

1. **Complete Prisma Schema Design** (In Progress)
2. **Create Migration Scripts**
3. **Implement Security Improvements**
4. **Data Validation & Testing**
5. **Performance Optimization**

---

## 🔗 **References**

- Source SQL: `pemilu.sql`
- PHP Models: `application/models/Admin_model.php`
- Target Schema: `backend/prisma/schema.prisma`
- Migration Scripts: `backend/prisma/migrations/`
