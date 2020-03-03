/**
 * @since 2020-03-03 03:27
 * @author vivaxy
 */
import { internalTypeWithFunction, internalTypeWithArrowFunction, internalInterfaceWithFunction, internalInterfaceWithArrowFunction, externalTypeWithFunction, externalTypeWithArrowFunction, externalInterfaceWithFunction, externalInterfaceWithArrowFunction } from './type-and-interface';
export { internalTypeWithFunction, internalTypeWithArrowFunction, internalInterfaceWithFunction, internalInterfaceWithArrowFunction, externalTypeWithFunction, externalTypeWithArrowFunction, externalInterfaceWithFunction, externalInterfaceWithArrowFunction, };
export declare const f1: typeof internalTypeWithFunction;
export declare const f2: () => {
    id: number;
};
export declare const f3: typeof internalInterfaceWithFunction;
export declare const f5: typeof externalTypeWithFunction;
export declare const f6: () => import("./type-and-interface").ExternalType;
export declare const f7: typeof externalInterfaceWithFunction;
export declare const f8: () => import("./type-and-interface").ExternalInterface;
