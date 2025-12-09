export interface BranchCreatedEvent {
  eventType: 'branch.created';
  version: string;
  timestamp: string;
  branchId: number;
  clientId: number;
  nombre: string;
  createdBy?: number;
}

export class BranchCreatedEventFactory {
  static create(branch: { id: number; clientId: number; nombre: string }, createdBy?: number): BranchCreatedEvent {
    return {
      eventType: 'branch.created',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      branchId: branch.id,
      clientId: branch.clientId,
      nombre: branch.nombre,
      createdBy
    };
  }
}

