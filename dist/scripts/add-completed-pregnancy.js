"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userId = 'edaa0f7a-9dc7-46f6-8c67-ecf66c1107b1';
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        console.error(`❌ User with ID ${userId} not found!`);
        process.exit(1);
    }
    console.log(`✅ Found user: ${user.email}`);
    const expectedDeliveryDate = new Date('2026-01-15');
    const lastMenstrualPeriod = new Date('2025-04-08');
    const motherDateOfBirth = new Date('1992-05-20');
    const pregnancy = await prisma.pregnancy.create({
        data: {
            userId: userId,
            motherFirstName: 'Sarah',
            motherLastName: 'Johnson',
            motherDateOfBirth: motherDateOfBirth,
            motherBloodType: client_1.BloodType.O_POSITIVE,
            expectedDeliveryDate: expectedDeliveryDate,
            lastMenstrualPeriod: lastMenstrualPeriod,
            conceptionDate: new Date('2025-04-22'),
            status: client_1.PregnancyStatus.active,
            currentWeek: 44,
            trimester: 3,
            gravida: 2,
            para: 1,
            prePregnancyWeight: 62.5,
            currentWeight: 78.0,
            height: 165,
            isHighRisk: false,
            riskFactors: [],
            medicalConditions: [],
            allergies: ['Penicillin'],
            medications: ['Prenatal vitamins', 'Folic acid'],
            hospitalName: 'Castle Street Hospital for Women',
            obgynName: 'Dr. Priya Fernando',
            obgynContact: '+94 11 269 1111',
            midwifeName: 'Nurse Kamala Jayawardena',
            midwifeContact: '+94 77 123 4567',
            expectedGender: client_1.Gender.female,
            babyNickname: 'Little Princess',
            numberOfBabies: 1,
            emergencyContactName: 'Michael Johnson',
            emergencyContactPhone: '+94 77 987 6543',
            emergencyContactRelation: 'Husband',
        },
    });
    console.log('\n✅ Successfully created pregnancy profile!');
    console.log('📋 Pregnancy Details:');
    console.log(`   ID: ${pregnancy.id}`);
    console.log(`   Mother: ${pregnancy.motherFirstName} ${pregnancy.motherLastName}`);
    console.log(`   Due Date: ${pregnancy.expectedDeliveryDate.toLocaleDateString()}`);
    console.log(`   Status: ${pregnancy.status}`);
    console.log(`   Current Week: ${pregnancy.currentWeek}`);
    console.log(`   Days Overdue: ~${Math.floor((new Date().getTime() - pregnancy.expectedDeliveryDate.getTime()) / (1000 * 60 * 60 * 24))} days`);
    const checkup1 = await prisma.pregnancyCheckup.create({
        data: {
            pregnancyId: pregnancy.id,
            checkupDate: new Date('2025-12-10'),
            weekOfPregnancy: 36,
            weight: 75.0,
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 76,
            fundalHeight: 35,
            fetalHeartRate: 142,
            fetalWeight: 2600,
            fetalLength: 470,
            amnioticFluid: 'Normal',
            placentaPosition: 'Anterior',
            urineProtein: 'Negative',
            urineGlucose: 'Negative',
            hemoglobin: 11.8,
            notes: 'Baby in good position, everything looking healthy',
            recommendations: ['Continue regular monitoring', 'Light exercise', 'Stay hydrated'],
            providerName: 'Dr. Priya Fernando',
            location: 'Castle Street Hospital',
        },
    });
    const checkup2 = await prisma.pregnancyCheckup.create({
        data: {
            pregnancyId: pregnancy.id,
            checkupDate: new Date('2026-01-07'),
            weekOfPregnancy: 40,
            weight: 77.5,
            bloodPressureSystolic: 122,
            bloodPressureDiastolic: 78,
            fundalHeight: 38,
            fetalHeartRate: 145,
            fetalWeight: 3200,
            fetalLength: 500,
            amnioticFluid: 'Normal',
            placentaPosition: 'Anterior',
            urineProtein: 'Negative',
            urineGlucose: 'Negative',
            hemoglobin: 11.5,
            notes: 'Full term, ready for delivery anytime',
            recommendations: ['Monitor for labor signs', 'Come to hospital if contractions start', 'Rest well'],
            providerName: 'Dr. Priya Fernando',
            location: 'Castle Street Hospital',
        },
    });
    console.log(`\n✅ Added ${2} checkup records`);
    const measurements = await prisma.pregnancyMeasurement.createMany({
        data: [
            {
                pregnancyId: pregnancy.id,
                measurementDate: new Date('2025-11-15'),
                weekOfPregnancy: 32,
                weight: 72.0,
                bellyCircumference: 95,
                bloodPressureSystolic: 115,
                bloodPressureDiastolic: 75,
                symptoms: ['Mild back pain', 'Fatigue'],
                mood: 'Happy',
                notes: 'Feeling great overall',
            },
            {
                pregnancyId: pregnancy.id,
                measurementDate: new Date('2025-12-20'),
                weekOfPregnancy: 37,
                weight: 76.0,
                bellyCircumference: 102,
                bloodPressureSystolic: 120,
                bloodPressureDiastolic: 77,
                symptoms: ['Frequent urination', 'Leg cramps'],
                mood: 'Tired',
                notes: 'Getting harder to sleep',
            },
            {
                pregnancyId: pregnancy.id,
                measurementDate: new Date('2026-01-20'),
                weekOfPregnancy: 41,
                weight: 78.5,
                bellyCircumference: 105,
                bloodPressureSystolic: 125,
                bloodPressureDiastolic: 80,
                symptoms: ['Braxton Hicks contractions', 'Lower back pain', 'Pelvic pressure'],
                mood: 'Anxious',
                notes: 'Ready to meet my baby!',
            },
        ],
    });
    console.log(`✅ Added ${measurements.count} measurement records`);
    const journal = await prisma.pregnancyJournal.create({
        data: {
            pregnancyId: pregnancy.id,
            date: new Date('2026-02-01'),
            weekOfPregnancy: 43,
            title: 'Waiting for Baby',
            content: 'It\'s been a few weeks past my due date and I\'m getting anxious to meet our little one. The doctor says everything is fine and baby is healthy. Just waiting for the right moment. Can\'t wait to hold her in my arms!',
            mood: 'excited',
        },
    });
    console.log(`✅ Added journal entry\n`);
    console.log('🎉 All done! The pregnancy profile is ready for testing.');
    console.log('💡 When you open the Pregnancy Dashboard in the app, the ConvertToChildModal should appear!');
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-completed-pregnancy.js.map