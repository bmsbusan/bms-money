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

-- ============================================================
-- 현장별 계좌번호 정리 (관리비 납부 계좌 안내용)
-- 위 sites 테이블과는 별개의 독립 목록입니다(이름이 100% 일치하지 않아도 됨).
-- ============================================================
CREATE TABLE IF NOT EXISTS site_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,
  bank TEXT DEFAULT '',                -- 은행명
  account_holder TEXT DEFAULT '',      -- 예금주
  account_number TEXT NOT NULL,        -- 관리비 납부 계좌번호
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_site_accounts_site ON site_accounts(site_name);

-- 사용자가 업로드한 "현장별 계좌번호 정리.xlsx"에서 각 현장의 "관리비"(또는 "관리비계좌")
-- 행을 확인해 옮겨 담은 초기 데이터입니다. 지산오차드힐은 원본 파일에 관리비 계좌가
-- 두 개(부산은행/새마을금고) 있어 부산은행 계좌를 우선 반영했으니, 실제 사용 계좌가
-- 다르면 화면에서 바로 수정해주세요.
INSERT OR IGNORE INTO site_accounts (site_name, bank, account_holder, account_number) VALUES
  ('베스아이하늘', '부산', '베스아이하늘운영회', '113-2020-5271-04'),
  ('범일골드빌', '부산', '범일골드빌 관리사무소', '101-2097-2897-00'),
  ('충렬지음', '부산', '충렬지음관리위원회 최창림', '101-2065-6045-00'),
  ('사상경보센트리안', '부산', '사상경보센트리안입주자대표회의 김해동', '101-2071-9156-04'),
  ('포르투나', '부산', '포르투나입주자대표회의 구모경', '101-2059-9160-03'),
  ('어반펠리체', '부산', '어반팰리체입주자대표회의 김장수', '101-2071-9786-02'),
  ('지산오차드힐', '부산', '지산오차드힐', '113-2014-6245-08'),
  ('송도타워', '부산', '송도타워맨션입주자대표회의 정민우', '052-01-025301-5'),
  ('창원비룡1,2차', '농협', '창원1.2차비룡벨로스텔라 관리사무소', '317-0020-8902-71'),
  ('오션테라스', '부산', '오션테라스상가관리단 권규정', '101-2068-9917-07'),
  ('큐엠시네마타워', '우리', '오계영', '1002-763-203595'),
  ('광안샤인빌딩', '부산', '광안샤인빌딩 장도근', '101-2067-2614-06'),
  ('예담빌딩', '부산', '예담빌딩관리단 장예경', '101-2085-0154-03'),
  ('암산빌딩', '부산', '암산빌딩 이재옥', '113-2016-8671-00'),
  ('반도유보라', '신협', '리버파크반도유보라상가', '131-021-825136'),
  ('포레나덕천1차 (구)', '부산', '포레나부산덕천상가관리단 홍종수', '113-2016-9088-04'),
  ('포레나덕천1차 (신)', '부산', '포레나덕천1상가관리회', '101-2095-7418-08'),
  ('포레나덕천2차', '부산', '포레나부산덕천2차상가관리단', '101-2095-8442-06');

-- ============================================================
-- 업무 메모 (경리 업무일지와 같은 형태이나 마감기한 없이 간단한 메모용:
-- 작업 날짜 / 현장 / 업무 내용 / 완료 여부만 기록. 자동 이월・지난 완료건 숨김 없음 —
-- 완료된 내역도 항상 이 화면에서 그대로 조회 가능)
-- ============================================================
CREATE TABLE IF NOT EXISTS work_memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,             -- 작업 날짜 YYYY-MM-DD
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',             -- 업무 내용
  done INTEGER NOT NULL DEFAULT 0,     -- 완료 여부 (0/1)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_work_memos_date ON work_memos(work_date);
CREATE INDEX IF NOT EXISTS idx_work_memos_site ON work_memos(site_name);
CREATE INDEX IF NOT EXISTS idx_work_memos_done ON work_memos(done);
