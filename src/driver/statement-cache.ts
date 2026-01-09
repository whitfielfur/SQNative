import type { StatementSync } from 'node:sqlite';

export class StatementCache {
  private cache = new Map<string, StatementSync>();
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(sql: string): StatementSync | undefined {
    const stmt = this.cache.get(sql);
    if (stmt) {
      this.cache.delete(sql);
      this.cache.set(sql, stmt);
    }
    return stmt;
  }

  set(sql: string, stmt: StatementSync): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(sql, stmt);
  }

  clear(): void {
    this.cache.clear();
  }
}