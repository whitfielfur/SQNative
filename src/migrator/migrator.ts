import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IDriver } from '../common/interfaces.ts';
import type { MigrationFile } from './types.ts';

export class Migrator {
  private db: IDriver;

  constructor(db: IDriver) {
    this.db = db;
  }

  ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _sqnative_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT;
    `);
  }

  getAppliedMigrations(): string[] {
    this.ensureTable();
    const stmt = this.db.prepare('SELECT name FROM _sqnative_migrations ORDER BY id ASC');
    const rows = stmt.all() as { name: string }[];
    return rows.map((r) => r.name);
  }

  markApplied(name: string): void {
    const stmt = this.db.prepare('INSERT INTO _sqnative_migrations (name) VALUES (?)');
    stmt.run(name);
  }

  markReverted(name: string): void {
    const stmt = this.db.prepare('DELETE FROM _sqnative_migrations WHERE name = ?');
    stmt.run(name);
  }

  async migrateUp(folderPath: string): Promise<void> {
    this.ensureTable();
    
    const applied = new Set(this.getAppliedMigrations());

    const files = await readdir(folderPath);
    
    const migrationFiles = files
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
      .sort();

    const pending = migrationFiles.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      return;
    }

    for (const file of pending) {
      const filePath = join(folderPath, file);
      
      // file:// URL for Windows
      const fileUrl = pathToFileURL(filePath).href;
      
      const migrationModule = await import(fileUrl) as MigrationFile;

      if (!migrationModule.up) {
        throw new Error(`Migration ${file} must export an 'up' function.`);
      }

      await migrationModule.up(this.db);
      
      this.markApplied(file);
    }
  }
}