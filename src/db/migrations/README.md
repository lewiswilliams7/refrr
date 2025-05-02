# Database Migrations

This directory contains database migration scripts for managing schema changes.

## Creating a New Migration

1. Create a new file in this directory with the format: `YYYYMMDD-description.js`
2. Export two functions:
   - `up`: Contains the changes to apply
   - `down`: Contains how to revert the changes

Example:
```javascript
// 20240101-add-user-roles.js
exports.up = async function(db) {
  await db.collection('users').updateMany(
    {},
    { $set: { role: 'user' } }
  );
};

exports.down = async function(db) {
  await db.collection('users').updateMany(
    {},
    { $unset: { role: '' } }
  );
};
```

## Running Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down

# Create a new migration
npm run migrate:create -- "description of migration"
``` 