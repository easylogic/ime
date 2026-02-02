---
name: add-ime-doc-content
description: Adds or edits IME guide documentation in this Starlight site. Use when adding a new doc page, editing existing IME guide content, or updating the docs structure in the ime repo.
---

# IME 가이드 콘텐츠 추가/수정

## 범위

- **대상**: 이 저장소(ime)의 문서 사이트. Astro Starlight, 콘텐츠는 `src/content/docs/` 아래 MD/MDX.
- **적용 시점**: 새 IME 관련 문서 추가, 기존 문서 본문 수정, 사이드바 구조 변경 시.

## 규칙

### 1. 문서 위치

- **가이드(공통)**: `src/content/docs/guide/` — IME 개요, 구조, 글자 조합, 글자 조합 방식·알고리즘, 키보드/IME별 차이.
- **한글**: `src/content/docs/korean/` — 조합 원리, 조합 규칙(겹모음·겹받침), 2벌식/3벌식 알고리즘, 입력기, 모바일 키보드, 입력기 구현, libhangul API.
- **일본어**: `src/content/docs/japanese/` — 조합 원리, 입력기, 모바일 키보드, 입력기 구현.
- **중국어**: `src/content/docs/chinese/` — 조합 원리, 입력기, 모바일 키보드, 입력기 구현.
- **아랍어**: `src/content/docs/arabic/` — 조합 원리, 입력기, 모바일 키보드, 입력기 구현.
- **유럽권**: `src/content/docs/european/` — 조합 원리, 입력기, 모바일 키보드, 입력기 구현.
- **참고**: `src/content/docs/reference/` — 브라우저·플랫폼별 IME 동작 차이, composition 시나리오별 처리 규칙, inputType 상세, 용어 정리, 트러블슈팅, 코드 예시, IME 구현 상세, 기존 프로젝트 소개.
- **에디터 구현**: `src/content/docs/editor/` — 에디터 구현 시 고려사항, IME 처리 코드 예시.
- **한글**: `korean/libhangul-api.md` — libhangul API 상세.

파일명은 소문자, 단어는 하이픈(`-`)으로 연결. 예: `keyboard-ime-differences.md`.

### 2. Frontmatter

Starlight frontmatter 필수:

```yaml
---
title: 페이지 제목
description: 한 줄 요약 (사이트/검색에 사용)
---
```

필요 시 `sidebar.order` 등 추가. Starlight frontmatter 문서 참고.

### 3. 사이드바 반영

새 문서를 네비게이션에 넣을 때는 `astro.config.mjs`의 Starlight `sidebar` 배열에 항목 추가. `slug`는 `src/content/docs/` 기준 경로에서 확장자 제외. 예: `guide/what-is-ime`, `korean/combination`.

### 4. 문체

- **한다**: 구체적 사실, 명세, 동작 결과만 기술.
- **하지 않는다**: “업계 표준”, “일반적인”, “현실적인” 등 모호하거나 암시적인 표현 사용 금지.

## 빠른 참고

- 설정: `astro.config.mjs`
- 콘텐츠 루트: `src/content/docs/`
- 로컬 확인: `pnpm dev`, `pnpm build`, `pnpm preview`
- 에이전트 진입점: 루트 `AGENTS.md`
