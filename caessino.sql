DROP TABLE IF EXISTS "public"."admins";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS admins_id_seq;

-- Table Definition
CREATE TABLE "public"."admins" (
    "id" int4 NOT NULL DEFAULT nextval('admins_id_seq'::regclass),
    "username" text,
    "password" text,
    "salt" text
);

DROP TABLE IF EXISTS "public"."blackjack";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."blackjack" (
    "data" text,
    "identifier" text DEFAULT 'blackjack_data'::text
);

DROP TABLE IF EXISTS "public"."blackjack_history";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS blackjack_history_id_seq;

-- Table Definition
CREATE TABLE "public"."blackjack_history" (
    "id" int4 NOT NULL DEFAULT nextval('blackjack_history_id_seq'::regclass),
    "username" text,
    "history" text
);

DROP TABLE IF EXISTS "public"."complaints";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS complaints_id_seq;

-- Table Definition
CREATE TABLE "public"."complaints" (
    "id" int4 NOT NULL DEFAULT nextval('complaints_id_seq'::regclass),
    "date" text,
    "by" text,
    "description" text,
    "answered" text,
    "answer" text
);

DROP TABLE IF EXISTS "public"."credit_cards";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS credit_cards_id_seq;

-- Table Definition
CREATE TABLE "public"."credit_cards" (
    "id" int4 NOT NULL DEFAULT nextval('credit_cards_id_seq'::regclass),
    "username" text,
    "card_hash" text,
    "card_salt" text
);

DROP TABLE IF EXISTS "public"."players";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS players_id_seq;

-- Table Definition
CREATE TABLE "public"."players" (
    "id" int4 NOT NULL DEFAULT nextval('players_id_seq'::regclass),
    "username" text NOT NULL,
    "display_name" text NOT NULL,
    "credits" float8
);

DROP TABLE IF EXISTS "public"."poker";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."poker" (
    "data" text,
    "identifier" text DEFAULT 'poker_data'::text
);

DROP TABLE IF EXISTS "public"."poker_history";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS poker_history_id_seq;

-- Table Definition
CREATE TABLE "public"."poker_history" (
    "id" int4 NOT NULL DEFAULT nextval('poker_history_id_seq'::regclass),
    "username" text,
    "history" text
);

DROP TABLE IF EXISTS "public"."roulette";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."roulette" (
    "data" text,
    "identifier" text DEFAULT 'roulette_data'::text
);

DROP TABLE IF EXISTS "public"."roulette_history";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS roulette_history_id_seq;

-- Table Definition
CREATE TABLE "public"."roulette_history" (
    "id" int4 NOT NULL DEFAULT nextval('roulette_history_id_seq'::regclass),
    "username" text,
    "history" text
);

DROP TABLE IF EXISTS "public"."sessions";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."sessions" (
    "data" text,
    "identifier" text DEFAULT 'sessions_data'::text
);

DROP TABLE IF EXISTS "public"."stats";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS stats_id_seq;

-- Table Definition
CREATE TABLE "public"."stats" (
    "id" int4 NOT NULL DEFAULT nextval('stats_id_seq'::regclass),
    "username" text NOT NULL,
    "blackjack_games" int8,
    "roulette_games" int8,
    "poker_games" int8,
    "blackjack_won_games" int8,
    "roulette_won_games" int8,
    "poker_won_games" int8,
    "money_bet" int8,
    "money_earned" int8
);

DROP TABLE IF EXISTS "public"."users";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "username" text NOT NULL,
    "password" text NOT NULL,
    "salt" text NOT NULL,
    "email" text NOT NULL,
    "email_activation_id" text NOT NULL,
    "activated" text NOT NULL
);

INSERT INTO "public"."admins" ("id", "username", "password", "salt") VALUES
(1, 'admin', 'c7258f1d118136a210cbd591a5bf03236226d34e6567bdf4ccc780dcd96a722c4a21b3433eb282220d8d4172d99c2ad6a7c7be1d2ab3b20e090cf8d3c799d578', 'fd67bce156239de46b59f05aaed57435');


INSERT INTO "public"."blackjack" ("data", "identifier") VALUES
('[]', 'blackjack_data');




INSERT INTO "public"."complaints" ("id", "date", "by", "description", "answered", "answer") VALUES
(1, '2022-07-13T19:22:46.631+02:00', 'simon', 'I have a problem with logging in. It says my name is already taken.', 'true', 'Unfortunately, that means that someone else has already registered with that username before you. Please choose a different a username.');






INSERT INTO "public"."poker" ("data", "identifier") VALUES
('[]', 'poker_data');




INSERT INTO "public"."roulette" ("data", "identifier") VALUES
('{}', 'roulette_data');




INSERT INTO "public"."sessions" ("data", "identifier") VALUES
('[]', 'sessions_data');





