import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver, table, integer, text, createTableSql } from '../src/index.ts';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
  role: text().default('user')
});

describe('Query Builder', () => {
  const db = new NativeDriver(':memory:');

  before(() => {
    db.connect();
    db.exec(createTableSql(Users));
  });

  after(() => {
    db.disconnect();
  });

  test('should insert data using builder', () => {
    const result = db.insertInto(Users)
      .values({ name: 'Alice', role: 'admin' })
      .execute();
    
    assert.equal(result.changes, 1);
    assert.equal(result.lastInsertRowid, 1);
  });

  test('should select data with where clause', () => {
    db.insertInto(Users).values({ name: 'Bob' }).execute();

    const alice = db.selectFrom(Users)
      .where('name', '=', 'Alice')
      .executeTakeFirst();
    
    assert.ok(alice);
    assert.equal(alice.name, 'Alice');
    assert.equal(alice.role, 'admin');

    const bob = db.selectFrom(Users)
      .where('id', '>', 1)
      .execute();
      
    assert.equal(bob.length, 1);
    assert.equal(bob[0].name, 'Bob');
  });

  test('should handle limit', () => {
    db.insertInto(Users).values({ name: 'Charlie' }).execute();
    
    const all = db.selectFrom(Users).limit(2).execute();
    assert.equal(all.length, 2);
  });
});