import { AdminAnalyticsService } from './admin-analytics.service';
export declare class AdminAnalyticsController {
    private readonly adminAnalyticsService;
    constructor(adminAnalyticsService: AdminAnalyticsService);
    private assertAdminAccess;
    getAnalytics(req: any, range?: string): Promise<{
        success: boolean;
        data: {
            range: {
                label: string;
                start: string;
                end: string;
                days: number;
            };
            summary: {
                totalUsers: number;
                totalMidwives: number;
                totalChildren: number;
                totalPregnancies: number;
                activePregnancies: number;
                highRiskPregnancies: number;
                overdueVaccinations: number;
                appointmentsInRange: number;
                vaccinationsInRange: number;
            };
            trends: {
                newUsers: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
                newMidwives: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
                newChildren: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
                newPregnancies: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
                appointments: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
                vaccinations: {
                    current: number;
                    previous: number;
                    changePercent: number | null;
                    direction: "up" | "down" | "flat";
                };
            };
            series: {
                labels: string[];
                newUsers: number[];
                newChildren: number[];
                newPregnancies: number[];
                appointments: number[];
                vaccinations: number[];
            };
            regionStats: {
                region: string;
                midwives: number;
                children: number;
                pregnancies: number;
            }[];
            vaccinationStatus: {
                status: string;
                count: number;
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
        };
    }>;
}
