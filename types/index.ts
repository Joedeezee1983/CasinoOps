import type { UserRole, ShiftStatus, IssueType, TaskStatus, MachineStatus, PartsOrderStatus, TaskSection } from '@prisma/client'

export type { UserRole, ShiftStatus, IssueType, TaskStatus, MachineStatus, PartsOrderStatus, TaskSection }

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ShiftWithTasks {
  id: string
  techId: string
  startTime: Date
  endTime: Date | null
  status: ShiftStatus
  createdAt: Date
  tech: { id: string; name: string; email: string; role: UserRole }
  tasks: TaskSummary[]
}

export interface TaskSummary {
  id: string
  shiftId: string
  machineNumber: string
  location: string
  issueType: IssueType
  actionTaken: string
  status: TaskStatus
  section: TaskSection
  createdAt: Date
}

export interface MachineSummary {
  id: string
  machineNumber: string
  location: string
  type: string
  status: MachineStatus
  createdAt: Date
}

export interface ShiftReportSummary {
  id: string
  shiftId: string
  aiSummary: string
  sentAt: Date | null
  createdAt: Date
  shift: {
    startTime: Date
    endTime: Date | null
    tech: { name: string }
  }
}

export interface CreateTaskInput {
  machineNumber: string
  location: string
  issueType: IssueType
  actionTaken: string
  status: TaskStatus
  section: TaskSection
}

export interface CreateMachineInput {
  machineNumber: string
  location: string
  type: string
}

export interface DownMachineEntry {
  machineNumber: string
  location: string
  techName: string
  createdAt: Date
}

export interface BriefingData {
  activeShifts: ShiftWithTasks[]
  recentReports: ShiftReportSummary[]
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface ShiftExportData {
  id: string
  startTime: Date
  endTime: Date | null
  techName: string
  tasks: Array<{
    machineNumber: string
    location: string
    issueType: IssueType
    actionTaken: string
    status: TaskStatus
    section: TaskSection
  }>
  aiSummary: string | null
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
}
