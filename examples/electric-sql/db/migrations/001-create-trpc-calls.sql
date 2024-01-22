CREATE TABLE IF NOT EXISTS trpc_calls (
    id UUID PRIMARY KEY NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL,
    elapsedMs INTEGER,
    path TEXT NOT NULL,
    input TEXT,
    type TEXT NOT NULL,
    state TEXT NOT NULL,
    clientId TEXT NOT NULL,
    response TEXT
);

-- ⚡
-- Electrify the tprc_calls table
ALTER TABLE trpc_calls ENABLE ELECTRIC;

