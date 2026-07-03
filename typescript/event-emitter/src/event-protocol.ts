export const EVENTS = {
  LOAD: 'load' as 'load',
  SCROLL: 'scroll' as 'scroll',
  RESIZE: 'resize' as 'resize',
};

export type TEventProtocol = {
  [EVENTS.LOAD]: [];
  [EVENTS.SCROLL]: [number];
  [EVENTS.RESIZE]: [number, number];
};
