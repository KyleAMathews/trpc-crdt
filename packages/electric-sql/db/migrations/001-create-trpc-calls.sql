CREATE TABLE IF NOT EXISTS trpc_calls (
    id UUID PRIMARY KEY NOT NULL,
    createdAt DATE NOT NULL,
    elapsedMs INTEGER,
    path TEXT NOT NULL,
    input TEXT,
    type TEXT NOT NULL,
    error BOOLEAN NOT NULL,
    done BOOLEAN NOT NULL,
    clientId TEXT NOT NULL,
    response TEXT
);

-- ⚡
-- Electrify the tprc_calls table
CALL electric.electrify('trpc_calls');
