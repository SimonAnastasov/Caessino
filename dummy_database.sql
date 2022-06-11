DROP TABLE IF EXISTS "public"."players";
-- This script only contains the table creation statements and does not fully represent the table in database. It's still missing: indices, triggers. Do not use it as backup.

-- Squences
CREATE SEQUENCE IF NOT EXISTS players_id_seq;

-- Table Definition
CREATE TABLE "public"."players" (
    "id" int4 NOT NULL DEFAULT nextval('players_id_seq'::regclass),
    "username" text NOT NULL,
    "display_name" text NOT NULL,
    "credits" float8
);

DROP TABLE IF EXISTS "public"."stats";
-- This script only contains the table creation statements and does not fully represent the table in database. It's still missing: indices, triggers. Do not use it as backup.

-- Squences
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
-- This script only contains the table creation statements and does not fully represent the table in database. It's still missing: indices, triggers. Do not use it as backup.

-- Squences
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "username" text NOT NULL,
    "password" text NOT NULL,
    "salt" text NOT NULL
);

INSERT INTO "public"."players" ("id", "username", "display_name", "credits") VALUES
(9, 'david', 'Dvd', 1000);
INSERT INTO "public"."players" ("id", "username", "display_name", "credits") VALUES
(6, 'simon', 'Simon', 3553);
INSERT INTO "public"."players" ("id", "username", "display_name", "credits") VALUES
(8, 'gis', 'Gis', 1003);
INSERT INTO "public"."players" ("id", "username", "display_name", "credits") VALUES
(12, 'gigi', 'GG', 435),
(10, 'test', 'Tester', 1000),
(11, 'guest', 'guester', 1000);

INSERT INTO "public"."stats" ("id", "username", "blackjack_games", "roulette_games", "poker_games", "blackjack_won_games", "roulette_won_games", "poker_won_games", "money_bet", "money_earned") VALUES
(6, 'gis', 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO "public"."stats" ("id", "username", "blackjack_games", "roulette_games", "poker_games", "blackjack_won_games", "roulette_won_games", "poker_won_games", "money_bet", "money_earned") VALUES
(7, 'david', 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO "public"."stats" ("id", "username", "blackjack_games", "roulette_games", "poker_games", "blackjack_won_games", "roulette_won_games", "poker_won_games", "money_bet", "money_earned") VALUES
(10, 'gigi', 7, 0, 0, 3, 0, 0, 4187, 3122);
INSERT INTO "public"."stats" ("id", "username", "blackjack_games", "roulette_games", "poker_games", "blackjack_won_games", "roulette_won_games", "poker_won_games", "money_bet", "money_earned") VALUES
(8, 'test', 0, 0, 0, 0, 0, 0, 0, 0),
(9, 'guest', 0, 0, 0, 0, 0, 0, 0, 0),
(4, 'simon', 10, 0, 0, 5, 0, 0, 5180, 3899);

INSERT INTO "public"."users" ("id", "username", "password", "salt") VALUES
(10, 'simon', 'bcfdfad35ef0240e91e8bc969e0037b3ec1651a30fc5e0f56b2eb852124e592979f8b566abfbbe94872b43e43208e35053da81931a04d30f8b94460c2df52249', '99ab54b2affab7ec75ab3fbec005b4f0');
INSERT INTO "public"."users" ("id", "username", "password", "salt") VALUES
(12, 'gis', '4df04931f518225d0d55afc0db5e69cf5453a2d5ef0f6266223611aefc390f3c8971e37e75944d11f7ad185e3c5e5390c1fffbc5ef6d909a74adb6852ee2cfe0', '2a84f05ebf62c6d692f99dc72eec0c6e');
INSERT INTO "public"."users" ("id", "username", "password", "salt") VALUES
(13, 'david', 'e7cb9841fce607ab7d677fd3c6d02967249f92ac64c0bf0f14f84e1786f2a5787b2d2c7cbeece234f74aee0f75c27ae9fc354d088f30f89f5deef98865017ecb', 'a21f77281bba07b1d5ae5d5fe71ddf3d');
INSERT INTO "public"."users" ("id", "username", "password", "salt") VALUES
(14, 'test', '3b28f1d5ad3633ff23fbde106500e3ab6837779cad55092f83b9607294364177aa4eceb2e69f00bdd6f81cc6f062804a373d74503048dca1eceeb9de22425eab', '65ecbfcc453081ad8ae65470f7e50056'),
(15, 'guest', 'a67c607687003434a04f89d805cc95b0a59bd310dfef6358b7e17c2a3c7b216f8c0c91d919fbfeea3c45635682b241b19d5a9841d83da43f164287c526efb924', '59eb67f0023c9b6fd246ff33382f739d'),
(16, 'gigi', '690aa3232c85602d15fcaaf761ec0f7a14958df2c3054a177b5ac0a05584c959cde01015b009d95111798533add6bdf578867f5c58ebab8121a08b55b32c810c', '353a2adee3a03d28a7118ea138a76aac');
