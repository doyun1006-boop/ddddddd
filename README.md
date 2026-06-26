# DO SPORTS 실시간 시간표 v9

Netlify + GitHub로 배포하는 DO SPORTS 실시간 시간표입니다.

## v9 변경점

- 학부모 화면을 예시 이미지처럼 어두운 보드형 시간표 디자인으로 변경
- 상단을 `DO SPORTS 잠실점 시간표` 형태의 간단한 헤더로 정리
- 연결 상태 표시와 관리자 편집 버튼 추가
- 공지사항 바를 노란색 강조형으로 변경
- 농구교실 / 축구교실 / 키즈스포츠 탭을 보드형 버튼으로 변경
- 평일 수업은 월~금 표 형태로 표시
- 토/일 수업이 있으면 주말 수업 표가 별도로 표시
- 수업 카드 색상 자동 구분
  - 농구/오픈반: 파란색
  - 모집중/축구/비기너: 초록색
  - 유치부/키즈/결스/심화: 자주색
- 모바일에서도 카드형보다 시간표 보드 형태가 유지되도록 조정

## GitHub 업로드 구조

GitHub 저장소 첫 화면에 아래 항목이 바로 보여야 합니다.

```text
netlify
public
README.md
netlify.toml
package.json
```

`academy-live-schedule-v9` 폴더 자체를 올리지 말고, 그 안의 파일과 폴더를 올리세요.

## Netlify 환경변수

기존과 동일하게 아래 3개가 필요합니다.

```text
ADMIN_PASSWORD
NETLIFY_SITE_ID
NETLIFY_BLOBS_TOKEN
```

환경변수 수정 후에는 반드시 Netlify에서 재배포하세요.

```text
Deploys → Trigger deploy → Deploy site
```

## 주소

- 학부모 화면: `/`
- 관리자 화면: `/admin`
- 저장 함수 확인: `/.netlify/functions/schedule`

## 관리자에서 수정 가능한 항목

- 학원명
- 메인 제목
- 메인 설명
- 공지사항
- 개설 희망 버튼명/링크
- 반 모으기 버튼명/링크
- 상담 및 신청서 작성 버튼명/링크
- 수업 종목
- 요일
- 시작/종료 시간
- 수업명
- 학년
- 정원
- 현재원
- 장소
