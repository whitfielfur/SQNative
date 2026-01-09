import type { Table } from './table.ts';

export function createTableSql(table: Table<any>): string {
  const lines: string[] = [];

  for (const col of Object.values(table.columns)) {
    const d = col.data;
    const parts = [d.name, d.type];

    if (d.isPrimaryKey) {
      parts.push('PRIMARY KEY');
      if (d.autoIncrement) parts.push('AUTOINCREMENT');
    }

    if (d.isNotNull && !d.isPrimaryKey) {
      parts.push('NOT NULL');
    }

    if (d.isUnique) {
      parts.push('UNIQUE');
    }

    if (d.defaultValue !== undefined) {
      const val = typeof d.defaultValue === 'string' 
        ? `'${d.defaultValue}'` 
        : d.defaultValue;
      parts.push(`DEFAULT ${val}`);
    }

    lines.push(parts.join(' '));
  }

  return `CREATE TABLE IF NOT EXISTS ${table.name} (\n  ${lines.join(',\n  ')}\n) STRICT;`;
}