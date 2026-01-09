import type { NativeDriver } from '../driver/native-driver.ts';
import type { Table, Infer } from '../schema/table.ts';
import { BaseBuilder } from './base.ts';

type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';

export class SelectBuilder<T extends Table<any>> extends BaseBuilder {
  private table: T;
  private whereClauses: string[] = [];
  private limitValue: number | null = null;
  private offsetValue: number | null = null;

  constructor(driver: NativeDriver, table: T) {
    super(driver);
    this.table = table;
  }

  where<K extends keyof Infer<T> & string>(column: K, op: Operator, value: unknown): this {
    this.whereClauses.push(`${column} ${op} ?`);
    this.addParam(value);
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    let sql = `SELECT * FROM ${this.table.name}`;

    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(' AND ')}`;
    }

    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    return { sql, params: this.params };
  }

  execute(): Infer<T>[] {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.all(...params) as Infer<T>[];
  }

  executeTakeFirst(): Infer<T> | undefined {
    this.limit(1);
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.get(...params) as Infer<T> | undefined;
  }
}