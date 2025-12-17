-- AlterTable: Add new fields to Overtime table
-- Add rejectionReason column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Overtime' AND column_name = 'rejectionReason'
  ) THEN
    ALTER TABLE "Overtime" ADD COLUMN "rejectionReason" TEXT;
  END IF;
END $$;

-- Add notes column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Overtime' AND column_name = 'notes'
  ) THEN
    ALTER TABLE "Overtime" ADD COLUMN "notes" TEXT;
  END IF;
END $$;

-- Create OvertimeType enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OvertimeType') THEN
    CREATE TYPE "OvertimeType" AS ENUM ('STANDARD', 'NIGHT', 'HOLIDAY', 'EMERGENCY');
  END IF;
END $$;

-- Add type column with default value (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Overtime' AND column_name = 'type'
  ) THEN
    ALTER TABLE "Overtime" ADD COLUMN "type" "OvertimeType" NOT NULL DEFAULT 'STANDARD';
  END IF;
END $$;

-- Add new values to OvertimeStatus enum (if not exists)
DO $$
BEGIN
  -- Check if PAID value exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'OvertimeStatus' AND e.enumlabel = 'PAID'
  ) THEN
    ALTER TYPE "OvertimeStatus" ADD VALUE 'PAID';
  END IF;

  -- Check if RECOVERED value exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'OvertimeStatus' AND e.enumlabel = 'RECOVERED'
  ) THEN
    ALTER TYPE "OvertimeStatus" ADD VALUE 'RECOVERED';
  END IF;
END $$;

-- AlterTable: Add new fields to TenantSettings table
-- Add recoveryConversionRate column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'TenantSettings' AND column_name = 'recoveryConversionRate'
  ) THEN
    ALTER TABLE "TenantSettings" ADD COLUMN "recoveryConversionRate" DECIMAL(65,30) NOT NULL DEFAULT 1.0;
  END IF;
END $$;

-- Add recoveryExpiryDays column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'TenantSettings' AND column_name = 'recoveryExpiryDays'
  ) THEN
    ALTER TABLE "TenantSettings" ADD COLUMN "recoveryExpiryDays" INTEGER NOT NULL DEFAULT 90;
  END IF;
END $$;

-- Create index on Overtime.type (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'Overtime' AND indexname = 'Overtime_type_idx'
  ) THEN
    CREATE INDEX "Overtime_type_idx" ON "Overtime"("type");
  END IF;
END $$;
