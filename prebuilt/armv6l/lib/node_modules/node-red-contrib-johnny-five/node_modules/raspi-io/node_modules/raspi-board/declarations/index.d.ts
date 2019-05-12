import { IPinInfo } from 'j5-io-types';
export declare const VERSION_1_MODEL_A = "rpi1_a";
export declare const VERSION_1_MODEL_B_REV_1 = "rpi1_b1";
export declare const VERSION_1_MODEL_B_REV_2 = "rpi1_b2";
export declare const VERSION_1_MODEL_B_PLUS = "rpi1_bplus";
export declare const VERSION_1_MODEL_A_PLUS = "rpi1_aplus";
export declare const VERSION_1_MODEL_ZERO = "rpi1_zero";
export declare const VERSION_1_MODEL_ZERO_W = "rpi1_zerow";
export declare const VERSION_2_MODEL_B = "rpi2_b";
export declare const VERSION_3_MODEL_B = "rpi3_b";
export declare const VERSION_3_MODEL_B_PLUS = "rpi3_bplus";
export declare const VERSION_3_MODEL_A_PLUS = "rpi3_aplus";
export declare const VERSION_UNKNOWN = "unknown";
export interface IRaspiPinInfo extends IPinInfo {
    gpio: number;
}
export declare function getBoardRevision(): string;
export declare function getPins(): {
    [wiringpi: number]: IRaspiPinInfo;
};
export declare function getPinNumber(alias: string | number): number | null;
export declare function getGpioNumber(alias: string | number): number | null;
