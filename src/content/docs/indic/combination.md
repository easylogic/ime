---
title: 인도계 문자 조합 원리
description: 데바나가리 등 자음+matra+연자(conjunct), 조합형/완성형·정규화, Intl.Segmenter(locale)
---

인도계 문자(데바나가리, 벵골, 타밀, 텔루구 등)는 **자음 + 모음 기호(matra)** 및 **연자(conjunct)**—두 자음이 합쳐진 형태—로 한 음절을 이룬다. 같은 음절이 **한 코드 포인트**(precomposed) 또는 **자음 + 결합 matra + Virama + 자음** 등 **분해형(decomposed)**으로 저장될 수 있어, **정규화**(NFC/NFD 등)와 **그래핀 클러스터** 단위 처리가 필요하다.

---

## 1. 문자 구성

### 1.1 자음·Matra·연자(Conjunct)

- **자음**: 데바나가리(힌디 등) U+0915~U+0939, 벵골·타밀·텔루구 등 각 블록에 자음이 정의됨.
- **Matra(मात्रा)**: 모음 기호. 자음 **위·아래·좌우**에 **결합 문자**로 붙는다. 같은 음절이 **자음(U+0915) + matra(U+093E)** 두 코드 포인트로 저장될 수 있다.
- **연자(Conjunct)**: **Virama**(U+094D 등)로 두 자음이 묶여 **한 글자처럼** 그려진다. 예: क + ् + ष → क्ष. 저장은 **자음 + Virama + 자음** 시퀀스 또는 **한 코드 포인트**(precomposed)로 될 수 있다.

### 1.2 조합형 vs 완성형·정규화

- **Precomposed**: 한 음절이 **한 코드 포인트**로. 유니코드에서 인도계 문자는 대량의 precomposed 음절이 할당되어 있다.
- **Decomposed**: **자음 + 결합 모음(matra) + Virama + 자음** 등 **여러 코드 포인트** 시퀀스.
- **NFC**(Normalization Form Composed): 가능하면 한 코드 포인트로. **NFD**(Decomposed): 기준 문자 + 결합 문자 시퀀스.
- 문자열 비교·검색 시 **동일한 정규화 형태**로 맞춰 두는 것이 좋다. (한글·유럽권의 NFC/NFD와 같은 개념.)

---

## 2. 그래핀 클러스터·커서·삭제

- **한 음절**이 사용자 눈에는 "한 글자"지만, 내부적으로는 **자음 + matra + conjunct** 등 **여러 코드 포인트**일 수 있다.
- **그래핀 클러스터**(UAX #29)가 "사용자 인식 문자" 단위다. 커서 이동·한 글자 삭제·선택 시 **그래핀 클러스터** 경계를 사용해야 한다.
- **Intl.Segmenter** (`granularity: 'grapheme'`, locale: `'hi'`, `'bn'`, `'ta'`, `'te'` 등)로 그래핀 경계를 얻을 수 있다. locale에 따라 인도계 문자의 음절·연자 경계가 올바르게 나뉜다.

---

## 3. IME·composition

- **로마자 → 인도 문자** 변환(IME) 또는 **인도어 키보드**에서 자음·모음 순서로 입력. IME가 조합을 수행하고 **preedit**·**commit**을 앱에 전달한다.
- **compositionstart** → **compositionupdate** → **compositionend**가 발생할 수 있고, 환경에 따라 **insertText**만 올 수도 있다. 에디터는 [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)에 따라 둘 다 처리하면 된다.

---

## 4. 참고

- [유니코드 기본](/docs/reference/unicode-basics) — 코드 포인트, 정규화.
- [macOS 한글 자소 분리](/docs/reference/mac-hangul-decomposition) — NFC/NFD, 정규화 적용 지점.
- Unicode Standard: Indic scripts, Virama, Indic Syllabic Category. UAX #29 (Text Segmentation).
