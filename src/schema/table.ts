import type { ColumnType } from './types.ts';

export type TableDefinition = Record<string, ColumnType<any>>;

export class Table<T extends TableDefinition> {
  public readonly name: string;
  public readonly columns: T;

  constructor(name: string, columns: T) {
    this.name = name;
    this.columns = columns;

    for (const [key, col] of Object.entries(columns)) {
      col.data.name = key;
    }
  }

  getName(): string {
    return this.name;
  }
}

export function table<T extends TableDefinition>(name: string, columns: T): Table<T> {
  return new Table(name, columns);
}

export type Infer<T> = T extends Table<infer Cols>
  ? { [K in keyof Cols]: Cols[K]['__type'] }
  : never;