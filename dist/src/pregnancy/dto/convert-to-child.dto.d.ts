declare enum Gender {
    male = "male",
    female = "female"
}
export declare class ConvertToChildDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    chdrNumber?: string;
    photoUri?: string;
    birthWeight?: number;
    birthHeight?: number;
    birthHeadCircumference?: number;
    bloodType?: string;
    placeOfBirth?: string;
    deliveryType?: 'normal' | 'cesarean' | 'assisted';
    deliveryNotes?: string;
    allergies?: string[];
    specialConditions?: string[];
    address?: string;
}
export {};
