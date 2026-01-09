# SQNative

> IAB: v0.2.0 (Schema & Query Builder)  
> Note: This project is currently in early development. This release contains Driver, Schema, and Query Builder layers.

SQNative is a zero-dependency toolkit for SQLite in Node.js.

Built exclusively on node:sqlite (Node.js v22.6+). Rejects C++ bindings, node-gyp, Python dependencies.

## Installation

```
not in npm!
```

Requires Node.js v22.6.0+. v24 LTS recommended.

## Features (v0.2.0)

Driver Layer: Native bindings, LRU cache, nested transactions.  
Schema Layer: TypeScript table definitions, DDL generation.  
Query Builder: Type-safe insertInto, selectFrom, inference.

## Usage

```typescript
import { NativeDriver, table, integer, text, createTableSql } from 'sqnative';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
  role: text().default('user')
});

const db = new NativeDriver('./app.db');
db.connect();
db.exec(createTableSql(Users));

db.insertInto(Users)
  .values({ name: 'Alice', role: 'admin' })
  .execute();

const user = db.selectFrom(Users)
  .where('name', '=', 'Alice')
  .executeTakeFirst();
```

## Tests

```
npm test
```