-- AlterTable: Add overtime eligibility and limits to Employee
-- Add isEligibleForOvertime column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Employee' AND column_name = 'isEligibleForOvertime'
  ) THEN
    ALTER TABLE "Employee" ADD COLUMN "isEligibleForOvertime" BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add maxOvertimeHoursPerMonth column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Employee' AND column_name = 'maxOvertimeHoursPerMonth'
  ) THEN
    ALTER TABLE "Employee" ADD COLUMN "maxOvertimeHoursPerMonth" DECIMAL(65,30);
  END IF;
END $$;

-- Add maxOvertimeHoursPerWeek column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Employee' AND column_name = 'maxOvertimeHoursPerWeek'
  ) THEN
    ALTER TABLE "Employee" ADD COLUMN "maxOvertimeHoursPerWeek" DECIMAL(65,30);
  END IF;
END $$;

-- Add overtimeEligibilityNotes column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Employee' AND column_name = 'overtimeEligibilityNotes'
  ) THEN
    ALTER TABLE "Employee" ADD COLUMN "overtimeEligibilityNotes" TEXT;
  END IF;
END $$;

-- AlterTable: Add overtimeMinimumThreshold to TenantSettings
-- Add overtimeMinimumThreshold column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'TenantSettings' AND column_name = 'overtimeMinimumThreshold'
  ) THEN
    ALTER TABLE "TenantSettings" ADD COLUMN "overtimeMinimumThreshold" INTEGER NOT NULL DEFAULT 30;
  END IF;
END $$;

