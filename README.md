# IME 가이드

에디터 개발 시 필요한 IME(입력기) 구조와 글자 조합(composition)에 대한 문서 사이트입니다.

- **스택**: Astro + Starlight. 콘텐츠는 `src/content/docs/` 아래 MD/MDX.
- **배포**: GitHub Pages (GitHub Actions). `base: '/'`.

## 요구 사항

- Node.js >= 18.20.8
- pnpm

## 명령

| 명령 | 동작 |
|------|------|
| `pnpm install` | 의존성 설치 |
| `pnpm dev` | 로컬 개발 서버 (localhost:4321) |
| `pnpm build` | `./dist/`에 프로덕션 빌드 |
| `pnpm preview` | 빌드 결과 로컬 미리보기 |

## 구조

- `astro.config.mjs` — 사이트·Starlight 설정, sidebar
- `src/content/docs/` — 가이드(guide), 한글(korean), 에디터 구현(editor) 문서
- `.github/workflows/deploy.yml` — GitHub Pages 배포
- `AGENTS.md` — AI 에이전트 진입점
- `.cursor/skills/add-ime-doc-content/` — 문서 추가/수정 시 참고 스킬

GitHub 저장소 설정에서 Pages 소스를 **GitHub Actions**로 지정하면 `main` 푸시 시 자동 배포됩니다.
