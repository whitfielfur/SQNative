import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver } from '../src/index.ts';

describe('NativeDriver', () => {
  const db = new NativeDriver(':memory:');

  before(() => {
    db.connect();
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT) STRICT;');
  });

  after(() => {
    db.disconnect();
  });

  test('should insert and select data', () => {
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    stmt.run('Alice');

    const select = db.prepare('SELECT * FROM users WHERE name = ?');
    const result = select.get('Alice') as { id: number; name: string };

    assert.equal(result.name, 'Alice');
    assert.equal(result.id, 1);
  });

  test('should handle transactions', () => {
    db.transaction(() => {
      db.prepare('INSERT INTO users (name) VALUES (?)').run('Bob');
      
      db.transaction(() => {
        db.prepare('INSERT INTO users (name) VALUES (?)').run('Charlie');
      });
    });

    const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
    assert.equal(count.c, 3);
  });
});