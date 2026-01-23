export declare enum DeliveryType {
    normal = "normal",
    cesarean = "cesarean",
    assisted = "assisted"
}
export declare class UpdatePregnancyDto {
    motherFirstName?: string;
    motherLastName?: string;
    motherDateOfBirth?: string;
    motherBloodType?: string;
    motherPhotoUri?: string;
    expectedDeliveryDate?: string;
    lastMenstrualPeriod?: string;
    conceptionDate?: string;
    gravida?: number;
    para?: number;
    prePregnancyWeight?: number;
    currentWeight?: number;
    height?: number;
    isHighRisk?: boolean;
    riskFactors?: string[];
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
    hospitalName?: string;
    obgynName?: string;
    obgynContact?: string;
    midwifeName?: string;
    midwifeContact?: string;
    expectedGender?: 'male' | 'female';
    babyNickname?: string;
    numberOfBabies?: number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    deliveryDate?: string;
    deliveryType?: DeliveryType;
    deliveryNotes?: string;
}
