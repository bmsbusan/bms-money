-- ============================================================
-- 마이그레이션: 업무일지 + 후속 작업 기능 추가
-- 이미 배포되어 운영 중인 D1 데이터베이스에 새 표만 추가합니다.
-- (기존 sites / records 표는 전혀 건드리지 않으므로 기존 데이터는 안전합니다)
--
-- 실행 방법 (터미널에서 프로젝트 폴더로 이동한 뒤):
--   npx wrangler d1 execute bms-money-db --remote --file=./migration_journal_followup.sql
--
-- ※ "bms-money-db" 는 wrangler.toml 의 [[d1_databases]] database_name 값입니다.
--   혹시 다른 이름으로 만드셨다면 wrangler.toml 에 적힌 실제 이름으로 바꿔서 실행하세요.
-- ============================================================

-- 업무일지 (일일 작업 기록: 현장명 / 작업내역 / 비고)
CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_journal_site ON journal_entries(site_name);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(work_date);

-- 후속 작업 (앞으로 진행해야 하는 업무 등록 / 조회)
CREATE TABLE IF NOT EXISTS followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',
  due_date TEXT,
  status INTEGER NOT NULL DEFAULT 0,
  remarks TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_followups_site ON followups(site_name);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
