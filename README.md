# DO SPORTS 실시간 시간표 v20

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.

## v20 변경사항

- 모바일/PC에서 `전체보기`가 시간표 전체를 화면에 맞춰 보여줍니다.
- 기존 `transform: scale()` 방식 대신 실제 그리드 크기를 다시 계산하는 방식으로 변경했습니다.
- 손가락으로 확대/pinch zoom 한 뒤에도 브라우저가 실제 스크롤 영역을 인식하도록 수정했습니다.
- 시간표 좌우 스크롤, 세로 페이지 스크롤, 브라우저 확대를 함께 사용할 수 있게 개선했습니다.
- 카드 글씨를 말줄임 처리하지 않고 가능한 한 실제 정보가 보이도록 유지했습니다.

## GitHub 업로드

압축을 푼 뒤 폴더 안의 아래 항목을 GitHub 저장소 루트에 업로드하세요.

```text
netlify
public
README.md
netlify.toml
package.json
```

커밋 메시지 예시:

```text
fix pinch zoom scroll v20
```

## Netlify 환경변수

기존과 동일합니다.

```text
ADMIN_PASSWORD
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```
