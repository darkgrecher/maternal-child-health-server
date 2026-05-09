import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    private getActor;
    getActivities(req: any): Promise<{
        success: boolean;
        data: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        })[];
    }>;
    getChildActivities(req: any, childId: string): Promise<{
        success: boolean;
        data: ({
            child: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        })[];
    }>;
    getActivity(req: any, id: string): Promise<{
        success: boolean;
        data: {
            child: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                midwifeId: string | null;
                address: string | null;
                emergencyContact: string | null;
                chdrNumber: string | null;
                firstName: string;
                lastName: string;
                dateOfBirth: Date;
                gender: import("@prisma/client").$Enums.Gender;
                photoUri: string | null;
                birthWeight: number | null;
                birthHeight: number | null;
                birthHeadCircumference: number | null;
                bloodType: import("@prisma/client").$Enums.BloodType | null;
                placeOfBirth: string | null;
                deliveryType: import("@prisma/client").$Enums.DeliveryType | null;
                allergies: string[];
                specialConditions: string[];
                motherName: string | null;
                fatherName: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    createActivity(req: any, childId: string, dto: CreateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    updateActivity(req: any, id: string, dto: UpdateActivityDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            childId: string;
            title: string;
            type: import("@prisma/client").$Enums.ActivityType;
            date: Date;
            icon: string | null;
        };
    }>;
    deleteActivity(req: any, id: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
