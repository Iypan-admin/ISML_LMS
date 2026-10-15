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

export const mockStudentFees: StudentFeeRecord[] = [
  {
    id: 'sf-01',
    studentId: 'std-01',
    rollNo: '24CS0101',
    name: 'Bharathi M',
    email: 'bharathi.m@loyola.edu',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science & Data Analytics',
    department: 'Computer Science',
    batch: 'Batch 2024-2027',
    currentSemester: 3,
    totalFees: 48000,
    concessionAmount: 5000,
    netPayable: 43000,
    paidAmount: 43000,
    outstandingBalance: 0,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-10-02T11:30:00Z',
    installments: [
      { number: 1, dueDate: '2026-07-15', amount: 21500, status: 'PAID', paidDate: '2026-07-10', receiptNo: 'RCP-2026-8812' },
      { number: 2, dueDate: '2026-10-15', amount: 21500, status: 'PAID', paidDate: '2026-10-02', receiptNo: 'RCP-2026-9204' },
    ],
  },
  {
    id: 'sf-02',
    studentId: 'std-02',
    rollNo: '24CS0102',
    name: 'Karthik Subramanian',
    email: 'karthik.s@loyola.edu',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science & Data Analytics',
    department: 'Computer Science',
    batch: 'Batch 2024-2027',
    currentSemester: 3,
    totalFees: 48000,
    concessionAmount: 0,
    netPayable: 48000,
    paidAmount: 24000,
    outstandingBalance: 24000,
    paymentStatus: 'PARTIAL',
    lastPaymentDate: '2026-07-14T09:15:00Z',
    installments: [
      { number: 1, dueDate: '2026-07-15', amount: 24000, status: 'PAID', paidDate: '2026-07-14', receiptNo: 'RCP-2026-8830' },
      { number: 2, dueDate: '2026-10-15', amount: 24000, status: 'OVERDUE' },
    ],
  },
  {
    id: 'sf-03',
    studentId: 'std-03',
    rollNo: '24CS0103',
    name: 'Ananya Ramesh',
    email: 'ananya.r@loyola.edu',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science & Data Analytics',
    department: 'Computer Science',
    batch: 'Batch 2024-2027',
    currentSemester: 3,
    totalFees: 48000,
    concessionAmount: 10000,
    netPayable: 38000,
    paidAmount: 0,
    outstandingBalance: 38000,
    paymentStatus: 'OVERDUE',
    installments: [
      { number: 1, dueDate: '2026-07-15', amount: 19000, status: 'OVERDUE' },
      { number: 2, dueDate: '2026-10-15', amount: 19000, status: 'PENDING' },
    ],
  },
  {
    id: 'sf-04',
    studentId: 'std-04',
    rollNo: '24BC0201',
    name: 'Pravin Kumar V',
    email: 'pravin.k@loyola.edu',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Com Corporate Secretaryship',
    department: 'Commerce & Management',
    batch: 'Batch 2024-2027',
    currentSemester: 3,
    totalFees: 38000,
    concessionAmount: 0,
    netPayable: 38000,
    paidAmount: 38000,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-09-28T14:20:00Z',
    outstandingBalance: 0,
    installments: [
      { number: 1, dueDate: '2026-07-15', amount: 19000, status: 'PAID', paidDate: '2026-07-12', receiptNo: 'RCP-2026-8805' },
      { number: 2, dueDate: '2026-10-15', amount: 19000, status: 'PAID', paidDate: '2026-09-28', receiptNo: 'RCP-2026-9180' },
    ],
  },
  {
    id: 'sf-05',
    studentId: 'std-05',
    rollNo: '25CS0110',
    name: 'Deepika S',
    email: 'deepika.s@mcc.edu',
    collegeId: 'inst-02',
    collegeName: 'Madras Christian College (Autonomous)',
    program: 'B.Sc Computer Science & Data Analytics',
    department: 'Computer Science',
    batch: 'Batch 2025-2028',
    currentSemester: 1,
    totalFees: 52000,
    concessionAmount: 0,
    netPayable: 52000,
    paidAmount: 52000,
    paymentStatus: 'PAID',
    lastPaymentDate: '2026-08-01T10:00:00Z',
    outstandingBalance: 0,
    installments: [
      { number: 1, dueDate: '2026-08-05', amount: 52000, status: 'PAID', paidDate: '2026-08-01', receiptNo: 'RCP-2026-7991' },
    ],
  },
  {
    id: 'sf-06',
    studentId: 'std-06',
    rollNo: '25CS0111',
    name: 'Rahul Venkat',
    email: 'rahul.v@mcc.edu',
    collegeId: 'inst-02',
    collegeName: 'Madras Christian College (Autonomous)',
    program: 'B.Sc Computer Science & Data Analytics',
    department: 'Computer Science',
    batch: 'Batch 2025-2028',
    currentSemester: 1,
    totalFees: 52000,
    concessionAmount: 12000,
    netPayable: 40000,
    paidAmount: 20000,
    paymentStatus: 'PARTIAL',
    lastPaymentDate: '2026-08-04T16:10:00Z',
    outstandingBalance: 20000,
    installments: [
      { number: 1, dueDate: '2026-08-05', amount: 20000, status: 'PAID', paidDate: '2026-08-04', receiptNo: 'RCP-2026-8022' },
      { number: 2, dueDate: '2026-11-15', amount: 20000, status: 'PENDING' },
    ],
  },
];

export const mockTransactions: TransactionRecord[] = [
  {
    id: 'tx-101',
    receiptNo: 'RCP-2026-9204',
    studentId: 'std-01',
    studentName: 'Bharathi M',
    rollNo: '24CS0101',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science',
    semester: 3,
    amount: 21500,
    paymentMethod: 'UPI',
    channelType: 'RAZORPAY_GATEWAY',
    gatewayRef: 'pay_rzp_98102941',
    status: 'SUCCESS',
    timestamp: '2026-10-02T11:30:00Z',
    remarks: 'Auto-verified online via Razorpay PG (PhonePe UPI)',
    requiresFinanceApproval: false,
  },
  {
    id: 'tx-102',
    receiptNo: 'RCP-2026-9180',
    studentId: 'std-04',
    studentName: 'Pravin Kumar V',
    rollNo: '24BC0201',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Com Corporate Sec',
    semester: 3,
    amount: 19000,
    paymentMethod: 'NET_BANKING',
    channelType: 'PAYMENT_LINK',
    gatewayRef: 'plink_rzp_77881023',
    status: 'SUCCESS',
    timestamp: '2026-09-28T14:20:00Z',
    remarks: 'Paid via SMS Payment Link dispatched by Finance Office (HDFC NetBanking)',
    requiresFinanceApproval: false,
  },
  {
    id: 'tx-103',
    receiptNo: 'RCP-2026-9099',
    studentId: 'std-02',
    studentName: 'Karthik Subramanian',
    rollNo: '24CS0102',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science',
    semester: 3,
    amount: 24000,
    paymentMethod: 'CREDIT_CARD',
    channelType: 'RAZORPAY_GATEWAY',
    gatewayRef: 'pay_rzp_fail_9901',
    status: 'FAILED',
    timestamp: '2026-10-06T18:45:00Z',
    remarks: 'Razorpay Card Authentication Timeout (Bank OTP dropped)',
    requiresFinanceApproval: false,
  },
  {
    id: 'tx-104',
    receiptNo: 'RCP-2026-8950',
    studentId: 'std-05',
    studentName: 'Deepika S',
    rollNo: '25CS0110',
    collegeId: 'inst-02',
    collegeName: 'Madras Christian College (Autonomous)',
    program: 'B.Sc Computer Science',
    semester: 1,
    amount: 52000,
    paymentMethod: 'DEMAND_DRAFT',
    channelType: 'OFFLINE_COUNTER',
    gatewayRef: 'SBI-DD-450192',
    status: 'SUCCESS',
    timestamp: '2026-08-01T10:00:00Z',
    remarks: 'Physical DD submitted at campus counter. Approved by Finance Officer.',
    requiresFinanceApproval: true,
    approvalStatus: 'APPROVED',
    approvedBy: 'Mr. Joseph Raj (Finance Manager)',
    approvedAt: '2026-08-01T11:15:00Z',
    challanNumber: 'CHL-SBI-8950',
    bankBranchName: 'SBI Tambaram Branch',
    depositDate: '2026-08-01',
  },
  {
    id: 'tx-105',
    receiptNo: 'RCP-2026-8911',
    studentId: 'std-06',
    studentName: 'Rahul Venkat',
    rollNo: '25CS0111',
    collegeId: 'inst-02',
    collegeName: 'Madras Christian College (Autonomous)',
    program: 'B.Sc Computer Science',
    semester: 1,
    amount: 20000,
    paymentMethod: 'UPI',
    channelType: 'RAZORPAY_GATEWAY',
    gatewayRef: 'pay_rzp_gpay_2209',
    status: 'SUCCESS',
    timestamp: '2026-08-04T16:10:00Z',
    remarks: 'Razorpay Standard Checkout (Google Pay UPI)',
    requiresFinanceApproval: false,
  },
  {
    id: 'tx-106',
    receiptNo: 'RCP-2026-PEND-01',
    studentId: 'std-03',
    studentName: 'Sneha Kumari R',
    rollNo: '24CS0103',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science',
    semester: 3,
    amount: 21500,
    paymentMethod: 'CASH',
    channelType: 'OFFLINE_COUNTER',
    gatewayRef: 'CASH-REC-1092',
    status: 'PENDING',
    timestamp: '2026-10-09T09:15:00Z',
    remarks: 'Cash handed at Treasury Counter 2. Awaiting Finance Manager verification & official sign-off.',
    requiresFinanceApproval: true,
    approvalStatus: 'PENDING',
    offlineProofDocument: 'Counter_Voucher_1092.pdf',
    depositDate: '2026-10-09',
  },
  {
    id: 'tx-107',
    receiptNo: 'RCP-2026-PEND-02',
    studentId: 'std-07',
    studentName: 'Vigneshwaran P',
    rollNo: '24BC0205',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Com Corporate Sec',
    semester: 3,
    amount: 19000,
    paymentMethod: 'BANK_CHALLAN',
    channelType: 'OFFLINE_COUNTER',
    gatewayRef: 'IOB-CHL-66109',
    status: 'PENDING',
    timestamp: '2026-10-09T10:45:00Z',
    remarks: 'Single Student Bank Challan stamped by Indian Overseas Bank. Pending receipt validation.',
    requiresFinanceApproval: true,
    approvalStatus: 'PENDING',
    challanNumber: 'IOB-CHL-66109',
    bankBranchName: 'IOB Nungambakkam Branch',
    depositDate: '2026-10-08',
  },
  {
    id: 'tx-108',
    receiptNo: 'RCP-BULK-2026-B01',
    studentId: 'COHORT-BULK-01',
    studentName: 'B.Sc CS Cohort (15 Students)',
    rollNo: '24CS-COHORT-15',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science',
    semester: 3,
    amount: 322500,
    paymentMethod: 'BANK_CHALLAN',
    channelType: 'BANK_CHALLAN_BULK',
    gatewayRef: 'HDFC-BULK-CMS-202609',
    status: 'PENDING',
    timestamp: '2026-10-09T11:00:00Z',
    remarks: 'College Finance Manager initiated Bulk Bank Challan deposit for 15 Students via HDFC CMS. Requires Manager Verification.',
    requiresFinanceApproval: true,
    approvalStatus: 'PENDING',
    challanNumber: 'HDFC-CHALLAN-BATCH-9941',
    bankBranchName: 'HDFC College Campus Corporate Branch',
    depositDate: '2026-10-09',
    isBulkChallanBatch: true,
    bulkBatchCode: 'CMS-BATCH-2026-OCT-01',
    bulkStudentCount: 15,
  },
];

export const mockRefunds: RefundRequest[] = [
  {
    id: 'ref-01',
    refundCode: 'REF-2026-0041',
    studentId: 'std-08',
    studentName: 'Sanjay Kumar R',
    rollNo: '25BC0309',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Com Corporate Sec',
    originalAmountPaid: 38000,
    refundRequestedAmount: 38000,
    deductionCharges: 1000,
    netRefundAmount: 37000,
    reason: 'ADMISSION_WITHDRAWAL',
    requestDate: '2026-10-04T12:00:00Z',
    status: 'UNDER_VERIFICATION',
    bankDetails: {
      accountHolder: 'Sanjay Kumar R',
      accountNumber: '5010023910291',
      ifscCode: 'HDFC0000240',
      bankName: 'HDFC Bank, Nungambakkam Branch',
    },
  },
  {
    id: 'ref-02',
    refundCode: 'REF-2026-0042',
    studentId: 'std-09',
    studentName: 'Meenakshi Sundaram',
    rollNo: '24CS0155',
    collegeId: 'inst-01',
    collegeName: 'Loyola College of Arts & Science',
    program: 'B.Sc Computer Science',
    originalAmountPaid: 24000,
    refundRequestedAmount: 24000,
    deductionCharges: 0,
    netRefundAmount: 24000,
    reason: 'DOUBLE_PAYMENT',
    requestDate: '2026-10-06T09:30:00Z',
    status: 'SUBMITTED',
    bankDetails: {
      accountHolder: 'Meenakshi S',
      accountNumber: '30491029481',
      ifscCode: 'SBIN0001042',
      bankName: 'State Bank of India',
    },
  },
  {
    id: 'ref-03',
    refundCode: 'REF-2026-0039',
    studentId: 'std-10',
    studentName: 'Kavitha P',
    rollNo: '25CS0199',
    collegeId: 'inst-02',
    collegeName: 'Madras Christian College (Autonomous)',
    program: 'B.Sc Computer Science',
    originalAmountPaid: 52000,
    refundRequestedAmount: 15000,
    deductionCharges: 0,
    netRefundAmount: 15000,
    reason: 'SCHOLARSHIP_RETROACTIVE',
    requestDate: '2026-09-20T15:00:00Z',
    status: 'DISBURSED',
    bankDetails: {
      accountHolder: 'Kavitha P',
      accountNumber: '920010049281',
      ifscCode: 'UTIB0000088',
      bankName: 'Axis Bank, Tambaram',
    },
  },
];
