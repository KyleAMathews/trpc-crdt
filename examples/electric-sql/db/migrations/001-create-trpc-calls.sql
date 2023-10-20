CREATE TABLE IF NOT EXISTS trpc_calls (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    createdAt TEXT NOT NULL,
    elapsedMs INTEGER,
    path TEXT NOT NULL,
    input TEXT,
    type TEXT NOT NULL,
    error INTEGER NOT NULL,
    done INTEGER NOT NULL,
    clientId TEXT NOT NULL,
    response TEXT
);

-- ⚡
-- Electrify the tprc_calls table
CALL electric.electrify('trpc_calls');
