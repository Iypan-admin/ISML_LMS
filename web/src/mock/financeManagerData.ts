// ============================================================================
// ISML COLLEGE LMS — FINANCE MANAGER MOCK DATA & TRANSACTION LEDGERS
// College-Centric Mock Records for Students, Fees, Transactions & Refunds
// ============================================================================

export interface StudentFeeRecord {
  id: string;
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  avatar?: string;
  collegeId: string;
  collegeName: string;
  program: string;
  department: string;
  batch: string;
  currentSemester: number;
  totalFees: number;
  concessionAmount: number;
  netPayable: number;
  paidAmount: number;
  outstandingBalance: number;
  installments: {
    number: number;
    dueDate: string;
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
    paidDate?: string;
    receiptNo?: string;
  }[];
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  lastPaymentDate?: string;
}

export type PaymentChannelType = 
  | 'RAZORPAY_GATEWAY' 
  | 'OFFLINE_COUNTER' 
  | 'PAYMENT_LINK' 
  | 'BANK_CHALLAN_BULK' 
  | 'NEFT_RTGS';

export interface TransactionRecord {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  collegeId: string;
  collegeName: string;
  program: string;
  semester: number;
  amount: number;
  paymentMethod: 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'DEMAND_DRAFT' | 'CASH' | 'BANK_CHALLAN' | 'NEFT_RTGS';
  channelType?: PaymentChannelType;
  gatewayRef: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'VERIFIED';
  timestamp: string;
  remarks?: string;
  // Offline & Bank Challan Approval Properties
  requiresFinanceApproval?: boolean;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  offlineProofDocument?: string;
  challanNumber?: string;
  bankBranchName?: string;
  depositDate?: string;
  isBulkChallanBatch?: boolean;
  bulkBatchCode?: string;
  bulkStudentCount?: number;
}

export interface RefundRequest {
  id: string;
  refundCode: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  collegeId: string;
  collegeName: string;
  program: string;
  originalAmountPaid: number;
  refundRequestedAmount: number;
  deductionCharges: number;
  netRefundAmount: number;
  reason: 'ADMISSION_WITHDRAWAL' | 'DOUBLE_PAYMENT' | 'SCHOLARSHIP_RETROACTIVE' | 'COURSE_TRANSFER';
  requestDate: string;
  status: 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export const mockStudentFees: StudentFeeRecord[] = [];

export const mockTransactions: SettlementTransaction[] = [];

export const mockRefunds: RefundRecord[] = [];
