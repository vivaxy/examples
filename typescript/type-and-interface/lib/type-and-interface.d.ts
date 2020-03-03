/**
 * @since 2020-03-03 03:26
 * @author vivaxy
 */
declare type InternalType = {
    id: number;
};
export declare function internalTypeWithFunction(): InternalType;
export declare const internalTypeWithArrowFunction: () => InternalType;
interface InternalInterface {
    id: number;
}
export declare function internalInterfaceWithFunction(): InternalInterface;
export declare const internalInterfaceWithArrowFunction: () => InternalInterface;
export declare type ExternalType = {
    id: number;
};
export declare function externalTypeWithFunction(): ExternalType;
export declare const externalTypeWithArrowFunction: () => ExternalType;
export interface ExternalInterface {
    id: number;
}
export declare function externalInterfaceWithFunction(): ExternalInterface;
export declare const externalInterfaceWithArrowFunction: () => ExternalInterface;
export {};
