import type { ColumnData, ColumnType, SQLDataType } from './types.ts';

class ColumnBuilder<T> implements ColumnType<T> {
  declare __type: T;
  
  public data: ColumnData;

  constructor(type: SQLDataType) {
    this.data = {
      name: '',
      type,
      isPrimaryKey: false,
      isNotNull: false,
      isUnique: false,
      autoIncrement: false,
    };
  }

  primaryKey(): ColumnBuilder<T extends null ? number : T> {
    this.data.isPrimaryKey = true;
    this.data.isNotNull = true;
    return this as any;
  }

  autoIncrement(): ColumnBuilder<number> {
    this.data.autoIncrement = true;
    this.data.isPrimaryKey = true;
    return this as any;
  }

  notNull(): ColumnBuilder<Exclude<T, null>> {
    this.data.isNotNull = true;
    return this as any;
  }

  unique(): this {
    this.data.isUnique = true;
    return this;
  }

  default(value: T extends null ? string | number | null : T): this {
    this.data.defaultValue = value as any;
    return this;
  }
}

export const integer = () => new ColumnBuilder<number | null>('INTEGER');
export const text = () => new ColumnBuilder<string | null>('TEXT');
export const real = () => new ColumnBuilder<number | null>('REAL');
export const boolean = () => new ColumnBuilder<number | null>('INTEGER');
export const blob = () => new ColumnBuilder<Uint8Array | null>('BLOB');