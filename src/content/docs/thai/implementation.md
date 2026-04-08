---
title: 태국어 입력기 구현
description: 자음·모음·성조 시퀀스, 그래핀·단어 경계, 플랫폼 preedit·commit
---

태국어 입력기는 **자음·모음·성조** 키 시퀀스를 OS가 **한 음절**(여러 코드 포인트일 수 있음)로 조합한다. [태국어 조합 원리](/docs/thai/combination)의 유니코드·그래핀·단어 경계 규칙을 엔진·에디터가 함께 지켜야 한다. 웹에서는 **OS IME** 결과만 처리하는 경우가 대부분이다.

---

## 1. 구현할 것 요약

1. **키 매핑**: 레이아웃(Pattachote 등)에 따라 **물리 키 → 자음/모음/성조 코드 포인트**(U+0E00~U+0E7F 및 결합 문자) 순서를 정한다.
2. **조합 중(preedit)**: 음절이 완성되기 전 문자열을 preedit으로 표시. **compositionupdate**의 `data`가 그에 해당할 수 있다.
3. **commit**: 음절 확정 시 **compositionend**의 `data` 또는 **insertText**의 `data`를 문서에 반영. 한 번에 **여러 코드 포인트**가 들어올 수 있다.
4. **그래핀**: 커서·Backspace·선택은 **코드 유닛이 아니라** [텍스트 세그멘테이션](/docs/reference/text-segmentation)에 따른 **그래핀 클러스터** 경계를 쓴다. `Intl.Segmenter('th', { granularity: 'grapheme' })`.
5. **단어 경계**: 태국어는 **공백 없이** 이어 쓰는 경우가 많아, "단어 단위" 이동·삭제는 **Intl.Segmenter** `granularity: 'word'`, locale `'th'` 또는 별도 분절기가 필요하다.

---

## 2. 유니코드·저장 형태

- 같은 음절이 **precomposed 한 코드 포인트**와 **자음 + 결합 모음 + 결합 성조**의 **분해형**으로 표현될 수 있다. 비교·검색 시 **NFC/NFD 통일**을 검토한다.
- IME 구현 시 **출력 정규화**를 고정하면 저장 형태가 일정해진다.

---

## 3. 웹·플랫폼에서의 이벤트

- **Windows TSF / macOS / Linux(IBus·Fcitx)**: [태국어 입력기](/docs/thai/input-methods)에 정리된 대로 preedit·commit을 전달한다.
- **composition**이 있으면 조합 구간만 임시 표시하고 **compositionend**에서 반영한다.
- **composition 없이 insertText만** 오는 환경에서는 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)에 따라 `insertText`를 commit으로 처리한다.

---

## 4. 네이티브·자체 IME 시 추가 고려

- **음절 미완성 버퍼**: 자음만 입력된 상태 등에서 표시할 preedit 문자열 규칙을 정한다.
- **Backspace**: 버퍼의 로마자가 아니라 **유니코드 그래핀** 단위로 지울지, IME 내부 버퍼만 지울지 정책을 맞춘다.

---

## 5. 에디터 구현 체크(태국어 특유)

- [ ] **그래핀** 단위로 커서를 옮겨도 한 음절 중간에 서지 않는가.
- [ ] **단어 선택**이 공백 기준이면 태국어에서 잘못된 범위가 되지 않는가. 필요 시 `Intl.Segmenter` word 사용.
- [ ] **compositionupdate**가 자주 올 때 성능·렌더링 배치 전략(프레임당 한 번 갱신 등)이 있는가.

---

## 6. 참고

- [태국어 조합 원리](/docs/thai/combination) — 자음·모음·성조, 그래핀, 단어 경계
- [태국어 입력기](/docs/thai/input-methods) — OS별
- [인도계 문자 입력기 구현](/docs/indic/implementation) — 복잡 문자계 공통(그래핀·정규화)
- [에디터 IME 구현 가이드](/docs/editor/implementation-notes)
