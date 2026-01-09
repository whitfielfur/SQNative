export interface DriverOptions {
  readonly?: boolean;
  wal?: boolean;
  cacheSize?: number;
}

export interface QueryResult {
  changes: number;
  lastInsertRowid: number | bigint;
}