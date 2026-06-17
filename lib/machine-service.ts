import { db } from '@/lib/db'
import type { MachineSummary, CreateMachineInput } from '@/types'
import type { MachineStatus } from '@prisma/client'

/**
 * Returns all machines in the registry ordered by machine number.
 */
export async function getAllMachines(): Promise<MachineSummary[]> {
  return db.machine.findMany({
    select: {
      id: true,
      machineNumber: true,
      location: true,
      type: true,
      status: true,
      createdAt: true,
    },
    orderBy: { machineNumber: 'asc' },
  })
}

/**
 * Creates a new machine in the registry.
 * Throws if a machine with the same number already exists.
 */
export async function createMachine(input: CreateMachineInput): Promise<MachineSummary> {
  return db.machine.create({
    data: {
      machineNumber: input.machineNumber,
      location: input.location,
      type: input.type,
      status: 'OPERATIONAL',
    },
    select: {
      id: true,
      machineNumber: true,
      location: true,
      type: true,
      status: true,
      createdAt: true,
    },
  })
}

/**
 * Updates the operational status of a machine.
 */
export async function updateMachineStatus(
  machineId: string,
  status: MachineStatus
): Promise<MachineSummary> {
  return db.machine.update({
    where: { id: machineId },
    data: { status },
    select: {
      id: true,
      machineNumber: true,
      location: true,
      type: true,
      status: true,
      createdAt: true,
    },
  })
}
