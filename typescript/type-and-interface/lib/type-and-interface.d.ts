/**
 * @since 2020-03-03 03:26
 * @author vivaxy
 */
declare type InternalType = {
    id: number;
};
interface InternalInterface {
    id: number;
}
export declare type ExternalType = {
    id: number;
};
export interface ExternalInterface {
    id: number;
}
export default function fn(it: InternalType, ii: InternalInterface, et: ExternalType, ei: ExternalInterface): InternalType[];
export {};
