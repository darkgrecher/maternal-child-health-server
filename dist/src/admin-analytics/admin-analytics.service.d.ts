import { PrismaService } from '../prisma/prisma.service';
type TrendDirection = 'up' | 'down' | 'flat';
type Trend = {
    current: number;
    previous: number;
    changePercent: number | null;
    direction: TrendDirection;
};
type AnalyticsSummary = {
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
type AnalyticsSeries = {
    labels: string[];
    newUsers: number[];
    newChildren: number[];
    newPregnancies: number[];
    appointments: number[];
    vaccinations: number[];
};
type RegionStat = {
    region: string;
    midwives: number;
    children: number;
    pregnancies: number;
};
type VaccinationStatusStat = {
    status: string;
    count: number;
};
type RecentActivity = {
    id: string;
    type: string;
    title: string;
    description?: string | null;
    date: string;
    childId: string;
    childName: string;
};
type AdminAnalyticsResponse = {
    range: {
        label: string;
        start: string;
        end: string;
        days: number;
    };
    summary: AnalyticsSummary;
    trends: {
        newUsers: Trend;
        newMidwives: Trend;
        newChildren: Trend;
        newPregnancies: Trend;
        appointments: Trend;
        vaccinations: Trend;
    };
    series: AnalyticsSeries;
    regionStats: RegionStat[];
    vaccinationStatus: VaccinationStatusStat[];
    recentActivities: RecentActivity[];
};
export declare class AdminAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private resolveRange;
    private buildDateRange;
    private dateKey;
    private formatLabel;
    private buildBuckets;
    private buildSeries;
    private buildTrend;
    private normalizeRegion;
    getAnalytics(range?: string): Promise<AdminAnalyticsResponse>;
}
export {};
