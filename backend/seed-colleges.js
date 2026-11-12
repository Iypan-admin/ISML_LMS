const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const partnerColleges = [
  {
    code: 'LOYOLA-CHE',
    slug: 'loyola-college-chennai',
    name: 'Loyola College of Arts & Science (Autonomous)',
    displayName: 'Loyola College',
    email: 'admin@loyolacollege.edu',
    phone: '+91 44 2817 8200',
    status: 'ACTIVE',
  },
  {
    code: 'MCC-TAM',
    slug: 'madras-christian-college',
    name: 'Madras Christian College (MCC)',
    displayName: 'Madras Christian College',
    email: 'office@mcc.edu.in',
    phone: '+91 44 2239 0675',
    status: 'ACTIVE',
  },
  {
    code: 'SMC-CHE',
    slug: 'stella-maris-college',
    name: 'Stella Maris College for Women (Autonomous)',
    displayName: 'Stella Maris College',
    email: 'principal@stellamariscollege.edu.in',
    phone: '+91 44 2811 1987',
    status: 'ACTIVE',
  },
  {
    code: 'PSG-CBE',
    slug: 'psg-college-arts-science',
    name: 'PSG College of Arts & Science (Autonomous)',
    displayName: 'PSG College of Arts & Science',
    email: 'principal@psgcas.ac.in',
    phone: '+91 422 4303300',
    status: 'ACTIVE',
  },
  {
    code: 'CIT-CBE',
    slug: 'coimbatore-institute-technology',
    name: 'Coimbatore Institute of Technology (CIT)',
    displayName: 'CIT Coimbatore',
    email: 'principal@cit.edu.in',
    phone: '+91 422 2574071',
    status: 'ACTIVE',
  },
  {
    code: 'SKCET-CBE',
    slug: 'sri-krishna-college-engineering-technology',
    name: 'Sri Krishna College of Engineering & Technology (SKCET)',
    displayName: 'SKCET Coimbatore',
    email: 'info@skcet.ac.in',
    phone: '+91 422 2678001',
    status: 'ACTIVE',
  }
];

async function seedColleges() {
  try {
    console.log('Seeding partner colleges to Supabase PostgreSQL...');
    for (const c of partnerColleges) {
      const existing = await prisma.institutions.findFirst({
        where: {
          OR: [{ code: c.code }, { email: c.email }, { slug: c.slug }]
        }
      });
      if (existing) {
        console.log(`- Already exists: ${c.name} (${c.code})`);
      } else {
        const created = await prisma.institutions.create({
          data: c
        });
        console.log(`+ Created: ${created.name} (${created.code}) [ID: ${created.id}]`);
      }
    }
    const all = await prisma.institutions.findMany({ where: { status: 'ACTIVE' } });
    console.log(`\nTotal Active Institutions in Supabase DB: ${all.length}`);
    all.forEach(i => console.log(`• [${i.code}] ${i.name} (ID: ${i.id})`));
  } catch (err) {
    console.error('Error seeding colleges:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedColleges();

