export default [
  {
    "statements": [
      "CREATE TABLE \"trpc_calls\" (\n  \"id\" TEXT NOT NULL,\n  \"createdat\" TEXT NOT NULL,\n  \"elapsedms\" INTEGER,\n  \"path\" TEXT NOT NULL,\n  \"input\" TEXT,\n  \"type\" TEXT NOT NULL,\n  \"state\" TEXT NOT NULL,\n  \"clientid\" TEXT NOT NULL,\n  \"response\" TEXT,\n  CONSTRAINT \"trpc_calls_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.trpc_calls', 1);",
      "  /* Triggers for table trpc_calls */\n\n  -- ensures primary key is immutable\n  DROP TRIGGER IF EXISTS update_ensure_main_trpc_calls_primarykey;",
      "CREATE TRIGGER update_ensure_main_trpc_calls_primarykey\n  BEFORE UPDATE ON main.trpc_calls\nBEGIN\n  SELECT\n    CASE\n      WHEN old.id != new.id THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_trpc_calls_into_oplog;",
      "CREATE TRIGGER insert_main_trpc_calls_into_oplog\n   AFTER INSERT ON main.trpc_calls\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.trpc_calls')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'trpc_calls', 'INSERT', json_object('id', new.id), json_object('clientid', new.clientid, 'createdat', new.createdat, 'elapsedms', new.elapsedms, 'id', new.id, 'input', new.input, 'path', new.path, 'response', new.response, 'state', new.state, 'type', new.type), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_trpc_calls_into_oplog;",
      "CREATE TRIGGER update_main_trpc_calls_into_oplog\n   AFTER UPDATE ON main.trpc_calls\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.trpc_calls')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'trpc_calls', 'UPDATE', json_object('id', new.id), json_object('clientid', new.clientid, 'createdat', new.createdat, 'elapsedms', new.elapsedms, 'id', new.id, 'input', new.input, 'path', new.path, 'response', new.response, 'state', new.state, 'type', new.type), json_object('clientid', old.clientid, 'createdat', old.createdat, 'elapsedms', old.elapsedms, 'id', old.id, 'input', old.input, 'path', old.path, 'response', old.response, 'state', old.state, 'type', old.type), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_trpc_calls_into_oplog;",
      "CREATE TRIGGER delete_main_trpc_calls_into_oplog\n   AFTER DELETE ON main.trpc_calls\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.trpc_calls')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'trpc_calls', 'DELETE', json_object('id', old.id), NULL, json_object('clientid', old.clientid, 'createdat', old.createdat, 'elapsedms', old.elapsedms, 'id', old.id, 'input', old.input, 'path', old.path, 'response', old.response, 'state', old.state, 'type', old.type), NULL);\nEND;"
    ],
    "version": "1"
  },
  {
    "statements": [
      "CREATE TABLE \"users\" (\n  \"id\" TEXT NOT NULL,\n  \"name\" TEXT NOT NULL,\n  CONSTRAINT \"users_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "-- Toggles for turning the triggers on and off\nINSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.users', 1);",
      "  /* Triggers for table users */\n\n  -- ensures primary key is immutable\n  DROP TRIGGER IF EXISTS update_ensure_main_users_primarykey;",
      "CREATE TRIGGER update_ensure_main_users_primarykey\n  BEFORE UPDATE ON main.users\nBEGIN\n  SELECT\n    CASE\n      WHEN old.id != new.id THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\nDROP TRIGGER IF EXISTS insert_main_users_into_oplog;",
      "CREATE TRIGGER insert_main_users_into_oplog\n   AFTER INSERT ON main.users\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.users')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'users', 'INSERT', json_object('id', new.id), json_object('id', new.id, 'name', new.name), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_users_into_oplog;",
      "CREATE TRIGGER update_main_users_into_oplog\n   AFTER UPDATE ON main.users\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.users')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'users', 'UPDATE', json_object('id', new.id), json_object('id', new.id, 'name', new.name), json_object('id', old.id, 'name', old.name), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_users_into_oplog;",
      "CREATE TRIGGER delete_main_users_into_oplog\n   AFTER DELETE ON main.users\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.users')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'users', 'DELETE', json_object('id', old.id), NULL, json_object('id', old.id, 'name', old.name), NULL);\nEND;"
    ],
    "version": "2"
  }
]