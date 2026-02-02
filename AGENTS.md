# IME 가이드 – AI Agent 진입점

이 저장소는 **IME(입력기) 가이드 문서 사이트**입니다. Astro Starlight로 빌드하며, 콘텐츠는 `src/content/docs/` 아래 MD/MDX로 관리합니다.

---

## 작업 시 참고

### 콘텐츠 추가/수정

1. **경로**: `src/content/docs/guide/`, `src/content/docs/korean/`, `src/content/docs/japanese/`, `src/content/docs/chinese/`, `src/content/docs/arabic/`, `src/content/docs/european/`, `src/content/docs/reference/`, `src/content/docs/editor/` 중 적절한 디렉터리에 MD/MDX 생성.
2. **사이드바**: 새 문서를 메뉴에 넣으려면 `astro.config.mjs`의 Starlight `sidebar`에 항목 추가.
3. **문체**: 모호한 표현(예: “업계 표준”, “일반적인”) 배제. 구체적 사실·동작·알고리즘만 기술.

### 사이트 구조/빌드 변경

- **설정**: `astro.config.mjs` (Starlight title, sidebar, base 등).
- **배포**: `.github/workflows/deploy.yml`. GitHub 저장소 설정에서 Pages 소스를 **GitHub Actions**로 지정.

### 로컬 확인

- 개발 서버: `pnpm dev`
- 빌드: `pnpm build`
- 빌드 결과 미리보기: `pnpm preview`

---

## 요약

| 작업 유형           | 할 일 |
|--------------------|--------|
| 새 문서 추가       | `src/content/docs/` 하위에 MD 작성 → `astro.config.mjs` sidebar 반영 |
| 기존 문서 수정     | 해당 MD/MDX 편집 |
| 사이트 설정 변경   | `astro.config.mjs` 수정 |
| 배포 방식 변경     | `.github/workflows/deploy.yml` 수정 |
