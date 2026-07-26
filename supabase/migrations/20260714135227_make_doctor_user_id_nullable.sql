/*
# Make doctors.user_id nullable for demo seeding

## Changes
- Alter doctors.user_id to be nullable so demo doctors can be seeded without auth.users entries.
- This allows the public browse experience to show sample doctors immediately.
- Registered doctors will still have user_id set; seeded demo doctors use null.
*/

ALTER TABLE doctors ALTER COLUMN user_id DROP NOT NULL;
