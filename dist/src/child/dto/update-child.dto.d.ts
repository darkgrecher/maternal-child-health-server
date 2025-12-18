import { Gender, BloodType, DeliveryType } from './create-child.dto';
export declare class UpdateChildDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: Gender;
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
