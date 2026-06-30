# DO SPORTS 실시간 시간표 v23

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.

## v23 변경사항

- 카카오톡 인앱 브라우저와 모바일 브라우저에서 손가락 확대/축소가 가능하도록 viewport 설정을 수정했습니다.
- `user-scalable=no`, `maximum-scale=1` 제한을 제거했습니다.
- 모바일에서 좌우 스크롤 방식은 유지하지 않고, 페이지 전체 확대는 허용했습니다.
- 시간표 구조는 v22 기준을 유지합니다.
  - 보기/확대 버튼 없음
  - 좌우 스크롤 없음
  - 같은 시간대 수업은 세로로 쌓임
  - 해당 시간대 행 높이 자동 확장
  - 실제 수업 시간은 카드 내부에서 확인

## 주소

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 저장 함수 확인: `/.netlify/functions/schedule`

## 필수 Netlify 환경변수

- `ADMIN_PASSWORD`
- `NETLIFY_SITE_ID`
- `NETLIFY_BLOBS_TOKEN`

## 배포 방법

GitHub 저장소 루트에 아래 5개 항목을 업로드합니다.

```text
netlify
public
README.md
netlify.toml
package.json
```

커밋 메시지 예시:

```text
enable mobile pinch zoom v23
```
