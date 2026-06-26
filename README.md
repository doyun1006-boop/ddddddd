# DO SPORTS 실시간 시간표 v7

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.
관리자 화면에서 제목, 설명, 공지사항, 버튼 링크, 농구/축구/키즈 시간표를 직접 수정할 수 있습니다.

## 주소

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 저장 함수 확인: `/.netlify/functions/schedule`

## 필수 Netlify 환경변수

Netlify 프로젝트에서 아래 환경변수를 추가해야 저장이 됩니다.

### 1. ADMIN_PASSWORD

관리자 화면에서 입력할 비밀번호입니다.

```text
Key: ADMIN_PASSWORD
Value: 원하는 관리자 비밀번호
```

### 2. NETLIFY_SITE_ID

Netlify 프로젝트의 Site ID입니다.

찾는 곳:

```text
Project configuration → General → Site details → Site ID
```

등록 예시:

```text
Key: NETLIFY_SITE_ID
Value: 사이트 ID 값
```

### 3. NETLIFY_BLOBS_TOKEN

Netlify Personal access token입니다.

만드는 곳:

```text
Netlify 오른쪽 위 프로필 → User settings → Applications → Personal access tokens → New access token
```

등록 예시:

```text
Key: NETLIFY_BLOBS_TOKEN
Value: 생성한 personal access token
```

> 토큰은 절대 프론트엔드 코드에 넣지 마세요. Netlify Environment variables에만 넣어야 합니다.

## 환경변수 추가 후 필수 작업

환경변수를 추가하거나 수정한 뒤에는 반드시 다시 배포해야 합니다.

```text
Deploys → Trigger deploy → Deploy site
```

## GitHub 파일 구조

GitHub 저장소 첫 화면에 아래 파일과 폴더가 바로 보여야 합니다.

```text
public
netlify
package.json
netlify.toml
README.md
```

아래처럼 상위 폴더가 한 번 더 들어가 있으면 안 됩니다.

```text
academy-live-schedule-v7
  ├─ public
  ├─ netlify
  ├─ package.json
  └─ netlify.toml
```

## 저장 오류가 뜰 때

관리자 페이지에서 저장할 때 아래 오류가 나오면:

```text
The environment has not been configured to use Netlify Blobs...
```

Netlify 환경변수에 아래 두 개가 빠진 것입니다.

```text
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```

추가 후 다시 배포하세요.
