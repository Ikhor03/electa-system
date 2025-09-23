/*
  Warnings:

  - The values [CANDIDATE] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `elections` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `elections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateNumber,electionId]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessUrl]` on the table `elections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voteHash]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `candidateNumber` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessUrl` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voterType` to the `elections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voteHash` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."VoterType" AS ENUM ('NIK', 'NPM', 'NISN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VOTER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'VOTER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_userId_fkey";

-- DropIndex
DROP INDEX "public"."votes_userId_electionId_key";

-- AlterTable
ALTER TABLE "public"."candidates" ADD COLUMN     "candidateNumber" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."elections" DROP COLUMN "isActive",
DROP COLUMN "title",
ADD COLUMN     "accessUrl" TEXT NOT NULL,
ADD COLUMN     "allowQuickCount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "maxVotesPerUser" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showResults" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "public"."ElectionStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "voterType" "public"."VoterType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."votes" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "voteHash" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "candidateId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."electoral_districts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "electionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "electoral_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."voter_registrations" (
    "id" SERIAL NOT NULL,
    "voterIdentifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "voteTimestamp" TIMESTAMP(3),
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "electionId" INTEGER NOT NULL,
    "electoralDistrictId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voter_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configurations" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "electoral_districts_electionId_idx" ON "public"."electoral_districts"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "electoral_districts_name_electionId_key" ON "public"."electoral_districts"("name", "electionId");

-- CreateIndex
CREATE INDEX "voter_registrations_electionId_idx" ON "public"."voter_registrations"("electionId");

-- CreateIndex
CREATE INDEX "voter_registrations_voterIdentifier_idx" ON "public"."voter_registrations"("voterIdentifier");

-- CreateIndex
CREATE INDEX "voter_registrations_hasVoted_idx" ON "public"."voter_registrations"("hasVoted");

-- CreateIndex
CREATE UNIQUE INDEX "voter_registrations_voterIdentifier_electionId_key" ON "public"."voter_registrations"("voterIdentifier", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_key_key" ON "public"."configurations"("key");

-- CreateIndex
CREATE INDEX "configurations_key_idx" ON "public"."configurations"("key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "public"."refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "candidates_electionId_idx" ON "public"."candidates"("electionId");

-- CreateIndex
CREATE INDEX "candidates_isActive_idx" ON "public"."candidates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_candidateNumber_electionId_key" ON "public"."candidates"("candidateNumber", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "elections_accessUrl_key" ON "public"."elections"("accessUrl");

-- CreateIndex
CREATE INDEX "elections_status_idx" ON "public"."elections"("status");

-- CreateIndex
CREATE INDEX "elections_startDate_endDate_idx" ON "public"."elections"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "elections_accessUrl_idx" ON "public"."elections"("accessUrl");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "votes_voteHash_key" ON "public"."votes"("voteHash");

-- CreateIndex
CREATE INDEX "votes_electionId_idx" ON "public"."votes"("electionId");

-- CreateIndex
CREATE INDEX "votes_createdAt_idx" ON "public"."votes"("createdAt");

-- CreateIndex
CREATE INDEX "votes_voteHash_idx" ON "public"."votes"("voteHash");

-- AddForeignKey
ALTER TABLE "public"."electoral_districts" ADD CONSTRAINT "electoral_districts_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voter_registrations" ADD CONSTRAINT "voter_registrations_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "public"."elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voter_registrations" ADD CONSTRAINT "voter_registrations_electoralDistrictId_fkey" FOREIGN KEY ("electoralDistrictId") REFERENCES "public"."electoral_districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
