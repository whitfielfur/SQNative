import type { IDriver } from '../common/interfaces.ts';
import type { Table, Infer } from '../schema/table.ts';
import { BaseBuilder } from './base.ts';

export class SelectBuilder<T extends Table<any>> extends BaseBuilder {
  private table: T;
  private columns: string[] = ['*'];
  private whereClauses: string[] = [];
  private joins: string[] = [];
  private groupByClauses: string[] = [];
  private havingClauses: string[] = [];
  private limitValue: number | null = null;
  private orderByClause: string | null = null;

  constructor(driver: IDriver, table: T) {
    super(driver);
    this.table = table;
  }

  select(...columns: string[]): this {
    this.columns = columns;
    return this;
  }

  private join(type: 'INNER' | 'LEFT', table: Table<any>, on: string): this {
    this.joins.push(`${type} JOIN ${table.name} ON ${on}`);
    return this;
  }

  innerJoin(table: Table<any>, on: string): this {
    return this.join('INNER', table, on);
  }

  leftJoin(table: Table<any>, on: string): this {
    return this.join('LEFT', table, on);
  }

  where(column: string, op: string, value: unknown): this {
    this.whereClauses.push(`${column} ${op} ?`);
    this.addParam(value);
    return this;
  }

  groupBy(...columns: string[]): this {
    this.groupByClauses.push(...columns);
    return this;
  }

  having(column: string, op: string, value: unknown): this {
    this.havingClauses.push(`${column} ${op} ?`);
    this.addParam(value);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  toSQL(): { sql: string; params: unknown[] } {
    let sql = `SELECT ${this.columns.join(', ')} FROM ${this.table.name}`;

    if (this.joins.length > 0) {
      sql += ` ${this.joins.join(' ')}`;
    }

    if (this.whereClauses.length > 0) {
      sql += ` WHERE ${this.whereClauses.join(' AND ')}`;
    }

    if (this.groupByClauses.length > 0) {
      sql += ` GROUP BY ${this.groupByClauses.join(', ')}`;
    }

    if (this.havingClauses.length > 0) {
      sql += ` HAVING ${this.havingClauses.join(' AND ')}`;
    }

    if (this.orderByClause) {
      sql += ` ${this.orderByClause}`;
    }

    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    return { sql, params: this.params };
  }

  execute(): unknown[] {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.all(...params);
  }

  executeTakeFirst(): unknown | undefined {
    const { sql, params } = this.toSQL();
    const stmt = this.driver.prepare(sql);
    return stmt.get(...params);
  }
}