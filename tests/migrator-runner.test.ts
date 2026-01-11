import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NativeDriver, Migrator } from '../src/index.ts';

const TEST_MIGRATIONS_DIR = join(tmpdir(), `sqnative-tests-${Date.now()}`);

describe('Migrator Runner', () => {
	const db = new NativeDriver(':memory:');
	const migrator = new Migrator(db);

	before(async () => {
		db.connect();

		await mkdir(TEST_MIGRATIONS_DIR, { recursive: true });

		const migrationContent = `
			export async function up(db) {
				db.exec("CREATE TABLE test_users (id INTEGER PRIMARY KEY, name TEXT)");
			}
			export async function down(db) {
				db.exec("DROP TABLE test_users");
			}
		`;

		await writeFile(join(TEST_MIGRATIONS_DIR, '20260101_init_users.ts'), migrationContent);
	});

	after(async () => {
		db.disconnect();
		try {
			await rm(TEST_MIGRATIONS_DIR, {recursive: true, force: true });
		} catch (e) {
			console.error('Failed to clean up temp dir:', e);
		}
//		await rm(TEST_MIGRATIONS_DIR, { recursive: true, force: true }); // TODO: Might be dangerous. Use tmpdir() from os
	});

  test('should apply pending migrations from file system', async () => {
    assert.throws(() => db.exec('SELECT * FROM test_users'), /no such table/);

    await migrator.migrateUp(TEST_MIGRATIONS_DIR);

    const applied = migrator.getAppliedMigrations();
    assert.ok(applied.includes('20260101_init_users.ts'));

    db.exec("INSERT INTO test_users (name) VALUES ('Test')");
    const row = db.prepare('SELECT * FROM test_users').get() as { name: string };
    assert.equal(row.name, 'Test');
  });

  test('should not apply same migration twice', async () => {
    await migrator.migrateUp(TEST_MIGRATIONS_DIR);

    const applied = migrator.getAppliedMigrations();
    assert.equal(applied.length, 1);
  });
});