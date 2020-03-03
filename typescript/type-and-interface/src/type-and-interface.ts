/**
 * @since 2020-03-03 03:26
 * @author vivaxy
 */
type InternalType = {
  id: number;
};
export function internalTypeWithFunction(): InternalType {
  return {
    id: 1,
  };
}
export const internalTypeWithArrowFunction = (): InternalType => {
  return {
    id: 2,
  };
};

interface InternalInterface {
  id: number;
}
export function internalInterfaceWithFunction(): InternalInterface {
  return {
    id: 3,
  };
}
export const internalInterfaceWithArrowFunction = (): InternalInterface => {
  return {
    id: 4,
  };
};

export type ExternalType = {
  id: number;
};
export function externalTypeWithFunction(): ExternalType {
  return {
    id: 5,
  };
}
export const externalTypeWithArrowFunction = (): ExternalType => {
  return {
    id: 6,
  };
};

export interface ExternalInterface {
  id: number;
}
export function externalInterfaceWithFunction(): ExternalInterface {
  return {
    id: 7,
  };
}
export const externalInterfaceWithArrowFunction = (): ExternalInterface => {
  return {
    id: 8,
  };
};
