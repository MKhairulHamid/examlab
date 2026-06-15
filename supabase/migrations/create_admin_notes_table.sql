-- Admin notes: internal notes for tracking bugs/improvements on specific pages.
-- Access controlled entirely by the admin-api Edge Function (no RLS needed).

CREATE TABLE IF NOT EXISTS admin_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path   text        NOT NULL,
  page_title  text        NOT NULL DEFAULT '',
  note        text        NOT NULL,
  type        text        NOT NULL DEFAULT 'bug'
                          CHECK (type IN ('bug', 'improvement', 'question', 'other')),
  priority    text        NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('low', 'medium', 'high')),
  status      text        NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_notes_page_path_idx ON admin_notes (page_path);
CREATE INDEX IF NOT EXISTS admin_notes_status_idx    ON admin_notes (status);
