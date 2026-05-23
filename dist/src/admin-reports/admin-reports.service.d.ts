import { PrismaService } from '../prisma/prisma.service';
type DashboardStats = {
    totalPatients: number;
    activePregnancies: number;
    childrenMonitored: number;
    upcomingAppointments: number;
    overdueVaccinations: number;
    highRiskPregnancies: number;
    appointmentsToday: number;
    newPatientsThisMonth: number;
};
type DashboardAppointment = {
    id: string;
    childId: string;
    childName: string;
    dateTime: string;
    type: string;
    status: string;
    title: string;
    location: string;
};
type DashboardActivity = {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    date: string;
    childId: string;
    childName: string;
};
type DashboardHighRiskPregnancy = {
    id: string;
    motherName: string;
    currentWeek: number | null;
    riskFactors: string[];
    expectedDeliveryDate: string | null;
    nextCheckupDate: string | null;
};
type DashboardOverdueVaccination = {
    childId: string;
    childName: string;
    childAge: string;
    vaccineId: string;
    vaccineName: string;
    scheduledDate: string;
    daysOverdue: number;
    parentPhone?: string | null;
};
type DashboardResponse = {
    stats: DashboardStats;
    todayAppointments: DashboardAppointment[];
    recentActivities: DashboardActivity[];
    highRiskPregnancies: DashboardHighRiskPregnancy[];
    overdueVaccinations: DashboardOverdueVaccination[];
};
export declare class AdminReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private formatChildName;
    private formatMotherName;
    private formatAgeLabel;
    private getOverdueVaccinations;
    getReports(): Promise<DashboardResponse>;
}
export {};
