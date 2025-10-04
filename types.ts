
export enum ContractStatus {
  ACTIVE = 'Đang hiệu lực',
  LIQUIDATED = 'Đã thanh lý',
  CANCELLED = 'Đã hủy',
}

export interface HistoryEntry {
  timestamp: Date;
  action: string;
  details?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  ward: string;
  ownerName: string;
  sheetNumber: string;
  plotNumber: string;
  isBranch: boolean;
  status: ContractStatus;
  createdAt: Date;
  liquidationNumber?: string;
  liquidationDate?: Date;
  isLiquidationCancelled?: boolean;
  notes?: string;
  cancellationReason?: string;
  history: HistoryEntry[];
}