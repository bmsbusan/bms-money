-- 경리 업무일지: "미완료 항목 자동 이월" 기능을 위한 DB 변경 스크립트
-- 이미 운영 중인(D1) 데이터베이스에 새 컬럼 하나(carried_from)를 추가합니다.
-- 기존 데이터는 전혀 지워지지 않고, 새 컬럼은 모든 기존 행에서 빈 값(NULL)으로 시작합니다.
--
-- [실행 방법 - 둘 중 편한 방법 하나만 하면 됩니다]
--
-- 방법 A) Cloudflare 대시보드에서 실행 (권장, wrangler 설치 불필요)
--   1. Cloudflare 대시보드 로그인 → Workers & Pages → D1 → 사용 중인 DB(예: bms-money-db) 클릭
--   2. 상단 "Console" 탭 클릭
--   3. 아래 SQL 한 줄을 그대로 붙여넣고 실행(Execute)
--
-- 방법 B) wrangler CLI가 있다면
--   npx wrangler d1 execute bms-money-db --remote --file=./migration_add_carried_from.sql
--   (DB 이름이 다르면 실제 이름으로 바꿔주세요. --remote 를 반드시 붙여야 실제 운영 DB에 적용됩니다.)

ALTER TABLE accounting_journal ADD COLUMN carried_from TEXT;
