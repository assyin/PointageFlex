// Types principaux pour PointageFlex

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN_RH' | 'MANAGER' | 'EMPLOYEE';
  tenantId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  department?: Department;
  site?: Site;
  team?: Team;
  currentShift?: Shift;
  isActive: boolean;
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  isNightShift: boolean;
  color?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  rotationEnabled: boolean;
  rotationCycleDays?: number;
  employees?: Employee[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee: Employee;
  timestamp: string;
  type: 'IN' | 'OUT' | 'BREAK';
  method: 'FINGERPRINT' | 'FACE_RECOGNITION' | 'RFID_BADGE' | 'QR_CODE' | 'PIN_CODE' | 'MOBILE_GPS' | 'MANUAL';
  hasAnomaly: boolean;
  anomalyType?: string;
  site?: Site;
}

export interface Leave {
  id: string;
  employee: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'PENDING' | 'MANAGER_APPROVED' | 'HR_APPROVED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
}

export interface Overtime {
  id: string;
  employee: Employee;
  date: string;
  hours: number;
  isNightShift: boolean;
  rate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Schedule {
  id: string;
  employee: Employee;
  shift: Shift;
  date: string;
  team?: Team;
}

export interface DashboardStats {
  today: {
    date: string;
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
  };
  currentShifts: Array<{
    shift: string;
    planned: number;
    present: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
