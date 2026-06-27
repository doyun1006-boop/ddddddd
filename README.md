# DO SPORTS 실시간 시간표 v21

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.

## v21 변경사항

- 학부모 화면에서 `전체보기 / 80% / 100% / 125% / 150%` 보기 버튼 제거
- 요일 이동 버튼 제거
- 모바일에서 좌우 스크롤 없이 월~금이 한 화면에 들어오도록 변경
- 시간표는 세로 스크롤 중심으로 작동하도록 변경
- 수업 카드가 시간대 칸을 길게 넘어가지 않도록 변경
- 실제 수업 시간은 카드 안에서 확인하도록 변경
- 같은 시간대 수업이 여러 개 있으면 같은 칸 안에서 아래로 쌓이도록 변경
- 수업명, 시간, 학년, 정원, 장소가 말줄임으로 잘리지 않도록 CSS 정리

## 업로드 구조

GitHub에는 이 폴더 자체가 아니라, 폴더 안의 아래 항목을 올려야 합니다.

```text
netlify
public
README.md
netlify.toml
package.json
```

## 관리자 주소

```text
/admin
```

## 필요한 Netlify 환경변수

```text
ADMIN_PASSWORD
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```
