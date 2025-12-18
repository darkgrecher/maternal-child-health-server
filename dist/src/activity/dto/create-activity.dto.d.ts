export declare enum ActivityType {
    VACCINATION = "vaccination",
    GROWTH = "growth",
    MILESTONE = "milestone",
    APPOINTMENT = "appointment",
    CHECKUP = "checkup"
}
export declare class CreateActivityDto {
    type: ActivityType;
    title: string;
    description?: string;
    date?: string;
    icon?: string;
}
