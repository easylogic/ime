---
title: 티베트·미얀마·몽골 문자 (복잡 문자계)
description: 유니코드 블록, 쌓임·연자·세로쓰기, IME·그래핀, 에디터에서의 처리
---

[기타 문자계 개요](/docs/reference/other-scripts-overview)에서 다루는 티베트·에티오피아 요약을 보완한다. 여기서는 **티베트어**, **미얀마어**, **몽골어(전통 몽골 문자)** 를 IME·에디터 관점에서 나란히 정리한다. 조합 규칙의 전부는 유니코드·폰트 명세에 있으며, 여기서는 **입력·편집에 필요한 단위**(코드 포인트·그래핀·세로 배치)만 다룬다.

---

## 공통 원칙

- **한 음절·한 음소**가 **여러 코드 포인트**로 저장될 수 있다. **커서·Backspace·선택**은 [텍스트 세그멘테이션](/docs/reference/text-segmentation)의 **그래핀 클러스터**(UAX #29)에 맞춘다. `Intl.Segmenter`에 적절한 **locale**을 주되, 티베트·미얀마는 `'bo'`, `'my'` 등이 지원되는 환경에서 검증이 필요하다.
- **IME**는 **preedit**·**commit**을 **composition** 또는 **insertText**로 전달한다. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)에 따라 둘 다 처리한다.
- **글리프 모양**(쌓임·연자)은 IME보다 **폰트·렌더러**가 담당하는 경우가 많다. IME는 **유니코드 시퀀스**를 맞추면 된다.

---

## 1. 티베트 문자 (Tibetan)

### 1.1 유니코드

- **블록**: Tibetan **U+0F00–U+0FFF** (코드 차트: [U+0F00](https://www.unicode.org/charts/PDF/U0F00.pdf)).
- **구조**: **기준 자음**에 **위·아래·앞에 붙는 모음 부호**, **종성**(U+0F0B tshek 등 구분 부호 포함)이 **쌓인 형태**로 표시된다. 저장은 **자음 + 결합 모음 + …** 의 **평면 시퀀스**다.

### 1.2 입력·IME

- Windows·macOS·Linux(IBus 등)에 **티베트 키보드**가 있다. 키 순서는 레이아웃마다 다르고, **조합 중** 문자열이 **compositionupdate**로 올 수 있다.
- **자체 IME**를 만들 때는 레이아웃 표에 따라 **코드 포인트 시퀀스**를 출력하면 된다. 음절이 완성될 때까지 preedit, 완성 시 commit.

### 1.3 에디터

- **그래핀** 단위 이동·삭제. 티베트 locale이 없는 환경에서는 **UAX #29** 구현(브라우저·라이브러리)에 의존한다.
- [인도계 문자 조합 원리](/docs/indic/combination)의 “여러 코드 포인트가 한 사용자 문자” 모델과 같다.

---

## 2. 미얀마 문자 (Myanmar / Burmese)

### 2.1 유니코드

- **블록**: Myanmar **U+1000–U+109F**, 확장 **Myanmar Extended-A/B** 등 ([U+1000](https://www.unicode.org/charts/PDF/U1000.pdf)).
- **구조**: **자음 + 모음 기호**(좌·우·상·하) + **Virama**(U+1039 등)로 **연자**가 만들어진다. **kinzi** 등은 특정 시퀀스로 인코딩된다. 같은 음절이 **한 코드 포인트**와 **분해 시퀀스**로 둘 다 올 수 있는 글리프가 있어 **정규화**(NFC/NFD) 정책을 정하는 것이 좋다.

### 2.2 입력·IME

- **미얀마어 키보드**(표준 순차 입력 등)는 OS에 포함되거나 IBus·Fcitx 확장으로 제공된다.
- **로마자 → 미얀마** 변환 IME도 존재한다. preedit이 길게 갱신될 수 있다.

### 2.3 에디터

- **그래핀**·**정규화**·**단어 경계**(공백이 없는 문장이 많음): [태국어 조합 원리 §2](/docs/thai/combination)의 단어 경계 논의와 유사하게, **word** 세그멘테이션은 `Intl.Segmenter('my', { granularity: 'word' })` 등으로 시도하고, 미지원이면 별도 분절기를 쓴다.

---

## 3. 몽골어 — 전통 몽골 문자 (Mongolian script)

### 3.1 유니코드

- **블록**: Mongolian **U+1800–U+18AF** (전통 몽골 문자), **Mongolian Supplement** 등. **키릴 문자 몽골어**(몽골어를 키릴로 쓰는 경우)는 **Cyrillic 블록**이며, 여기서 말하는 “몽골 문자”는 **세로쓰기 전통 문자**에 해당한다.
- **방향**: 줄은 **세로**(열은 위→아래), 열은 **왼쪽→오른쪽**으로 진행하는 모델이 일반적이다. 유니코드에는 **Mongolian Vowel Separator**(U+180E) 등 제어 문자가 있다.

### 3.2 입력·IME

- Windows **몽골어(전통)** 키보드, macOS 입력 소스 등이 있다. IME는 **가로 방향 논리 순서**로 코드 포인트를 보내고, **렌더러가 세로·연결 형태**를 맞춘다.
- 웹 에디터는 **가로 편집**만 지원하고 **세로 표시**는 CSS `writing-mode: vertical-lr` 등과 폰트에 맡기는 경우가 많다. **편집기에서 커서 위치**를 세로 줄에 맞추려면 **레이아웃 엔진**과 좌표 변환이 필요하다.

### 3.3 에디터

- **그래핀** 단위는 티베트·미얀마와 동일하게 적용한다. locale `'mn-Mong'` 등이 **Segmenter**에 없을 수 있어 **실제 브라우저에서 그래핀 경계**를 검증한다.
- **세로 텍스트**에서 IME **후보 창** 위치는 [EditContext](/docs/reference/ime-implementation-details)의 character bounds와 같이 **문자 경계 좌표**가 필요할 수 있다.

---

## 4. 캄보디아 문자(크메르)에 대한 참고

- **Khmer** 블록 **U+1780–U+17FF**는 미얀마와 유사하게 **쌓임·연자**가 있다. 처리 원칙은 **§2 미얀마**와 같다. 전용 페이지는 두지 않고 [기타 문자계 개요](/docs/reference/other-scripts-overview)와 본 문서의 공통 원칙으로 충분히 대응할 수 있다.

---

## 5. 참고

- [기타 문자계 개요](/docs/reference/other-scripts-overview) — 에티오피아 등 다른 문자계
- [인도계 문자 조합 원리](/docs/indic/combination), [인도계 문자 입력기 구현](/docs/indic/implementation) — 연자·Virama·정규화
- [태국어 조합 원리](/docs/thai/combination) — 그래핀·단어 경계
- Unicode: *The Unicode Standard* 각 스크립트 장, UAX #29
