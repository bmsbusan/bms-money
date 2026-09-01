-- ============================================================
-- 마이그레이션: "현장별 1년 스케줄표" 태그 이름에 이모지 추가
-- SCHEDULE_TAGS 목록이 "보험" -> "📓보험" 처럼 이모지가 붙은 이름으로 바뀌면서,
-- 이미 site_schedules 테이블에 저장되어 있는 기존 태그 값(이모지 없는 옛 이름)도
-- 새 이름으로 맞춰줘야 합니다. 이 SQL을 실행하지 않으면:
--   - 태그 필터 드롭다운에서 새 이름(예: "📓보험")을 선택해도 옛 이름으로 저장된
--     행은 걸러지지 않습니다(검색 결과 0건).
--   - 목록의 "월분별 조회" 정렬에서 옛 이름으로 저장된 행은 태그 우선순위를 알 수
--     없어 맨 뒤("기타"와 같은 순서)로 밀립니다.
--   - 그 행을 인라인 수정에서 다른 칸만 고쳐 저장하면, 태그가 "기타"로 자동
--     변경됩니다(서버가 알 수 없는 태그 값을 저장 시 "기타"로 정규화하기 때문).
--
-- 실행 방법 (Cloudflare 대시보드 D1 Console에 아래 내용 전체를 붙여넣고 Execute):
--   또는 npx wrangler d1 execute bms-money-db --remote --file=./migration_schedule_tag_emoji.sql
--
-- 몇 번을 실행해도 안전합니다(idempotent) — 이미 새 이름으로 바뀐 행은 WHERE 조건에
-- 맞지 않아 다시 바뀌지 않습니다.
-- ============================================================

UPDATE site_schedules SET tag = '📓보험' WHERE tag = '보험';
UPDATE site_schedules SET tag = '🏢 건물 점검' WHERE tag = '건물 점검';
UPDATE site_schedules SET tag = '🛠️설비 점검' WHERE tag = '설비 점검';
UPDATE site_schedules SET tag = '😷소독' WHERE tag = '소독';
UPDATE site_schedules SET tag = '💧저수조청소' WHERE tag = '저수조청소';
UPDATE site_schedules SET tag = '🪙세금' WHERE tag = '세금';
UPDATE site_schedules SET tag = '📖교육' WHERE tag = '교육';
-- "기타"는 이름이 바뀌지 않으므로 그대로 둡니다.
