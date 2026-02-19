export interface Column {
  id: number;
  name: string;
  type: string;
  typeLength?:string;
  isPrimary: boolean;
  isNullable: boolean;
}