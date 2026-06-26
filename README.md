# DO SPORTS 실시간 시간표 v17

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.

## v17 변경 사항

- 같은 요일/같은 시간대에 수업이 여러 개 겹칠 때 카드 글씨를 작게 줄이지 않고, 요일 칸 자체가 오른쪽으로 넓어지도록 수정했습니다.
- 겹치는 카드가 2개, 3개 이상이어도 각 카드가 읽을 수 있는 최소 폭을 확보합니다.
- 수업명, 시간, 학년, 정원, 장소가 말줄임으로 잘리지 않도록 카드 내부 표시 방식을 수정했습니다.
- 가로로 넓어진 시간표는 좌우 스크롤로 볼 수 있습니다.
- 좌우 스크롤 시 시간 열은 왼쪽에 고정되어 시간대를 계속 확인할 수 있습니다.
- 카드 터치 후 펼치기 방식은 사용하지 않습니다.

## GitHub 업로드 구조

압축을 푼 뒤 `academy-live-schedule-v17` 폴더 안의 아래 5개 항목을 GitHub 저장소 루트에 업로드하세요.

```text
netlify
public
README.md
netlify.toml
package.json
```

## Netlify 환경변수

기존과 동일합니다.

```text
ADMIN_PASSWORD
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```

## 주소

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 저장 함수 확인: `/.netlify/functions/schedule`
