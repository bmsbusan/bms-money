-- ============================================================
-- 마이그레이션: "업무 메모" 탭 추가
-- 이미 배포되어 운영 중인 D1 데이터베이스에 새 표(work_memos)만 추가합니다.
-- (기존 sites/records/journal_entries/accounting_journal/followups/site_accounts 표는
--  전혀 건드리지 않으므로 기존 데이터는 안전합니다)
--
-- 실행 방법 (터미널에서 프로젝트 폴더로 이동한 뒤):
--   npx wrangler d1 execute bms-money-db --remote --file=./migration_work_memos.sql
--
-- ※ 브라우저의 Cloudflare 대시보드 D1 Console에서 실행하실 경우, 아래 내용을
--   전체 복사해서 붙여넣고 실행(Execute)하시면 됩니다.
-- ※ 이 파일은 몇 번을 실행해도 안전합니다(idempotent) — 표 생성이 전부 IF NOT EXISTS라,
--   이미 적용된 뒤 다시 실행해도 오류 없이 그냥 아무 변화 없이 끝납니다.
-- ============================================================

-- 업무 메모 (경리 업무일지와 같은 형태이나 마감기한 없이 간단한 메모용:
-- 작업 날짜 / 현장 / 업무 내용 / 완료 여부만 기록. 자동 이월・지난 완료건 숨김 없음 —
-- 완료된 내역도 항상 이 화면에서 그대로 조회 가능)
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
