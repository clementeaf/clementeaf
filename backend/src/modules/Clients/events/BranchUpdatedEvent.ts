export interface BranchUpdatedEvent {
  eventType: 'branch.updated';
  version: string;
  timestamp: string;
  branchId: number;
  clientId: number;
  nombre: string;
  updatedBy?: number;
  updatedFields?: string[];
}

export class BranchUpdatedEventFactory {
  static create(branch: { id: number; clientId: number; nombre: string }, updatedBy?: number, updatedFields?: string[]): BranchUpdatedEvent {
    return {
      eventType: 'branch.updated',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      branchId: branch.id,
      clientId: branch.clientId,
      nombre: branch.nombre,
      updatedBy,
      updatedFields
    };
  }
}

