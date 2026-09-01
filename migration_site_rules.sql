-- ============================================================
-- 마이그레이션: "관리규약" 탭 추가
-- 이미 배포되어 운영 중인 D1 데이터베이스에 site_rules 표만 추가합니다(현장별
-- 관리규약 파일의 메타데이터만 저장 — 파일 실물은 R2 버킷에 저장됩니다).
-- 기존 sites/records/journal_entries/accounting_journal/followups/site_accounts/
-- work_memos/site_schedules 표는 전혀 건드리지 않으므로 기존 데이터는 안전합니다.
--
-- ※ 이 마이그레이션과 별개로, R2 버킷(파일 저장소)을 Cloudflare 대시보드에서
--   미리 만들고 wrangler.toml에 바인딩을 추가해야 업로드/다운로드가 동작합니다.
--   자세한 절차는 함께 전달드리는 안내를 참고해주세요.
--
-- 실행 방법 (Cloudflare 대시보드 D1 Console에 아래 내용 전체를 붙여넣고 Execute):
--   또는 npx wrangler d1 execute bms-money-db --remote --file=./migration_site_rules.sql
--
-- 표 생성은 IF NOT EXISTS라 몇 번을 실행해도 안전합니다.
-- ============================================================

CREATE TABLE IF NOT EXISTS site_rules (
  site_name TEXT PRIMARY KEY,
  filename TEXT DEFAULT '',
  r2_key TEXT DEFAULT '',
  revision_date TEXT,
  uploaded_at TEXT,
  updated_at TEXT
);
