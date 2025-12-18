import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    getChildActivities(childId: string): Promise<{
        success: boolean;
        data: {
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            id: string;
            childId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    getActivity(id: string): Promise<{
        success: boolean;
        data: {
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            id: string;
            childId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    createActivity(childId: string, dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            id: string;
            childId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateActivity(id: string, dto: UpdateActivityDto): Promise<{
        success: boolean;
        data: {
            type: import("@prisma/client").$Enums.ActivityType;
            title: string;
            description: string | null;
            date: Date;
            icon: string | null;
            id: string;
            childId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    deleteActivity(id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
