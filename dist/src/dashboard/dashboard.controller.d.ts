import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    private getActor;
    getDashboard(req: any): Promise<{
        success: boolean;
        data: {
            stats: {
                totalPatients: number;
                activePregnancies: number;
                childrenMonitored: number;
                upcomingAppointments: number;
                overdueVaccinations: number;
                highRiskPregnancies: number;
                appointmentsToday: number;
                newPatientsThisMonth: number;
            };
            todayAppointments: {
                id: string;
                childId: string;
                childName: string;
                dateTime: string;
                type: string;
                status: string;
                title: string;
                location: string;
            }[];
            recentActivities: {
                id: string;
                type: string;
                title: string;
                description?: string | null;
                date: string;
                childId: string;
                childName: string;
            }[];
            highRiskPregnancies: {
                id: string;
                motherName: string;
                currentWeek: number | null;
                riskFactors: string[];
                expectedDeliveryDate: string | null;
                nextCheckupDate: string | null;
            }[];
            overdueVaccinations: {
                childId: string;
                childName: string;
                childAge: string;
                vaccineId: string;
                vaccineName: string;
                scheduledDate: string;
                daysOverdue: number;
                parentPhone?: string | null;
            }[];
        };
    }>;
}
