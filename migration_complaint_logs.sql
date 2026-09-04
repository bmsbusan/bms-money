CREATE TABLE IF NOT EXISTS complaint_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',
  result TEXT DEFAULT '',
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_complaint_logs_date ON complaint_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_complaint_logs_site ON complaint_logs(site_name);
CREATE INDEX IF NOT EXISTS idx_complaint_logs_done ON complaint_logs(done);
