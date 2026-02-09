"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userId = 'edaa0f7a-9dc7-46f6-8c67-ecf66c1107b1';
    console.log('🤰 Creating pregnancy profile...');
    const pregnancy = await prisma.pregnancy.create({
        data: {
            userId: userId,
            motherFirstName: 'Sarah',
            motherLastName: 'Johnson',
            motherDateOfBirth: new Date('1995-06-15'),
            motherBloodType: client_1.BloodType.O_POSITIVE,
            expectedDeliveryDate: new Date('2026-02-01'),
            lastMenstrualPeriod: new Date('2025-04-25'),
            status: client_1.PregnancyStatus.active,
            currentWeek: 41,
            trimester: 3,
            gravida: 1,
            para: 0,
            prePregnancyWeight: 62.0,
            currentWeight: 75.0,
            height: 165.0,
            isHighRisk: false,
            riskFactors: [],
            medicalConditions: [],
            allergies: [],
            medications: [],
            numberOfBabies: 1,
            hospitalName: 'Colombo General Hospital',
            obgynName: 'Dr. Perera',
            obgynContact: '+94771234567',
        },
    });
    console.log('✅ Pregnancy profile created successfully!');
    console.log('📋 Details:');
    console.log(`   - ID: ${pregnancy.id}`);
    console.log(`   - Mother: ${pregnancy.motherFirstName} ${pregnancy.motherLastName}`);
    console.log(`   - Due Date: ${pregnancy.expectedDeliveryDate.toLocaleDateString()}`);
    console.log(`   - Current Week: ${pregnancy.currentWeek}`);
    console.log(`   - Status: ${pregnancy.status}`);
    console.log('\n🎉 The "Convert to Child" modal should now appear in the app!');
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=insert-pregnancy.js.map