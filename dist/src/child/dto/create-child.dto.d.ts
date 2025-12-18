export declare enum Gender {
    male = "male",
    female = "female"
}
export declare enum BloodType {
    A_POSITIVE = "A+",
    A_NEGATIVE = "A-",
    B_POSITIVE = "B+",
    B_NEGATIVE = "B-",
    AB_POSITIVE = "AB+",
    AB_NEGATIVE = "AB-",
    O_POSITIVE = "O+",
    O_NEGATIVE = "O-",
    unknown = "unknown"
}
export declare enum DeliveryType {
    normal = "normal",
    cesarean = "cesarean",
    assisted = "assisted"
}
export declare class CreateChildDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    chdrNumber?: string;
    photoUri?: string;
    birthWeight?: number;
    birthHeight?: number;
    birthHeadCircumference?: number;
    bloodType?: BloodType;
    placeOfBirth?: string;
    deliveryType?: DeliveryType;
    allergies?: string[];
    specialConditions?: string[];
    motherName?: string;
    fatherName?: string;
    emergencyContact?: string;
    address?: string;
}
