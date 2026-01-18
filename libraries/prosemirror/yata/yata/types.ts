import type { Mark } from 'prosemirror-model';
import type {
  Item,
  TextItem,
  OpeningTagItem,
  ClosingTagItem,
  NodeItem,
} from './item.js';

// Core CRDT types
export interface ItemID {
  client: string;
  clock: number;
}

export type ItemReference<T = Item> = T | ItemID | null;

export type ItemType = 'text' | 'openingTag' | 'closingTag' | 'node';

// JSON serialization interfaces
export interface BaseItemJSON {
  id: ItemID;
  type: ItemType;
  originalLeft?: ItemID;
  originalRight?: ItemID;
  deleted?: boolean;
}

export interface TextItemJSON extends BaseItemJSON {
  type: 'text';
  text: string;
  marks: ReturnType<Mark['toJSON']>[];
}

export interface OpeningTagItemJSON extends BaseItemJSON {
  type: 'openingTag';
  tagName: string;
  attrs: Record<string, any> | null;
  closingTagItem: ItemID;
}

export interface ClosingTagItemJSON extends BaseItemJSON {
  type: 'closingTag';
  tagName: string;
  openingTagItem?: ItemID;
}

export interface NodeItemJSON extends BaseItemJSON {
  type: 'node';
  tagName: string;
  attrs: Record<string, any> | null;
}

export type AnyItemJSON =
  | TextItemJSON
  | OpeningTagItemJSON
  | ClosingTagItemJSON
  | NodeItemJSON;

export type ClientMap = Record<string, AnyItemJSON[]>;

// Item registry types
export interface ItemConstructor<T extends Item = Item> {
  new (...args: any[]): T;
  fromJSON(json: AnyItemJSON): T;
}

export interface ItemMap {
  text: typeof TextItem;
  openingTag: typeof OpeningTagItem;
  closingTag: typeof ClosingTagItem;
  node: typeof NodeItem;
}
