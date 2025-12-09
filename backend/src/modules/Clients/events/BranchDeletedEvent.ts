export interface BranchDeletedEvent {
  eventType: 'branch.deleted';
  version: string;
  timestamp: string;
  branchId: number;
  clientId: number;
  nombre: string;
  deletedBy?: number;
}

export class BranchDeletedEventFactory {
  static create(branch: { id: number; clientId: number; nombre: string }, deletedBy?: number): BranchDeletedEvent {
    return {
      eventType: 'branch.deleted',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      branchId: branch.id,
      clientId: branch.clientId,
      nombre: branch.nombre,
      deletedBy
    };
  }
}

