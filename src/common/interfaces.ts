import type { StatementSync } from 'node:sqlite';

export interface QueryResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

// Интерфейс для разрыва циклической зависимости
export interface IDriver {
  prepare(sql: string): StatementSync;
  exec(sql: string): void;
}