import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver, table, integer, text, createTableSql } from '../src/index.ts';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
});

const Posts = table('posts', {
  id: integer().primaryKey().autoIncrement(),
  user_id: integer().notNull(),
  title: text().notNull(),
});

describe('Joins', () => {
  const db = new NativeDriver(':memory:');

  before(() => {
    db.connect();
    db.exec(createTableSql(Users));
    db.exec(createTableSql(Posts));

		db.insertInto(Users).values({ name: 'Mikra' }).execute();
		db.insertInto(Users).values({ name: 'James' }).execute();

		db.insertInto(Posts).values({ user_id: 1, title: 'Mikra Post 1' }).execute();
		db.insertInto(Posts).values({ user_id: 1, title: 'Mikra Post 2' }).execute();
		db.insertInto(Posts).values({ user_id: 2, title: 'James Post' }).execute();
  });

  after(() => {
    db.disconnect();
  });

  test('INNER JOIN: should fetch posts with user names', () => {
    
    const result = db.selectFrom(Users)
      .innerJoin(Posts, 'users.id = posts.user_id')
      .select('users.name', 'posts.title')
      .execute();

    assert.equal(result.length, 3);
    
    const row1 = result[0] as { name: string; title: string };
    assert.equal(row1.name, 'Mikra');
    assert.equal(row1.title, 'Mikra Post 1');
  });

  test('LEFT JOIN: should work correctly', () => {
    db.insertInto(Users).values({ name: 'Charlie' }).execute();

    const result = db.selectFrom(Users)
      .leftJoin(Posts, 'users.id = posts.user_id')
      .select('users.name', 'posts.title')
      .where('users.name', '=', 'Charlie')
      .execute();

    assert.equal(result.length, 1);
    
    const row = result[0] as { name: string; title: string | null };
    assert.equal(row.name, 'Charlie');
    assert.equal(row.title, null);
  });
});