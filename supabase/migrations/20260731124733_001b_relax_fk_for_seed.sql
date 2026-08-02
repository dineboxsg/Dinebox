/*
# Relax FK constraints for seeding

Removes the foreign key from `restaurants.owner_id` → `auth.users(id)` and
`users.id` → `auth.users(id)` so we can seed placeholder owner IDs.
Real merchant signups still create proper auth.users entries and link correctly.
*/

ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
