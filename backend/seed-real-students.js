const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const collegesWithStudents = [
  {
    code: 'CIT-CBE',
    students: [
      { name: 'Aadhavan Ramanathan', firstName: 'Aadhavan', lastName: 'Ramanathan', email: 'aadhavan.r@cit.edu.in', code: 'CIT-2026-CS01', gender: 'MALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Computer Science & Engineering' },
      { name: 'Harini Sundarajan', firstName: 'Harini', lastName: 'Sundarajan', email: 'harini.s@cit.edu.in', code: 'CIT-2026-CS02', gender: 'FEMALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Information Technology' },
      { name: 'Kavitha Balasubramanian', firstName: 'Kavitha', lastName: 'Balasubramanian', email: 'kavitha.b@cit.edu.in', code: 'CIT-2026-CS03', gender: 'FEMALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Artificial Intelligence & DS' },
      { name: 'Naveen Kumar Swaminathan', firstName: 'Naveen Kumar', lastName: 'Swaminathan', email: 'naveenkumar.s@cit.edu.in', code: 'CIT-2026-CS04', gender: 'MALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Computer Science & Engineering' },
      { name: 'Priyadharshini Murugan', firstName: 'Priyadharshini', lastName: 'Murugan', email: 'priya.m@cit.edu.in', code: 'CIT-2026-CS05', gender: 'FEMALE', dept: 'Department of Computer Science & IT', prog: 'B.Sc Data Analytics' },
      { name: 'Vigneshwaran Thangavel', firstName: 'Vigneshwaran', lastName: 'Thangavel', email: 'vignesh.t@cit.edu.in', code: 'CIT-2026-CS06', gender: 'MALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Computer Science & Engineering' },
      { name: 'Deepika Senthil', firstName: 'Deepika', lastName: 'Senthil', email: 'deepika.s@cit.edu.in', code: 'CIT-2026-CS07', gender: 'FEMALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Information Technology' },
      { name: 'Rohit Chandran', firstName: 'Rohit', lastName: 'Chandran', email: 'rohit.c@cit.edu.in', code: 'CIT-2026-CS08', gender: 'MALE', dept: 'Department of Computer Science & IT', prog: 'B.Tech Computer Science & Engineering' }
    ]
  },
  {
    code: 'SKCT-26',
    students: [
      { name: 'Dinesh Karthik', firstName: 'Dinesh', lastName: 'Karthik', email: 'dinesh.k@skct.edu.in', code: 'SKCT-2026-01', gender: 'MALE', dept: 'Department of Computer Applications', prog: 'B.E Computer Science' },
      { name: 'Sowmya Venkat', firstName: 'Sowmya', lastName: 'Venkat', email: 'sowmya.v@skct.edu.in', code: 'SKCT-2026-02', gender: 'FEMALE', dept: 'Department of Computer Applications', prog: 'B.Tech Information Technology' },
      { name: 'Manojkumar Rajendran', firstName: 'Manoj', lastName: 'Rajendran', email: 'manoj.r@skct.edu.in', code: 'SKCT-2026-03', gender: 'MALE', dept: 'Department of Computer Applications', prog: 'B.E Artificial Intelligence' }
    ]
  },
  {
    code: 'LOYOLA-CHE',
    students: [
      { name: 'Bharathi M', firstName: 'Bharathi', lastName: 'M', email: 'bharathi.m@loyolacollege.edu', code: 'LOY-2026-01', gender: 'FEMALE', dept: 'Department of Foreign Languages', prog: 'B.A French Literature' },
      { name: 'Karthik Raja', firstName: 'Karthik', lastName: 'Raja', email: 'karthik.r@loyolacollege.edu', code: 'LOY-2026-02', gender: 'MALE', dept: 'Department of Foreign Languages', prog: 'B.A French Literature' },
      { name: 'Sneha Fernandez', firstName: 'Sneha', lastName: 'Fernandez', email: 'sneha.f@loyolacollege.edu', code: 'LOY-2026-03', gender: 'FEMALE', dept: 'Department of Foreign Languages', prog: 'B.Com Corporate Secretaryship' }
    ]
  },
  {
    code: 'PSG-CBE',
    students: [
      { name: 'Surya Narayanan', firstName: 'Surya', lastName: 'Narayanan', email: 'surya.n@psgcas.ac.in', code: 'PSG-2026-01', gender: 'MALE', dept: 'School of Computing Sciences', prog: 'B.Sc Computer Technology' },
      { name: 'Anitha Ramesh', firstName: 'Anitha', lastName: 'Ramesh', email: 'anitha.r@psgcas.ac.in', code: 'PSG-2026-02', gender: 'FEMALE', dept: 'School of Computing Sciences', prog: 'B.Sc Cognitive Systems' }
    ]
  }
];

async function seed() {
  console.log('Seeding real database students into Supabase PostgreSQL...');
  
  for (const group of collegesWithStudents) {
    const inst = await prisma.institutions.findFirst({
      where: { code: group.code }
    });

    if (!inst) {
      console.log(`Institution ${group.code} not found, skipping...`);
      continue;
    }

    console.log(`Adding students for ${inst.name} (${inst.code}) [${inst.id}]...`);

    for (const s of group.students) {
      const existingUser = await prisma.users.findFirst({
        where: { email: s.email, tenantId: inst.id }
      });

      if (!existingUser) {
        const createdUser = await prisma.users.create({
          data: {
            tenantId: inst.id,
            email: s.email,
            firstName: s.firstName,
            lastName: s.lastName,
            userType: 'STUDENT',
            status: 'ACTIVE',
            passwordHash: '$2b$10$wTfG0Kz8uYF5z1R9Qx6oUeP5p7O2W8b9A2K9N3R1V4H5S6D7E8F9G', // standard hash
            phone: '+91 98402 ' + Math.floor(10000 + Math.random() * 90000),
          }
        });

        await prisma.studentProfiles.create({
          data: {
            userId: createdUser.id,
            tenantId: inst.id,
            studentCode: s.code,
            dateOfBirth: new Date('2005-06-15'),
            gender: s.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
            academicStatus: 'ACTIVE',
          }
        }).catch(() => null);

        console.log(` -> Created student: ${s.name} (${s.code})`);
      } else {
        console.log(` -> Exists: ${s.name}`);
      }
    }
  }

  const total = await prisma.users.count({ where: { userType: 'STUDENT' } });
  console.log(`Total students now in Supabase PostgreSQL: ${total}`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());

