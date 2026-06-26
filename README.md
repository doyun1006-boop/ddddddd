# DO SPORTS 실시간 시간표 v16

Netlify + GitHub로 배포하는 DO SPORTS 실시간 수업 시간표입니다.

## v16 변경 내용

- 수업 시간이 비슷하거나 겹칠 때, 카드 글씨를 억지로 작게 만들지 않고 시간대 칸 높이를 자동으로 키우도록 개선했습니다.
- `15:30~16:20`처럼 정각이 아닌 수업도 카드가 잘리지 않도록 행 높이와 카드 높이를 함께 계산합니다.
- `18:00~19:30`처럼 1시간을 넘는 수업은 18:00~ 칸에서 시작해 19:00~ 칸까지 자연스럽게 이어집니다.
- 카드 터치 후 펼치기 방식은 제거했습니다. 학부모 화면에서는 처음부터 주요 정보가 바로 보이도록 했습니다.
- v13의 수업분류 추가 기능, v12의 버튼 추가 기능, v11의 모바일 스크롤 안정화 기능은 그대로 유지됩니다.

## 업로드 구조

GitHub에는 이 폴더 안의 아래 항목들을 올리세요.

```text
netlify
public
README.md
netlify.toml
package.json
```

## 필요한 Netlify 환경변수

```text
ADMIN_PASSWORD
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```

## 주소

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 저장 함수 확인: `/.netlify/functions/schedule`
