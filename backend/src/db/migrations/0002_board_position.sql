ALTER TABLE boards ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

UPDATE boards
SET position = (
  SELECT COUNT(*) - 1
  FROM boards AS other
  WHERE other.owner_id = boards.owner_id
    AND other.id <= boards.id
);
