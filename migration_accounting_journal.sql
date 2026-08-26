-- ============================================================
-- 마이그레이션: 경리 업무일지 추가 + 시설 업무일지에 "완료" 여부 추가
-- 이미 배포되어 운영 중인 D1 데이터베이스에 실행합니다.
-- (기존 sites / records / journal_entries / followups 데이터는 건드리지 않습니다)
--
-- 실행 방법 (터미널에서 프로젝트 폴더로 이동한 뒤):
--   npx wrangler d1 execute bms-money-db --remote --file=./migration_accounting_journal.sql
--
-- ※ "bms-money-db" 는 wrangler.toml 의 [[d1_databases]] database_name 값입니다.
--   혹시 다른 이름으로 만드셨다면 wrangler.toml 에 적힌 실제 이름으로 바꿔서 실행하세요.
--
-- ※ 브라우저의 Cloudflare 대시보드 D1 Console에서 실행하실 경우, 아래 내용을
--   전체 복사해서 붙여넣고 실행(Execute)하시면 됩니다.
--
-- ⚠️ 주의: 맨 아래 "ALTER TABLE journal_entries ADD COLUMN done ..." 줄은
--   딱 한 번만 실행해야 합니다. 실수로 이 파일을 두 번 실행하게 되면
--   "duplicate column name: done" 이라는 오류 메시지가 뜨는데, 그 오류가
--   나온다는 것은 이미 예전에 적용이 끝났다는 뜻이니 그냥 무시하고 넘어가시면
--   됩니다 (위쪽의 새 표 생성 부분은 몇 번을 실행해도 안전합니다).
-- ============================================================

-- 경리 업무일지 (하루 단위 업무 기록: No / 현장 / 업무 / 마감기한 / 완료)
CREATE TABLE IF NOT EXISTS accounting_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL,
  site_name TEXT NOT NULL,
  content TEXT DEFAULT '',
  due_date TEXT,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_acct_journal_date ON accounting_journal(work_date);
CREATE INDEX IF NOT EXISTS idx_acct_journal_site ON accounting_journal(site_name);
CREATE INDEX IF NOT EXISTS idx_acct_journal_done ON accounting_journal(done);

-- 시설 업무일지(journal_entries)에 완료 여부 컬럼 추가 (한 번만 실행)
ALTER TABLE journal_entries ADD COLUMN done INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_journal_done ON journal_entries(done);
