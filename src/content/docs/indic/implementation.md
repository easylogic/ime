---
title: 인도계 문자 입력기 구현
description: 로마자 변환·자음·matra·Virama·연자, 정규화, 그래핀, preedit·commit
---

인도계 문자(데바나가리·벵골·타밀 등) 입력기는 **로마자 → 스크립트** 변환 또는 **스크립트 키보드**에서 **자음 + matra + Virama + 자음** 시퀀스를 조합한다. [인도계 문자 조합 원리](/docs/indic/combination)의 연자·정규화·그래핀 규칙을 엔진과 에디터가 공유한다.

---

## 1. 구현할 것 요약

1. **변환 테이블(로마자 IME)**: 로마자 시퀀스(예: `ka`, `kha`) → **자음 코드 포인트 + matra** 등. 스크립트별(힌디·타밀)로 테이블이 다르다.
2. **키보드 IME**: 물리 키 → 자음·matra·Virama 순서. **Halant/Virama**(U+094D 등) 뒤 자음이 오면 **연자(conjunct)** 규칙을 적용한다.
3. **조합 중(preedit)**: 변환 중 로마자 버퍼 또는 미완성 음절을 preedit으로 표시. **compositionupdate**에 반영된다.
4. **commit**: 음절·단어 단위로 확정되면 **compositionend** 또는 **insertText**.
5. **정규화**: 저장 시 **NFC 또는 NFD** 중 하나로 통일. 검색·비교 시 동일 형태로 맞춘다.
6. **그래핀**: 커서·삭제·선택은 **그래핀 클러스터** 경계. `Intl.Segmenter`에 locale `'hi'`, `'bn'`, `'ta'`, `'te'` 등을 지정한다.

---

## 2. 연자·Virama·렌더링

- **IME 역할**: 유니코드 코드 포인트 시퀀스를 보낸다. **연자 글리프**가 어떤 모양으로 그려질지는 **폰트·렌더러**(OpenType GSUB/GPOS 등)가 담당하는 경우가 많다.
- IME는 **Virama + 자음** 조합 규칙을 문자열 수준에서 맞추면 된다. 표시 형태까지 IME에서 구현할 필요는 없다.

---

## 3. 웹·플랫폼에서의 이벤트

- **Windows TSF / macOS / Linux**: [인도계 문자 입력기](/docs/indic/input-methods)와 동일하게 preedit·commit 전달.
- **Google Input Tools** 등은 변환 엔진이 길게 preedit을 갱신할 수 있다. **compositionupdate** 횟수는 구현에 따라 다르다.
- **insertText만** 오는 경로는 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)을 따른다.

---

## 4. 에디터 구현 체크(인도계 특유)

- [ ] **locale별** `Intl.Segmenter` grapheme이 기대한 경계를 내는지(브라우저·엔진 버전별로 확인).
- [ ] **NFC/NFD 혼입** 시 같은 음절이 두 번 검색되지 않도록 인덱스 정규화.
- [ ] **로마자 변환 IME**에서 긴 preedit이 **한 번에 commit**될 때도 오프셋이 맞는가.

---

## 5. 참고

- [인도계 문자 조합 원리](/docs/indic/combination) — matra, Virama, 연자, NFC/NFD
- [인도계 문자 입력기](/docs/indic/input-methods) — OS별
- [텍스트 세그멘테이션](/docs/reference/text-segmentation) — UAX #29, Intl.Segmenter
- [에디터 IME 구현 가이드](/docs/editor/implementation-notes)
