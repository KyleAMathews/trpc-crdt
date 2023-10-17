CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- ⚡
-- Electrify the tprc_calls table
CALL electric.electrify('users');

