# IME 새 주제 추가 설계

**날짜**: 2026-02-24  
**상태**: 승인 후 구현

---

## 1. 목적

접근 방식 1(넓게·얕게), 2(좁게·깊게), 3(역할 우선)을 통합해 다음을 추가한다.

- 역할별 진입 경로(문서 맵)
- 구현·QA용 체크리스트·테스트·디버깅 가이드
- 명세·버그 심화(텍스트 세그멘테이션, 브라우저 버그 인덱스)
- 다른 플랫폼(Electron·React Native 등) 요약
- 추가 문자계 한 블록 짧은 소개
- 기존 문서 보강(트러블슈팅 자소 분리, 코드 예시 상호 링크)

---

## 2. 추가 문서 목록

| # | 문서 | 경로 | 규모 |
|---|------|------|------|
| 1 | 시작하기 / 문서 맵 | guide/where-to-start.md | 1페이지 |
| 2 | IME 테스트·디버깅 가이드 | reference/ime-testing.md | 2~3페이지 |
| 3 | 구현 체크리스트 | editor/implementation-checklist.md | 1페이지 |
| 4 | 텍스트 세그멘테이션 | reference/text-segmentation.md | 1.5~2페이지 |
| 5 | 브라우저 IME 버그 인덱스 | reference/browser-ime-bugs.md | 1~2페이지 |
| 6 | 플랫폼별 IME (Electron·React Native 등) | reference/ime-other-platforms.md | 1페이지 |
| 7 | 기타 문자계 개요 | reference/other-scripts-overview.md | 0.5~1페이지 |

---

## 3. 문서별 내용

### 3.1 시작하기 (where-to-start.md)

- **구현자(에디터/입력 필드)**: 에디터 IME 구현 가이드 → 트러블슈팅 → 브라우저·플랫폼별 차이
- **QA/테스터**: IME 테스트 가이드 → 트러블슈팅 → 테스트 매트릭스
- **한글 조합/입력기 구현**: 한글 조합 원리 → 한글 입력기 구현 / libhangul API
- **버그/이상 동작**: 트러블슈팅 → composition 시나리오, IME별 이벤트
- **용어/명세**: 용어 정리, inputType 상세, 웹 IME 명세 요약

### 3.2 IME 테스트·디버깅 가이드 (ime-testing.md)

- 테스트 매트릭스: OS × 브라우저 × IME(한글/일본어/중국어) 표
- 시나리오 체크리스트: 조합 중 커서, Enter/Esc, blur, 붙여넣기, iOS 딕테이션, 데드키 등
- 로깅/재현: composition/input/keydown 로깅 코드, 문제 시 참고 문서 링크

### 3.3 구현 체크리스트 (implementation-checklist.md)

- compositionstart/update/end 구독
- compositionupdate 표시만, compositionend에서만 문서 반영
- isComposing/keyCode 229 시 keydown에서 단축키/Enter 무시
- input에서 !isComposing && insertText 처리
- blur 시 조합 상태 정리
- (선택) 붙여넣기 NFC 정규화
- 각 항목에서 implementation-notes·트러블슈팅 링크

### 3.4 텍스트 세그멘테이션 (text-segmentation.md)

- UAX #29 요약: 그래핀 클러스터, 단어, 문장 경계
- Intl.Segmenter: granularity grapheme/word/sentence, segment(), 브라우저 지원
- 에디터 적용: 커서·한 글자 삭제·선택 시 그래핀 단위
- 유니코드 기본·이모지 문서와 연결

### 3.5 브라우저 IME 버그 인덱스 (browser-ime-bugs.md)

- WebKit 261764 (iOS 딕테이션), 165004 (이벤트 순서), 164369 (blur compositionend)
- Mozilla 1675313 (Enter compositionend)
- 항목별: 버그 ID·링크·증상·영향·회피 방법·관련 문서

### 3.6 플랫폼별 IME (ime-other-platforms.md)

- Electron: 웹뷰 기반, composition 이벤트 동일·주의점
- React Native: 플랫폼 네이티브 입력, composition 유무
- CLI 등: 짧게 언급 또는 링크
- 공식 문서 링크

### 3.7 기타 문자계 개요 (other-scripts-overview.md)

- 티베트·에티오피아 등 한 블록 짧은 소개
- 조합 특성·유니코드 블록·기존 언어 문서와 차이
- 상세는 해당 문자계 전용 문서로 확장 가능하다고 안내

---

## 4. 기존 문서 보강

- **트러블슈팅**: "한글 검색/비교가 안 된다" 섹션 추가 → 원인(NFD), 해결(normalize NFC), 상세 mac-hangul-decomposition 링크
- **reference/code-examples.md**: 상단에 에디터 코드 예시(editor/code-examples) 링크 1줄
- **editor/code-examples.md**: 상단에 reference/code-examples 링크 1줄

---

## 5. 사이드바

- 가이드: "시작하기" (where-to-start) 추가
- 참고: "IME 테스트 가이드", "텍스트 세그멘테이션", "브라우저 IME 버그 인덱스", "다른 플랫폼 IME", "기타 문자계 개요" 추가
- 에디터: "구현 체크리스트" 추가

---

## 6. 우선순위(작업 순서)

1. 시작하기
2. 구현 체크리스트
3. IME 테스트·디버깅 가이드
4. 텍스트 세그멘테이션
5. 브라우저 버그 인덱스
6. 다른 플랫폼 IME
7. 기타 문자계 개요
8. 사이드바 반영
9. 트러블슈팅·코드 예시 보강
