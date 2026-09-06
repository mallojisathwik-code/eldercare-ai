# Known Issues & Migration Notes

## linkedElderId → linkedElderIds migration

The `User` model field `linkedElderId` was replaced with `linkedElderIds`
(an array of ObjectId) to support family accounts managing multiple elders.

### Existing data

Any users already in the database that have a `linkedElderId` value will
not be automatically migrated. If production data exists, run the following
once after deploying the new schema:

```js
// In mongo shell or a one-time script:
db.users.find({ linkedElderId: { $exists: true, $ne: null } }).forEach((u) => {
  db.users.updateOne(
    { _id: u._id },
    { $set: { linkedElderIds: [u.linkedElderId] }, $unset: { linkedElderId: "" } }
  );
});
```

After the migration, remove the `linkedElderId` field from the schema in
`server/models/User.js`.
