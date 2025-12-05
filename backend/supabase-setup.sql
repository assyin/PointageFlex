-- =====================================================
-- POINTAGEFLEX - SCRIPT SQL COMPLET POUR SUPABASE
-- =====================================================
-- Ce script crée toutes les tables nécessaires pour PointageFlex
-- Exécutez-le dans le SQL Editor de Supabase
-- =====================================================

-- Nettoyage (optionnel - décommentez si vous voulez tout réinitialiser)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- =====================================================
-- ÉTAPE 1: CRÉATION DES TYPES ENUM
-- =====================================================

CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_RH', 'MANAGER', 'EMPLOYEE');

CREATE TYPE "ReplacementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "DeviceType" AS ENUM (
  'FINGERPRINT',
  'FACE_RECOGNITION',
  'RFID_BADGE',
  'QR_CODE',
  'PIN_CODE',
  'MOBILE_GPS',
  'MANUAL'
);

CREATE TYPE "AttendanceType" AS ENUM ('IN', 'OUT', 'BREAK');

CREATE TYPE "LeaveStatus" AS ENUM (
  'PENDING',
  'MANAGER_APPROVED',
  'HR_APPROVED',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "NotificationType" AS ENUM (
  'SHIFT_CHANGE',
  'LEAVE_APPROVED',
  'LEAVE_REJECTED',
  'OVERTIME_APPROVED',
  'SCHEDULE_UPDATED',
  'REPLACEMENT_REQUEST',
  'ALERT_LEGAL',
  'SYSTEM'
);

-- =====================================================
-- ÉTAPE 2: CRÉATION DES TABLES
-- =====================================================

-- Table: Tenant (Entreprises)
CREATE TABLE "Tenant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "companyName" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "logo" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "country" TEXT NOT NULL DEFAULT 'MA',
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Casablanca'
);

-- Table: TenantSettings
CREATE TABLE "TenantSettings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT UNIQUE NOT NULL,
  "workDaysPerWeek" INTEGER NOT NULL DEFAULT 6,
  "maxWeeklyHours" DECIMAL(65,30) NOT NULL DEFAULT 44,
  "lateToleranceMinutes" INTEGER NOT NULL DEFAULT 15,
  "breakDuration" INTEGER NOT NULL DEFAULT 60,
  "alertWeeklyHoursExceeded" BOOLEAN NOT NULL DEFAULT true,
  "alertInsufficientRest" BOOLEAN NOT NULL DEFAULT true,
  "alertNightWorkRepetitive" BOOLEAN NOT NULL DEFAULT true,
  "alertMinimumStaffing" BOOLEAN NOT NULL DEFAULT true,
  "annualLeaveDays" INTEGER NOT NULL DEFAULT 18,
  "leaveApprovalLevels" INTEGER NOT NULL DEFAULT 2,
  "overtimeRate" DECIMAL(65,30) NOT NULL DEFAULT 1.25,
  "nightShiftRate" DECIMAL(65,30) NOT NULL DEFAULT 1.50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: User
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "avatar" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
  CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "User_tenantId_email_key" UNIQUE ("tenantId", "email")
);

-- Table: Site
CREATE TABLE "Site" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "latitude" DECIMAL(65,30),
  "longitude" DECIMAL(65,30),
  CONSTRAINT "Site_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: Department
CREATE TABLE "Department" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: Shift
CREATE TABLE "Shift" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "breakDuration" INTEGER NOT NULL DEFAULT 60,
  "isNightShift" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT,
  CONSTRAINT "Shift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: Team
CREATE TABLE "Team" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "managerId" TEXT,
  "rotationEnabled" BOOLEAN NOT NULL DEFAULT false,
  "rotationCycleDays" INTEGER,
  CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: Employee
CREATE TABLE "Employee" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "matricule" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "address" TEXT,
  "photo" TEXT,
  "position" TEXT NOT NULL,
  "hireDate" TIMESTAMP(3) NOT NULL,
  "contractType" TEXT,
  "siteId" TEXT,
  "departmentId" TEXT,
  "teamId" TEXT,
  "currentShiftId" TEXT,
  "fingerprintData" TEXT,
  "faceData" TEXT,
  "rfidBadge" TEXT,
  "qrCode" TEXT,
  "pinCode" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "userId" TEXT UNIQUE,
  CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Employee_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id"),
  CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id"),
  CONSTRAINT "Employee_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id"),
  CONSTRAINT "Employee_currentShiftId_fkey" FOREIGN KEY ("currentShiftId") REFERENCES "Shift"("id"),
  CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
  CONSTRAINT "Employee_tenantId_matricule_key" UNIQUE ("tenantId", "matricule")
);

-- Table: Schedule
CREATE TABLE "Schedule" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "teamId" TEXT,
  "shiftId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "customStartTime" TEXT,
  "customEndTime" TEXT,
  "notes" TEXT,
  CONSTRAINT "Schedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Schedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  CONSTRAINT "Schedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id"),
  CONSTRAINT "Schedule_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id"),
  CONSTRAINT "Schedule_employeeId_date_key" UNIQUE ("employeeId", "date")
);

-- Table: ShiftReplacement
CREATE TABLE "ShiftReplacement" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "originalEmployeeId" TEXT NOT NULL,
  "replacementEmployeeId" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "reason" TEXT,
  "status" "ReplacementStatus" NOT NULL DEFAULT 'PENDING',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "ShiftReplacement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "ShiftReplacement_originalEmployeeId_fkey" FOREIGN KEY ("originalEmployeeId") REFERENCES "Employee"("id"),
  CONSTRAINT "ShiftReplacement_replacementEmployeeId_fkey" FOREIGN KEY ("replacementEmployeeId") REFERENCES "Employee"("id"),
  CONSTRAINT "ShiftReplacement_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id")
);

-- Table: AttendanceDevice
CREATE TABLE "AttendanceDevice" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "siteId" TEXT,
  "name" TEXT NOT NULL,
  "deviceId" TEXT UNIQUE NOT NULL,
  "deviceType" "DeviceType" NOT NULL,
  "ipAddress" TEXT,
  "apiKey" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "AttendanceDevice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AttendanceDevice_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id")
);

-- Table: Attendance
CREATE TABLE "Attendance" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "siteId" TEXT,
  "deviceId" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "type" "AttendanceType" NOT NULL,
  "method" "DeviceType" NOT NULL,
  "latitude" DECIMAL(65,30),
  "longitude" DECIMAL(65,30),
  "hasAnomaly" BOOLEAN NOT NULL DEFAULT false,
  "anomalyType" TEXT,
  "anomalyNote" TEXT,
  "isCorrected" BOOLEAN NOT NULL DEFAULT false,
  "correctedBy" TEXT,
  "correctedAt" TIMESTAMP(3),
  "rawData" JSONB,
  CONSTRAINT "Attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  CONSTRAINT "Attendance_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id"),
  CONSTRAINT "Attendance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AttendanceDevice"("id")
);

-- Table: LeaveType
CREATE TABLE "LeaveType" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "isPaid" BOOLEAN NOT NULL DEFAULT true,
  "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
  "maxDaysPerYear" INTEGER,
  CONSTRAINT "LeaveType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: Leave
CREATE TABLE "Leave" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "leaveTypeId" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "days" DECIMAL(65,30) NOT NULL,
  "reason" TEXT,
  "document" TEXT,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "managerApprovedBy" TEXT,
  "managerApprovedAt" TIMESTAMP(3),
  "managerComment" TEXT,
  "hrApprovedBy" TEXT,
  "hrApprovedAt" TIMESTAMP(3),
  "hrComment" TEXT,
  CONSTRAINT "Leave_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  CONSTRAINT "Leave_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id")
);

-- Table: Overtime
CREATE TABLE "Overtime" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "hours" DECIMAL(65,30) NOT NULL,
  "isNightShift" BOOLEAN NOT NULL DEFAULT false,
  "rate" DECIMAL(65,30) NOT NULL DEFAULT 1.25,
  "convertedToRecovery" BOOLEAN NOT NULL DEFAULT false,
  "recoveryId" TEXT,
  "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "Overtime_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Overtime_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

-- Table: Recovery
CREATE TABLE "Recovery" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "hours" DECIMAL(65,30) NOT NULL,
  "source" TEXT,
  "usedHours" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "remainingHours" DECIMAL(65,30) NOT NULL,
  "expiryDate" TIMESTAMP(3),
  CONSTRAINT "Recovery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Recovery_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

-- Table: Holiday
CREATE TABLE "Holiday" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Holiday_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Table: AuditLog
CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValues" JSONB,
  "newValues" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Table: Notification
CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Notification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE
);

-- =====================================================
-- ÉTAPE 3: CRÉATION DES INDEX
-- =====================================================

CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");
CREATE INDEX "TenantSettings_tenantId_idx" ON "TenantSettings"("tenantId");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");
CREATE INDEX "Employee_siteId_idx" ON "Employee"("siteId");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX "Employee_teamId_idx" ON "Employee"("teamId");
CREATE INDEX "Site_tenantId_idx" ON "Site"("tenantId");
CREATE INDEX "Department_tenantId_idx" ON "Department"("tenantId");
CREATE INDEX "Shift_tenantId_idx" ON "Shift"("tenantId");
CREATE INDEX "Team_tenantId_idx" ON "Team"("tenantId");
CREATE INDEX "Schedule_tenantId_idx" ON "Schedule"("tenantId");
CREATE INDEX "Schedule_date_idx" ON "Schedule"("date");
CREATE INDEX "Schedule_employeeId_idx" ON "Schedule"("employeeId");
CREATE INDEX "ShiftReplacement_tenantId_idx" ON "ShiftReplacement"("tenantId");
CREATE INDEX "ShiftReplacement_date_idx" ON "ShiftReplacement"("date");
CREATE INDEX "AttendanceDevice_tenantId_idx" ON "AttendanceDevice"("tenantId");
CREATE INDEX "Attendance_tenantId_idx" ON "Attendance"("tenantId");
CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");
CREATE INDEX "Attendance_timestamp_idx" ON "Attendance"("timestamp");
CREATE INDEX "LeaveType_tenantId_idx" ON "LeaveType"("tenantId");
CREATE INDEX "Leave_tenantId_idx" ON "Leave"("tenantId");
CREATE INDEX "Leave_employeeId_idx" ON "Leave"("employeeId");
CREATE INDEX "Leave_startDate_idx" ON "Leave"("startDate");
CREATE INDEX "Overtime_tenantId_idx" ON "Overtime"("tenantId");
CREATE INDEX "Overtime_employeeId_idx" ON "Overtime"("employeeId");
CREATE INDEX "Recovery_tenantId_idx" ON "Recovery"("tenantId");
CREATE INDEX "Recovery_employeeId_idx" ON "Recovery"("employeeId");
CREATE INDEX "Holiday_tenantId_idx" ON "Holiday"("tenantId");
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");
CREATE INDEX "Notification_employeeId_idx" ON "Notification"("employeeId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- =====================================================
-- ÉTAPE 4: FONCTION TRIGGER POUR updatedAt
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur toutes les tables avec updatedAt
CREATE TRIGGER update_tenant_updated_at BEFORE UPDATE ON "Tenant" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON "TenantSettings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_updated_at BEFORE UPDATE ON "Employee" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_updated_at BEFORE UPDATE ON "Site" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_department_updated_at BEFORE UPDATE ON "Department" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_updated_at BEFORE UPDATE ON "Shift" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON "Team" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON "Schedule" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_replacement_updated_at BEFORE UPDATE ON "ShiftReplacement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_device_updated_at BEFORE UPDATE ON "AttendanceDevice" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON "Attendance" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_type_updated_at BEFORE UPDATE ON "LeaveType" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_updated_at BEFORE UPDATE ON "Leave" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_overtime_updated_at BEFORE UPDATE ON "Overtime" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recovery_updated_at BEFORE UPDATE ON "Recovery" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holiday_updated_at BEFORE UPDATE ON "Holiday" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_updated_at BEFORE UPDATE ON "Notification" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TERMINÉ !
-- =====================================================
-- Toutes les tables ont été créées avec succès
-- Vous pouvez maintenant utiliser votre backend PointageFlex
-- =====================================================

SELECT 'PointageFlex database schema created successfully!' as status;
