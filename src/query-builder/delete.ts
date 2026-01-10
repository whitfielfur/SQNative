import type { IDriver, QueryResult } from '../common/interfaces.ts';
import type { Table, Infer } from '../schema/table.ts';
import { BaseBuilder } from './base.ts';

type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';

export class DeleteBuilder<T extends Table<any>> extends BaseBuilder {
  private table: T;
  private whereClauses: string[] = [];

  constructor(driver: IDriver, table: T) {
    super(driver);
    this.table = table;
  }

  where<K extends keyof Infer<T> & string>(column: K, op: Operator, value: unknown): this {
    this.whereClauses.push(`${column} ${op} ?`);
    this.addParam(value);
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    let sql = `DELETE FROM ${this.table.name}`;

    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(' AND ')}`;
    }

    return { sql, params: this.params };
  }

  execute(): QueryResult {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.run(...params);
  }
}