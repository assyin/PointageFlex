// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterTenantDto {
  companyName: string;
  slug: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  phone?: string;
  country?: string;
  timezone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User Types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_RH = 'ADMIN_RH',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Employee Types
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export interface Employee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  dateOfBirth?: string;
  hireDate: string;
  position?: string;
  status: EmployeeStatus;
  tenantId: string;
  userId?: string;
  departmentId?: string;
  siteId?: string;
  shiftId?: string;
  teamId?: string;
  isEligibleForOvertime?: boolean;
  maxOvertimeHoursPerMonth?: number;
  maxOvertimeHoursPerWeek?: number;
  overtimeEligibilityNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  department?: Department;
  site?: Site;
  shift?: Shift;
  team?: Team;
}

export interface CreateEmployeeDto {
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  dateOfBirth?: string;
  hireDate: string;
  position?: string;
  departmentId?: string;
  siteId?: string;
  shiftId?: string;
  teamId?: string;
  isEligibleForOvertime?: boolean;
  maxOvertimeHoursPerMonth?: number;
  maxOvertimeHoursPerWeek?: number;
  overtimeEligibilityNotes?: string;
}

// Attendance Types
export enum AttendanceType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END',
}

export enum AttendanceSource {
  BIOMETRIC = 'BIOMETRIC',
  RFID = 'RFID',
  FACIAL = 'FACIAL',
  QR_CODE = 'QR_CODE',
  PIN = 'PIN',
  MOBILE_GPS = 'MOBILE_GPS',
  MANUAL = 'MANUAL',
  IMPORT = 'IMPORT',
}

export enum AttendanceStatus {
  VALID = 'VALID',
  PENDING_CORRECTION = 'PENDING_CORRECTION',
  CORRECTED = 'CORRECTED',
}

export interface Attendance {
  id: string;
  employeeId: string;
  type: AttendanceType;
  timestamp: string;
  source: AttendanceSource;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
  status: AttendanceStatus;
  hoursWorked?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeMinutes?: number;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

// Shift Types
export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  CUSTOM = 'CUSTOM',
}

export interface Shift {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  color?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftDto {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  color?: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  rotationEnabled: boolean;
  rotationCycleDays?: number;
  tenantId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  manager?: Employee;
  members?: Employee[];
  _count?: {
    members: number;
  };
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  rotationEnabled: boolean;
  rotationCycleDays?: number;
  managerId?: string;
}

// Leave Types
export enum LeaveStatus {
  PENDING = 'PENDING',
  MANAGER_APPROVED = 'MANAGER_APPROVED',
  HR_APPROVED = 'HR_APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays?: number;
  requiresDocument: boolean;
  color?: string;
  tenantId: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  attachment?: string;
  status: LeaveStatus;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  rejectionReason?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  leaveType?: LeaveType;
}

export interface CreateLeaveDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  attachment?: string;
}

// Overtime Types
export enum OvertimeType {
  STANDARD = 'STANDARD',
  NIGHT = 'NIGHT',
  HOLIDAY = 'HOLIDAY',
  EMERGENCY = 'EMERGENCY',
}

export enum OvertimeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  RECOVERED = 'RECOVERED',
}

export interface Overtime {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  type: OvertimeType;
  status: OvertimeStatus;
  source: AttendanceSource;
  convertedToRecovery: boolean;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

// Department & Site Types
export interface Department {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  city?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Terminal/Device Types
export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
  OFFLINE = 'OFFLINE',
}

export interface AttendanceDevice {
  id: string;
  name: string;
  deviceId: string;
  ipAddress?: string;
  location?: string;
  status: DeviceStatus;
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  lastSync?: string;
  tenantId: string;
  siteId?: string;
  createdAt: string;
  updatedAt: string;
  site?: Site;
}

export interface CreateDeviceDto {
  name: string;
  deviceId: string;
  ipAddress?: string;
  location?: string;
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  siteId?: string;
}

// Audit Log Types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
  createdAt: string;
  user?: User;
}

// Report Types
export enum ReportType {
  ATTENDANCE = 'ATTENDANCE',
  ABSENCES = 'ABSENCES',
  OVERTIME = 'OVERTIME',
  PLANNING = 'PLANNING',
  PAYROLL = 'PAYROLL',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Filter Types
export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: AttendanceType;
  source?: AttendanceSource;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface EmployeeFilters {
  search?: string;
  status?: EmployeeStatus;
  departmentId?: string;
  siteId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

export interface LeaveFilters {
  employeeId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditFilters {
  userId?: string;
  action?: AuditAction;
  entity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
