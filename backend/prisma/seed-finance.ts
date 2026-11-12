import { PrismaClient, FeeStructureTypeEnum, DurationPatternTypeEnum, FeeComponentTypeEnum, ApprovalStatusEnum } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Real Fee Structures, Ledgers, EMI Installments & Approvals...');

  // 1. Fetch Institutions
  const institutions = await prisma.institutions.findMany();
  const college = institutions.find(i => i.name.toLowerCase().includes('american') || i.name.toLowerCase().includes('college'));
  const school = institutions.find(i => i.name.toLowerCase().includes('sivakasi') || i.name.toLowerCase().includes('school'));

  const collegeId = college?.id || null;
  const schoolId = school?.id || null;

  console.log(`🏛️ College: ${college?.name} (${collegeId})`);
  console.log(`🏫 School: ${school?.name} (${schoolId})`);

  // 2. Fetch seeded courses from DB
  const courses = await prisma.courses.findMany();
  console.log(`📚 Found ${courses.length} courses in database`);

  // Clean old fee structures and ledgers
  await prisma.feePaymentTransactions.deleteMany({});
  await prisma.studentFeeLedgers.deleteMany({});
  await prisma.feeStructureComponents.deleteMany({});
  await prisma.feeStructures.deleteMany({});

  // 3. Create Enterprise Fee Structures for College & School Courses
  // Each fee structure has:
  // - Total amount
  // - Line items (Tuition, Language Lab Studio, Exam & Assessment, LMS & Speaking Platform)
  // - Status: Some APPROVED (ready for billing), Some PENDING (waiting Super Admin sign-off)
  // - EMI Installments structure (Term 1, Term 2, Term 3)
  
  const createdStructures: any[] = [];

  const feeConfigTemplates = [
    {
      keyword: 'French A1',
      instId: collegeId,
      instName: college?.name || 'The American College',
      code: 'FEESTR-COL-FR-A1',
      name: 'Higher Ed French A1 / L1 Term Fee',
      totalAmount: 18500,
      approvalStatus: ApprovalStatusEnum.APPROVED,
      components: [
        { name: 'DELF A1 Interactive Tuition Fee', type: FeeComponentTypeEnum.TUITION_FEE, amount: 11000, isMandatory: true },
        { name: 'Phonetics & Audio Lab Studio Access', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 3500, isMandatory: true },
        { name: 'Semester Assessment & Mock Certification', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 2500, isMandatory: true },
        { name: 'AI LSRW Speaking Platform License', type: FeeComponentTypeEnum.AI_SPEAKING_PLATFORM_FEE, amount: 1500, isMandatory: false },
      ],
      installments: [
        { title: 'Installment 1 (At Admission)', amount: 7500, dueDays: 15 },
        { title: 'Installment 2 (Mid-Term Review)', amount: 6000, dueDays: 45 },
        { title: 'Installment 3 (Final Assessment)', amount: 5000, dueDays: 75 },
      ]
    },
    {
      keyword: 'German A1',
      instId: collegeId,
      instName: college?.name || 'The American College',
      code: 'FEESTR-COL-DE-A1',
      name: 'Higher Ed German A1 / L1 Term Fee',
      totalAmount: 19500,
      approvalStatus: ApprovalStatusEnum.APPROVED,
      components: [
        { name: 'Goethe-Zertifikat A1 Tuition Fee', type: FeeComponentTypeEnum.TUITION_FEE, amount: 12000, isMandatory: true },
        { name: 'German Oral & Pronunciation Studio', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 3500, isMandatory: true },
        { name: 'CIA Periodic Assessment & Evaluation', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 2500, isMandatory: true },
        { name: 'Digital Courseware & Vocabulary Deck', type: FeeComponentTypeEnum.LSRW_COURSE_MATERIAL_FEE, amount: 1500, isMandatory: false },
      ],
      installments: [
        { title: 'Installment 1 (At Admission)', amount: 8000, dueDays: 15 },
        { title: 'Installment 2 (Mid-Term Review)', amount: 6500, dueDays: 45 },
        { title: 'Installment 3 (Final Assessment)', amount: 5000, dueDays: 75 },
      ]
    },
    {
      keyword: 'Spanish A1',
      instId: collegeId,
      instName: college?.name || 'The American College',
      code: 'FEESTR-COL-ES-A1',
      name: 'Higher Ed Spanish A1 / L1 Term Fee',
      totalAmount: 17500,
      approvalStatus: ApprovalStatusEnum.PENDING, // ⏳ PENDING SUPER ADMIN APPROVAL
      components: [
        { name: 'DELE A1 Conversational Tuition', type: FeeComponentTypeEnum.TUITION_FEE, amount: 10500, isMandatory: true },
        { name: 'Language Studio & Listening Station', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 3500, isMandatory: true },
        { name: 'End-Term Viva & Certificate Exam', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 2000, isMandatory: true },
        { name: 'Self-Paced Practice App Access', type: FeeComponentTypeEnum.AI_SPEAKING_PLATFORM_FEE, amount: 1500, isMandatory: false },
      ],
      installments: [
        { title: 'Installment 1 (At Admission)', amount: 7000, dueDays: 15 },
        { title: 'Installment 2 (Mid-Term Review)', amount: 5500, dueDays: 45 },
        { title: 'Installment 3 (Final Assessment)', amount: 5000, dueDays: 75 },
      ]
    },
    {
      keyword: 'Japanese N5',
      instId: collegeId,
      instName: college?.name || 'The American College',
      code: 'FEESTR-COL-JA-N5',
      name: 'Higher Ed Japanese N5 Kanji Track Fee',
      totalAmount: 22000,
      approvalStatus: ApprovalStatusEnum.PENDING, // ⏳ PENDING SUPER ADMIN APPROVAL
      components: [
        { name: 'JLPT N5 Script & Grammar Tuition', type: FeeComponentTypeEnum.TUITION_FEE, amount: 13500, isMandatory: true },
        { name: 'Kanji Writing Studio & Stroke Lab', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 4000, isMandatory: true },
        { name: 'JLPT Mock Drill & Evaluation', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 2500, isMandatory: true },
        { name: 'Native Speaker Listening Masterclass', type: FeeComponentTypeEnum.STUDENT_ACTIVITY_FEE, amount: 2000, isMandatory: false },
      ],
      installments: [
        { title: 'Installment 1 (At Admission)', amount: 9000, dueDays: 15 },
        { title: 'Installment 2 (Mid-Term Review)', amount: 7000, dueDays: 45 },
        { title: 'Installment 3 (Final Assessment)', amount: 6000, dueDays: 75 },
      ]
    },
    {
      keyword: 'Korean A1',
      instId: collegeId,
      instName: college?.name || 'The American College',
      code: 'FEESTR-COL-KO-A1',
      name: 'Higher Ed Korean A1 / L1 Term Fee',
      totalAmount: 18000,
      approvalStatus: ApprovalStatusEnum.APPROVED,
      components: [
        { name: 'Hangul Script & Spoken Korean Tuition', type: FeeComponentTypeEnum.TUITION_FEE, amount: 11000, isMandatory: true },
        { name: 'Language Studio Pronunciation Lab', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 3500, isMandatory: true },
        { name: 'Progress Review & Assessment', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 2000, isMandatory: true },
        { name: 'K-Culture Immersion & LMS Digital Kit', type: FeeComponentTypeEnum.LSRW_COURSE_MATERIAL_FEE, amount: 1500, isMandatory: false },
      ],
      installments: [
        { title: 'Installment 1 (At Admission)', amount: 7500, dueDays: 15 },
        { title: 'Installment 2 (Mid-Term Review)', amount: 5500, dueDays: 45 },
        { title: 'Installment 3 (Final Assessment)', amount: 5000, dueDays: 75 },
      ]
    },
    // School Tracks (Sivakasi Lions School)
    {
      keyword: 'French A1.1 School',
      instId: schoolId,
      instName: school?.name || 'Sivakasi Lions Matriculation Higher Secondary School',
      code: 'FEESTR-SCH-FR-A11',
      name: 'K-12 French A1.1 Foundation Annual Fee',
      totalAmount: 9500,
      approvalStatus: ApprovalStatusEnum.APPROVED,
      components: [
        { name: 'K-12 French Language Instruction', type: FeeComponentTypeEnum.TUITION_FEE, amount: 6000, isMandatory: true },
        { name: 'Phonetics & Audio Rhymes Studio', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 1500, isMandatory: true },
        { name: 'Interactive Worksheets & Activity Book', type: FeeComponentTypeEnum.LSRW_COURSE_MATERIAL_FEE, amount: 1200, isMandatory: true },
        { name: 'Quarterly Diagnostic Assessment', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 800, isMandatory: true },
      ],
      installments: [
        { title: 'Term 1 Installment (June)', amount: 4500, dueDays: 10 },
        { title: 'Term 2 Installment (October)', amount: 3000, dueDays: 60 },
        { title: 'Term 3 Installment (January)', amount: 2000, dueDays: 120 },
      ]
    },
    {
      keyword: 'German A1.1 School',
      instId: schoolId,
      instName: school?.name || 'Sivakasi Lions Matriculation Higher Secondary School',
      code: 'FEESTR-SCH-DE-A11',
      name: 'K-12 German A1.1 Foundation Annual Fee',
      totalAmount: 9800,
      approvalStatus: ApprovalStatusEnum.PENDING, // ⏳ PENDING SUPER ADMIN APPROVAL
      components: [
        { name: 'K-12 German Language Instruction', type: FeeComponentTypeEnum.TUITION_FEE, amount: 6200, isMandatory: true },
        { name: 'Interactive Audio & Listening Lab', type: FeeComponentTypeEnum.LAB_LANGUAGE_STUDIO_FEE, amount: 1600, isMandatory: true },
        { name: 'Illustrated Workbook & Flashcards', type: FeeComponentTypeEnum.LSRW_COURSE_MATERIAL_FEE, amount: 1200, isMandatory: true },
        { name: 'Assessment & Progress Report Card', type: FeeComponentTypeEnum.EXAMINATION_FEE, amount: 800, isMandatory: true },
      ],
      installments: [
        { title: 'Term 1 Installment (June)', amount: 4800, dueDays: 10 },
        { title: 'Term 2 Installment (October)', amount: 3000, dueDays: 60 },
        { title: 'Term 3 Installment (January)', amount: 2000, dueDays: 120 },
      ]
    }
  ];

  for (const t of feeConfigTemplates) {
    const matchingCourse = courses.find(c => c.name.toLowerCase().includes(t.keyword.toLowerCase()));
    const courseId = matchingCourse?.id || null;

    const fsRecord = await prisma.feeStructures.create({
      data: {
        institutionId: t.instId,
        courseId: courseId,
        structureName: t.name,
        structureType: FeeStructureTypeEnum.DURATION_BASED,
        durationPattern: DurationPatternTypeEnum.STANDARD_PACING,
        totalFeeAmount: t.totalAmount,
        currency: 'INR',
        academicYear: '2026–2027',
        isDefault: true,
        isActive: true,
        approvalStatus: t.approvalStatus,
        approvalRequestId: t.approvalStatus === ApprovalStatusEnum.PENDING ? `REQ-FIN-${Date.now().toString().slice(-6)}` : null,
      }
    });

    // Create components
    for (let idx = 0; idx < t.components.length; idx++) {
      const comp = t.components[idx];
      await prisma.feeStructureComponents.create({
        data: {
          feeStructureId: fsRecord.id,
          componentType: comp.type,
          name: comp.name,
          amount: comp.amount,
          isMandatory: comp.isMandatory,
          displayOrder: idx + 1,
        }
      });
    }

    createdStructures.push({
      ...fsRecord,
      code: t.code,
      institutionName: t.instName,
      courseName: matchingCourse?.name || t.keyword,
      courseCode: matchingCourse?.code || 'CRS',
      components: t.components,
      installments: t.installments,
    });
  }

  console.log(`✅ Created ${createdStructures.length} Enterprise Fee Structures`);

  // 4. Create Student Fee Ledgers for our 12 real students
  const students = await prisma.studentProfiles.findMany({
    include: { user: true, tenant: true }
  });
  console.log(`👨‍🎓 Enrolled Real Students in DB: ${students.length}`);

  const studentLedgers: any[] = [];
  const transactions: any[] = [];

  for (const std of students) {
    const isCol = std.tenant?.name?.toLowerCase().includes('american') || std.tenant?.name?.toLowerCase().includes('college');
    
    // Pick appropriate fee structure
    const targetFs = createdStructures.find(fs => {
      if (isCol) {
        return fs.institutionId === collegeId && fs.approvalStatus === ApprovalStatusEnum.APPROVED;
      } else {
        return fs.institutionId === schoolId && fs.approvalStatus === ApprovalStatusEnum.APPROVED;
      }
    }) || createdStructures[0];

    const totalFee = targetFs.totalFeeAmount;
    
    // Realistic payment profiles:
    // Some students fully paid, some paid 1st installment, some pending
    let totalPaid = 0;
    let scholarship = 0;
    let status = 'PENDING';

    const lastDigit = parseInt(std.studentCode.slice(-1) || '0', 10);
    if (lastDigit % 3 === 0) {
      // 100% Paid (Full lump-sum or completed installments)
      totalPaid = totalFee;
      status = 'PAID';
    } else if (lastDigit % 3 === 1) {
      // 1st Installment Paid
      const inst1 = targetFs.installments[0]?.amount || Math.round(totalFee * 0.4);
      totalPaid = inst1;
      status = 'PARTIAL';
    } else {
      // Pending or Concession
      scholarship = 2500;
      totalPaid = 0;
      status = 'PENDING';
    }

    const netPayable = totalFee - scholarship;
    const balanceDue = Math.max(0, netPayable - totalPaid);

    const ledger = await prisma.studentFeeLedgers.create({
      data: {
        institutionId: std.tenantId,
        studentUserId: std.userId,
        feeStructureId: targetFs.id,
        totalFeeDue: totalFee,
        scholarshipAmount: scholarship,
        netPayable: netPayable,
        totalPaid: totalPaid,
        balanceDue: balanceDue,
        status: status,
        dueDate: new Date(Date.now() + 15 * 86400000),
      }
    });

    // Create installment breakdown for frontend
    const installments = targetFs.installments.map((inst: any, idx: number) => {
      let instStatus = 'PENDING';
      let paidDate = undefined;
      let receiptNo = undefined;

      if (status === 'PAID') {
        instStatus = 'PAID';
        paidDate = new Date(Date.now() - (idx * 20 + 2) * 86400000).toISOString().split('T')[0];
        receiptNo = `RCP-${20260000 + Math.floor(Math.random() * 90000)}`;
      } else if (status === 'PARTIAL' && idx === 0) {
        instStatus = 'PAID';
        paidDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
        receiptNo = `RCP-${20260000 + Math.floor(Math.random() * 90000)}`;
      } else if (idx === 0 && status === 'PENDING') {
        instStatus = 'OVERDUE';
      }

      return {
        number: idx + 1,
        title: inst.title,
        amount: inst.amount,
        dueDate: new Date(Date.now() + inst.dueDays * 86400000).toISOString().split('T')[0],
        status: instStatus,
        paidDate,
        receiptNo,
      };
    });

    studentLedgers.push({
      id: ledger.id,
      studentId: std.userId,
      rollNo: std.studentCode,
      name: `${std.user?.firstName || ''} ${std.user?.lastName || ''}`.trim() || 'Learner',
      email: std.user?.email || 'student@isml.edu',
      avatar: '/avatars/default.png',
      collegeId: std.tenantId,
      collegeName: std.tenant?.name || 'Affiliated Campus',
      program: targetFs.courseName,
      department: 'Foreign Languages Department',
      batch: 'MRNG BATCH',
      currentSemester: 1,
      totalFees: totalFee,
      concessionAmount: scholarship,
      netPayable: netPayable,
      paidAmount: totalPaid,
      outstandingBalance: balanceDue,
      installments,
      paymentStatus: status,
      lastPaymentDate: totalPaid > 0 ? new Date().toISOString().split('T')[0] : undefined,
    });

    // If paid, create payment transaction
    if (totalPaid > 0) {
      const receiptNo = `RCP-${20260000 + Math.floor(Math.random() * 90000)}`;
      const txnRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      await prisma.feePaymentTransactions.create({
        data: {
          studentFeeLedgerId: ledger.id,
          studentUserId: std.userId,
          institutionId: std.tenantId,
          transactionReference: txnRef,
          amount: totalPaid,
          currency: 'INR',
          paymentMethod: 'UPI',
          paymentStatus: 'SUCCESS',
          receiptNumber: receiptNo,
        }
      });

      transactions.push({
        id: txnRef,
        receiptNo: receiptNo,
        studentId: std.userId,
        studentName: `${std.user?.firstName || ''} ${std.user?.lastName || ''}`.trim(),
        rollNo: std.studentCode,
        collegeId: std.tenantId,
        collegeName: std.tenant?.name || 'Campus',
        program: targetFs.courseName,
        semester: 1,
        amount: totalPaid,
        paymentMethod: 'UPI',
        channelType: 'RAZORPAY_GATEWAY',
        gatewayRef: `rzp_live_${Math.random().toString(36).substring(2, 10)}`,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        remarks: `Live Online Term Payment for ${targetFs.courseName}`,
      });
    }
  }

  console.log(`💳 Created ${transactions.length} Verified Payment Transactions`);

  // Write sync JSON for frontend
  const jsonPathFs = path.join(__dirname, '../../web/src/lib/realDbFeeStructures.json');
  const jsonPathLedgers = path.join(__dirname, '../../web/src/lib/realDbStudentFees.json');
  const jsonPathTxns = path.join(__dirname, '../../web/src/lib/realDbTransactions.json');

  fs.writeFileSync(jsonPathFs, JSON.stringify(createdStructures, null, 2));
  fs.writeFileSync(jsonPathLedgers, JSON.stringify(studentLedgers, null, 2));
  fs.writeFileSync(jsonPathTxns, JSON.stringify(transactions, null, 2));

  console.log('✅ Synchronized all real finance DB records to web/src/lib/');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding fee data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
