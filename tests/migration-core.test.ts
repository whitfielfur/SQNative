import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NativeDriver, Migrator } from '../src/index.ts';

describe('Migrator Core', () => {
	const db = new NativeDriver(':memory:');
	const migrator = new Migrator(db);

	before(() => {
		db.connect();
	});

	after(() => {
		db.disconnect();
	});

	test('should create tracking table automatically', () => {
		const applied = migrator.getAppliedMigrations();
		assert.deepEqual(applied, []);

		const check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_sqnative_migrations'");
		const result = check.get();
		assert.ok(result);
	});

	test('should log and unlog migrations', () => {
		const migrationName = '20261101_init';

		migrator.markApplied(migrationName);

		let applied = migrator.getAppliedMigrations();
		assert.deepEqual(applied, [migrationName]);

		migrator.markReverted(migrationName);

		applied = migrator.getAppliedMigrations();
		assert.deepEqual(applied, []);
	});
});