import { DatabaseSync, type StatementSync } from 'node:sqlite';
import type { DriverOptions } from '../common/interfaces.ts';
import { StatementCache } from './statement-cache.ts';
import { Transaction } from './transaction.ts';

import type { Table } from '../schema/table.ts';
import { SelectBuilder } from '../query-builder/select.ts';
import { InsertBuilder } from '../query-builder/insert.ts';

export class NativeDriver {
  private db: DatabaseSync | null = null;
  private cache: StatementCache;
  private transactionDepth = 0;
  private options: DriverOptions;
  // throw that "ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX" error in strip-only mode
  private path: string;

  constructor(path: string, options: DriverOptions = {}) {

    this.path = path;
    this.options = { wal: true, cacheSize: 100, ...options };
    this.cache = new StatementCache(this.options.cacheSize);
  }

  connect(): void {
    if (this.db) return;

    this.db = new DatabaseSync(this.path, {
      open: true,
      readOnly: this.options.readonly,
    });

    if (this.options.wal) {
      this.db.exec('PRAGMA journal_mode = WAL;');
      this.db.exec('PRAGMA synchronous = NORMAL;');
    }
    
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  disconnect(): void {
    if (this.db) {
      this.cache.clear();
      this.db.close();
      this.db = null;
    }
  }

  get isOpen(): boolean {
    return this.db !== null;
  }

  exec(sql: string): void {
    if (!this.db) throw new Error('Database not connected');
    this.db.exec(sql);
  }

  prepare(sql: string): StatementSync {
    if (!this.db) throw new Error('Database not connected');

    let stmt = this.cache.get(sql);
    if (!stmt) {
      stmt = this.db.prepare(sql);
      this.cache.set(sql, stmt);
    }
    return stmt;
  }

  transaction<T>(fn: (tx: Transaction) => T): T {
    const tx = new Transaction(this, this.transactionDepth);
    this.transactionDepth++;
    
    const savepoint = `SP_${tx.depth}`;
    
    if (tx.depth === 0) {
      this.exec('BEGIN IMMEDIATE');
    } else {
      this.exec(`SAVEPOINT ${savepoint}`);
    }

    try {
      const result = fn(tx);
      
      if (tx.depth === 0) {
        this.exec('COMMIT');
      } else {
        this.exec(`RELEASE SAVEPOINT ${savepoint}`);
      }
      
      this.transactionDepth--;
      return result;
    } catch (error) {
      if (tx.depth === 0) {
        this.exec('ROLLBACK');
      } else {
        this.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      }
      this.transactionDepth--;
      throw error;
    }
  }

    selectFrom<T extends Table<any>>(table: T): SelectBuilder<T> {
    return new SelectBuilder(this, table);
  }

  insertInto<T extends Table<any>>(table: T): InsertBuilder<T> {
    return new InsertBuilder(this, table);
  }
}