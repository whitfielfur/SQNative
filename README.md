# SQNative

> IAB: v0.3.0 (Migration Logic)  
> Note: This project is currently in early development. This release adds a programmatic Migration Engine.

SQNative is a zero-dependency toolkit for SQLite in Node.js.

Built exclusively on node:sqlite (Node.js v22.6+). Rejects C++ bindings, node-gyp, Python dependencies.

## Installation

```
not in npm!
```

Requires Node.js v22.6.0+. v24 LTS recommended.

## Features (v0.3.0)

Driver Layer: Native bindings, LRU cache, nested transactions.  
Schema Layer: TypeScript table definitions, DDL generation.  
Query Builder: Full CRUD, Joins, Aggregations.  
Migration Engine: Atomic migration tracking, TS/JS file loading.

## Usage

### Query Builder

```typescript
import { NativeDriver, table, integer, text } from 'sqnative';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull()
});

const db = new NativeDriver('./app.db');
db.connect();

// Insert
db.insertInto(Users).values({ name: 'Mikra' }).execute();

// Select
const user = db.selectFrom(Users)
  .where('name', '=', 'Mikra')
  .executeTakeFirst();
```

### Migrations (Programmatic)
```typescript
import { NativeDriver, Migrator } from 'sqnative';
import { resolve } from 'node:path';

const db = new NativeDriver('./app.db');
db.connect();

const migrator = new Migrator(db);

await migrator.migrateUp(resolve('./migrations'));
```

## Tests

```
npm test
```