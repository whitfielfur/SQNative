import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver, table, integer, text, createTableSql } from '../src/index.ts';

const Items = table('items', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
  status: text().default('active')
});

describe('Full CRUD', () => {
  const db = new NativeDriver(':memory:');

  before(() => {
    db.connect();
    db.exec(createTableSql(Items));
  });

  after(() => {
    db.disconnect();
  });

  test('CREATE: should insert item', () => {
    const res = db.insertInto(Items).values({ name: 'Item 1' }).execute();
    assert.equal(res.lastInsertRowid, 1);
  });

  test('READ: should select item', () => {
    const item = db.selectFrom(Items).where('id', '=', 1).executeTakeFirst();
    assert.equal(item?.name, 'Item 1');
    assert.equal(item?.status, 'active');
  });

  test('UPDATE: should update item status', () => {
    const res = db.update(Items)
      .set({ status: 'archived', name: 'Updated Item' })
      .where('id', '=', 1)
      .execute();
    
    assert.equal(res.changes, 1);

    const updated = db.selectFrom(Items).where('id', '=', 1).executeTakeFirst();
    assert.equal(updated?.status, 'archived');
    assert.equal(updated?.name, 'Updated Item');
  });

  test('DELETE: should remove item', () => {
    const res = db.deleteFrom(Items).where('id', '=', 1).execute();
    assert.equal(res.changes, 1);

    const deleted = db.selectFrom(Items).where('id', '=', 1).executeTakeFirst();
    assert.equal(deleted, undefined);
  });
});