import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver, table, integer, text, createTableSql } from '../src/index.ts';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
});

const Orders = table('orders', {
  id: integer().primaryKey().autoIncrement(),
  user_id: integer().notNull(),
  amount: integer().notNull(),
});

describe('Aggregation (GROUP BY & HAVING)', () => {
  const db = new NativeDriver(':memory:');

  before(() => {
    db.connect();
    db.exec(createTableSql(Users));
    db.exec(createTableSql(Orders));

    db.insertInto(Users).values({ name: 'Mikra' }).execute();
    db.insertInto(Users).values({ name: 'James' }).execute();

    db.insertInto(Orders).values({ user_id: 1, amount: 100 }).execute();
    db.insertInto(Orders).values({ user_id: 1, amount: 200 }).execute();
    
    db.insertInto(Orders).values({ user_id: 2, amount: 50 }).execute();
  });

  after(() => {
    db.disconnect();
  });

  test('GROUP BY: count orders per user', () => {
    const result = db.selectFrom(Users)
      .leftJoin(Orders, 'users.id = orders.user_id')
      .select('users.name', 'COUNT(orders.id) as count')
      .groupBy('users.id', 'users.name')
      .orderBy('users.name', 'DESC')
      .execute();

    const mikra = result[0] as { name: string; count: number };
    const james = result[1] as { name: string; count: number };

    assert.equal(mikra.name, 'Mikra');
    assert.equal(mikra.count, 2);
    
    assert.equal(james.name, 'James');
    assert.equal(james.count, 1);
  });

  test('HAVING: filter groups by aggregated value', () => {
    const result = db.selectFrom(Users)
      .innerJoin(Orders, 'users.id = orders.user_id')
      .select('users.name', 'SUM(orders.amount) as total')
      .groupBy('users.id', 'users.name')
      .having('SUM(orders.amount)', '>', 150)
      .execute();

    assert.equal(result.length, 1);
    
    const row = result[0] as { name: string; total: number };
    assert.equal(row.name, 'Mikra');
  });
});