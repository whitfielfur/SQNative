# SQNative

> IAB: v0.2.2 (Full CRUD & Relations)  
> Note: This project is currently in early development. This release contains Driver, Schema, and advanced Query Builder (Joins, Aggregations).

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
Query Builder: Full CRUD (Insert, Select, Update, Delete).  
Advanced Querying: Inner/Left Joins, Group By, Having.

## Usage

```typescript
import { NativeDriver, table, integer, text, createTableSql } from 'sqnative';

const Users = table('users', {
  id: integer().primaryKey().autoIncrement(),
  name: text().notNull(),
  role: text().default('user')
});

const Posts = table('posts', {
  id: integer().primaryKey().autoIncrement(),
  user_id: integer().notNull(),
  title: text().notNull()
});

const db = new NativeDriver('./app.db');
db.connect();
db.exec(createTableSql(Users));
db.exec(createTableSql(Posts));

db.insertInto(Users).values({ name: 'Micra' }).execute();
db.update(Users).set({ role: 'admin' }).where('name', '=', 'Micra').execute();

const data = db.selectFrom(Users)
  .leftJoin(Posts, 'users.id = posts.user_id')
  .select('users.name', 'posts.title')
  .execute();
```

## Tests

```
npm test
```