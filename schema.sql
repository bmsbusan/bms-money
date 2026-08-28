-- 현장 목록 테이블
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 청구/입금 내역 테이블
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  work_date TEXT,                      -- 작업 날짜 YYYY-MM-DD (월별 히스토리 집계 기준)
  content TEXT DEFAULT '',
  cost INTEGER NOT NULL DEFAULT 0,
  billed INTEGER NOT NULL DEFAULT 0,   -- 청구 여부 (0/1)
  paid INTEGER NOT NULL DEFAULT 0,     -- 입금 여부 (0/1)
  paid_date TEXT,                      -- 입금일 YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_site ON records(site_name);
CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);
CREATE INDEX IF NOT EXISTS idx_records_work_date ON records(work_date);

-- 초기 현장 목록 (요청 주신 22개 현장)
INSERT OR IGNORE INTO sites (name, sort_order) VALUES
  ('샤인빌딩', 1),
  ('예담빌딩', 2),
  ('암산빌딩', 3),
  ('오션테라스', 4),
  ('반도유보라', 5),
  ('포레나1차', 6),
  ('포레나2차', 7),
  ('큐엠시네마타워', 8),
  ('동춘빌딩', 9),
  ('태화빌딩', 10),
  ('디오', 11),
  ('메디플러스', 12),
  ('남문시장', 13),
  ('베스아이하늘', 14),
  ('충렬지음', 15),
  ('사상경보센트리안', 16),
  ('포르투나', 17),
  ('어반펠리체', 18),
  ('지산오차드힐', 19),
  ('송도타워', 20),
  ('창원비룡1,2차', 21),
  ('범일골드빌', 22);

-- ============================================================
-- 업무일지 (일일 작업 기록: 현장명 / 작업내역 / 비고)
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,             -- 작업 날짜 YYYY-MM-DD
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',             -- 작업내역
  remarks TEXT DEFAULT '',             -- 비고
  done INTEGER NOT NULL DEFAULT 0,     -- 완료 여부 (0/1)
  carried_from TEXT,                   -- 자동 이월된 경우, 최초 작업일(원래 날짜) YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_journal_site ON journal_entries(site_name);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(work_date);
CREATE INDEX IF NOT EXISTS idx_journal_done ON journal_entries(done);

-- ============================================================
-- 경리 업무일지 (하루 단위 업무 기록: No / 현장 / 업무 / 마감기한 / 완료)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounting_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,             -- 이 일지가 속한 날짜 YYYY-MM-DD
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',             -- 업무 내용
  due_date TEXT,                       -- 마감기한 YYYY-MM-DD (선택)
  done INTEGER NOT NULL DEFAULT 0,     -- 완료 여부 (0/1)
  carried_from TEXT,                   -- 자동 이월된 경우, 최초 작업일(원래 날짜) YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_acct_journal_date ON accounting_journal(work_date);
CREATE INDEX IF NOT EXISTS idx_acct_journal_site ON accounting_journal(site_name);
CREATE INDEX IF NOT EXISTS idx_acct_journal_done ON accounting_journal(done);

-- ============================================================
-- 후속 작업 (앞으로 진행해야 하는 업무 등록 / 조회)
-- ============================================================
CREATE TABLE IF NOT EXISTS followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',             -- 처리해야 할 내용
  due_date TEXT,                       -- 예정일 YYYY-MM-DD (선택)
  status INTEGER NOT NULL DEFAULT 0,   -- 0: 대기(미완료), 1: 완료
  remarks TEXT DEFAULT '',             -- 비고
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_followups_site ON followups(site_name);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
