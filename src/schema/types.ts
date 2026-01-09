export type SQLDataType = 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB' | 'ANY';

export interface ColumnData {
  name: string;
  type: SQLDataType;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  defaultValue?: string | number | null;
  autoIncrement: boolean;
}

export interface ColumnType<T> {
  __type: T;
  data: ColumnData;
}