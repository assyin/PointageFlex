-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'CANCELLED', 'SUSPENDED_BY_LEAVE');

-- AlterTable: Change status from String to ScheduleStatus
ALTER TABLE "Schedule"
  ALTER COLUMN "status" TYPE "ScheduleStatus" USING "status"::"ScheduleStatus",
  ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';

-- AlterTable: Add new suspension tracking fields
ALTER TABLE "Schedule"
  ADD COLUMN "suspendedByLeaveId" TEXT,
  ADD COLUMN "suspendedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Schedule_suspendedByLeaveId_idx" ON "Schedule"("suspendedByLeaveId");

-- AddForeignKey
ALTER TABLE "Schedule"
  ADD CONSTRAINT "Schedule_suspendedByLeaveId_fkey"
  FOREIGN KEY ("suspendedByLeaveId")
  REFERENCES "Leave"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
