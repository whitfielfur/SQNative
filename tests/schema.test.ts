import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { table, text, integer, createTableSql } from '../src/index.ts';

describe('Schema Layer', () => {
  test('should generate correct DDL for simple table', () => {
    const Users = table('users', {
      id: integer().primaryKey().autoIncrement(),
      name: text().notNull(),
      email: text().unique(),
      age: integer().default(18)
    });

    const sql = createTableSql(Users);
    
    const normalized = sql.replace(/\s+/g, ' ').trim();
    const expected = "CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE, age INTEGER DEFAULT 18 ) STRICT;";

    assert.equal(normalized, expected);
  });

  test('should handle nullable columns correctly', () => {
    const Posts = table('posts', {
      id: integer().primaryKey(),
      content: text()
    });

    const sql = createTableSql(Posts);
    assert.ok(sql.includes('content TEXT'));
    assert.ok(!sql.includes('content TEXT NOT NULL'));
  });
});