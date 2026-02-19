import type { Column } from "./ColumnType";

export interface Table {
  id: number;
  name: string;
  columns: Column[];
}

export interface TableNodeData extends Record<string, unknown> {
  table: Table;
  addTable?: () => void;
}