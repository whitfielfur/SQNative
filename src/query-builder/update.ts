import type { IDriver, QueryResult } from '../common/interfaces.ts';
import type { Table, Infer } from '../schema/table.ts';
import { BaseBuilder } from './base.ts';

type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';

export class UpdateBuilder<T extends Table<any>> extends BaseBuilder {
  private table: T;
  private values: Partial<Infer<T>> | null = null;
  private whereClauses: string[] = [];

  constructor(driver: IDriver, table: T) {
    super(driver);
    this.table = table;
  }

  set(values: Partial<Infer<T>>): this {
    this.values = values;
    return this;
  }

  // @ts-ignore: override signature compatibility hack
  override where<K extends keyof Infer<T> & string>(column: K, op: Operator, value: unknown): this {
    this.whereClauses.push(`${column} ${op} ?`);
    this.addParam(value);
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    if (!this.values || Object.keys(this.values).length === 0) {
      throw new Error('No values provided for UPDATE');
    }

    const setParts: string[] = [];
    const setParams: unknown[] = [];

    for (const [key, value] of Object.entries(this.values)) {
      setParts.push(`${key} = ?`);
      setParams.push(value);
    }

    const finalParams = [...setParams, ...this.params];

    let sql = `UPDATE ${this.table.name} SET ${setParts.join(', ')}`;

    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(' AND ')}`;
    }

    return { sql, params: finalParams };
  }

  execute(): QueryResult {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.run(...params);
  }
}