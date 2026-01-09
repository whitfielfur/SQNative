import type { NativeDriver } from '../driver/native-driver.ts';
import type { Table, Infer } from '../schema/table.ts';
import type { QueryResult } from '../common/interfaces.ts';
import { BaseBuilder } from './base.ts';

export class InsertBuilder<T extends Table<any>> extends BaseBuilder {
  private table: T;
  private data: Partial<Infer<T>> | null = null;

  constructor(driver: NativeDriver, table: T) {
    super(driver);
    this.table = table;
  }

  values(data: Partial<Infer<T>>): this {
    this.data = data;
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    if (!this.data) throw new Error('No values provided for INSERT');

    const keys = Object.keys(this.data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');

    keys.forEach((key) => {
        // @ts-expect-error: Iterating over typed keys
        this.addParam(this.data[key]);
    });

    const sql = `INSERT INTO ${this.table.name} (${columns}) VALUES (${placeholders})`;
    return { sql, params: this.params };
  }

  execute(): QueryResult {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.run(...params);
  }
}