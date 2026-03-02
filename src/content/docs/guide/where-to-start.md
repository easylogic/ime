---
title: 시작하기
description: 역할별 문서 읽는 순서 — 구현자, QA, 한글 입력기 구현, 버그 해결, 용어·명세
---

역할에 따라 **어디서부터 읽을지** 정리했다. 링크를 따라가면 필요한 문서를 순서대로 찾을 수 있다.

---

## 에디터·입력 필드를 만드는 경우

1. [에디터 IME 구현 가이드](/docs/editor/implementation-notes) — composition 이벤트 처리, 예외 케이스, 완전한 구현
2. [구현 체크리스트](/docs/editor/implementation-checklist) — IME 쪽 구현이 빠지지 않았는지 점검
3. [트러블슈팅](/docs/reference/troubleshooting) — 증상별 원인·해결
4. 문제 발생 시 [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks)

---

## QA·테스터 — IME를 어디까지 테스트할지

1. [IME 테스트·디버깅 가이드](/docs/reference/ime-testing) — 테스트 매트릭스, 시나리오 체크리스트, 로깅·재현
2. [트러블슈팅](/docs/reference/troubleshooting) — 예상 동작·테스트 매트릭스
3. [브라우저 IME 버그 인덱스](/docs/reference/browser-ime-bugs) — 알려진 버그·회피 방법

---

## 한글 조합 알고리즘·입력기를 직접 구현하는 경우

1. [한글 조합 원리](/docs/korean/combination)
2. [한글 입력기 구현](/docs/korean/implementation) — 상태 머신, JavaScript 구현
3. [libhangul API](/docs/korean/libhangul-api) — C 라이브러리 사용 시
4. [2벌식·3벌식 알고리즘](/docs/korean/2-set-algorithm), [3벌식](/docs/korean/3-set-algorithm)

---

## 버그·이상 동작 해결

1. [트러블슈팅](/docs/reference/troubleshooting) — 증상별 원인·해결
2. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)
3. [IME별 composition 이벤트](/docs/reference/composition-events-by-ime)
4. [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks)

---

## 용어·명세 참고

1. [용어 정리](/docs/reference/glossary) — preedit, commit, composition 등
2. [inputType 상세](/docs/reference/inputtype) — beforeinput/input의 inputType
3. [웹 IME 명세 요약](/docs/reference/web-ime-specs) — 명세에서 요구하는 것·선택 사항
4. [용어 인덱스](/docs/reference/term-index)
