CREATE TABLE "trpc_calls" (
  "id" TEXT NOT NULL,
  "createdat" TEXT NOT NULL,
  "elapsedms" INTEGER,
  "path" TEXT NOT NULL,
  "input" TEXT,
  "type" TEXT NOT NULL,
  "error" INTEGER NOT NULL,
  "done" INTEGER NOT NULL,
  "clientid" TEXT NOT NULL,
  "response" TEXT,
  CONSTRAINT "trpc_calls_pkey" PRIMARY KEY ("id")
) WITHOUT ROWID;
