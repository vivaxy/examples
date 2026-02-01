import type { Mark } from 'prosemirror-model';
import type {
  Item,
  TextItem,
  OpeningTagItem,
  ClosingTagItem,
  NodeItem,
  DeleteItem,
  SetAttrItem,
} from './item.js';

// Change tracking for applyItems → ProseMirror steps conversion
export interface ItemChange {
  type: 'insert' | 'delete';
  item: Item;
  pmPosition: number; // ProseMirror position at time of change
}

// Core CRDT types
export interface ItemID {
  client: string;
  clock: number;
}

export type ItemType =
  | 'text'
  | 'openingTag'
  | 'closingTag'
  | 'node'
  | 'delete'
  | 'setAttr';

// ProseMirror attribute types
export type AttributeValue = string | number | boolean | null;
export type NodeAttributes = Record<string, AttributeValue> | null;

// Mark serialization type
export interface MarkJSON {
  type: string;
  attrs?: NodeAttributes;
}

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
  marks: MarkJSON[];
}

export interface OpeningTagItemJSON extends BaseItemJSON {
  type: 'openingTag';
  tagName: string;
  attrs: NodeAttributes;
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
  attrs: NodeAttributes;
}

export interface DeleteItemJSON extends BaseItemJSON {
  type: 'delete';
  targetId: ItemID;
}

export interface SetAttrItemJSON extends BaseItemJSON {
  type: 'setAttr';
  targetId: ItemID;
  setDeleted?: boolean;
  setAttrs?: NodeAttributes;
  setTargetId?: ItemID;
}

export type AnyItemJSON =
  | TextItemJSON
  | OpeningTagItemJSON
  | ClosingTagItemJSON
  | NodeItemJSON
  | DeleteItemJSON
  | SetAttrItemJSON;

export type ClientMap = Record<string, AnyItemJSON[]>;

// Item registry types
export interface ItemConstructor<T extends Item = Item> {
  fromJSON(json: AnyItemJSON): T;
}

export interface ItemMap {
  text: typeof TextItem;
  openingTag: typeof OpeningTagItem;
  closingTag: typeof ClosingTagItem;
  node: typeof NodeItem;
  delete: typeof DeleteItem;
  setAttr: typeof SetAttrItem;
}
