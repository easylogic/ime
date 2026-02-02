---
title: 유럽권 조합 원리
description: 데드 키·악센트·Compose, NFC/NFD, composition
---

유럽 언어에서는 **악센트·움라우트·세디유** 등이 붙은 문자(é, ñ, ü, å 등)를 **데드 키(dead key)** 또는 **Compose 키**로 입력한다. IME/OS에 따라 **composition 이벤트**가 발생할 수도, **insertText**만 올 수도 있다.

---

## 1. 데드 키(Dead Key)

### 1.1 동작

- **데드 키**는 "그 키만 누르면 **문자를 찍지 않고**", **다음에 누른 키**와 합쳐서 **한 문자**를 만든다.
- 예: **acute accent(´) 데드 키** + **e** → **é** (U+00E9).
- 데드 키 + **Space** → 보통 **그 부호만** 출력(´ 등).

### 1.2 기원

- 기계식 타자기에서 "악센트 키만 누르면 종이를 넘기지 않아", 그다음 글자를 같은 자리에 찍어 **é**처럼 보이게 한 것에서 유래했다.
- 전자에서는 "데드 키 누름 → 다음 키 누름" 시 **미리 조합된 문자(precomposed)** 를 생성한다. 예: U+00E9 (LATIN SMALL LETTER E WITH ACUTE).

---

## 2. Compose 키

- **Compose** 키를 누른 뒤 **두 키 시퀀스**로 한 문자를 만든다. 예: Compose + **~** + **n** → **ñ** (U+00F1).
- **순서**는 구현에 따라 "부호 + 문자" 또는 "문자 + 부호" 등이 있다. X11에서는 **~/.XCompose** 등으로 사용자 정의 가능.

---

## 3. 유니코드: NFC vs NFD

- **미리 조합된 문자(Precomposed)**: é = U+00E9 한 코드 포인트.
- **분해형(Decomposed)**: e (U+0065) + combining acute (U+0301) 두 코드 포인트.
- **NFC(Normalization Form Composed)**: 가능하면 **한 코드 포인트**(U+00E9)로.
- **NFD(Normalization Form Decomposed)**: **기준 문자 + 결합 부호** 시퀀스(U+0065 U+0301)로.

문자열 비교·검색 시 **NFC** 또는 **NFD** 중 하나로 **정규화**해 두는 것이 좋다.

---

## 4. composition 이벤트 유무

- **데드 키 + 문자** 입력 시:
  - **compositionstart** → **compositionupdate**(´ 또는 빈 문자열) → **compositionend**(é) 가 **발생하는** 환경이 있다.
  - **발생하지 않고** **beforeinput**/ **input** 만 오고, **inputType**이 **insertText**, **data**가 "é"인 환경도 있다.
- 에디터는 **composition 이벤트가 오면** 조합 구간으로 처리하고, **오지 않으면** 일반 **insertText**로 처리하면 된다.

---

## 5. IME별 차이

- **Windows**: 언어별 키보드(프랑스어, 스페인어 등)에서 데드 키가 OS IME에 포함된다. 브라우저는 OS 결과를 받아 composition 또는 insertText로 페이지에 전달한다.
- **macOS**: 옵션 키 + 문자 등으로 악센트 문자를 넣는다. composition이 발생할 수 있다.
- **Linux**: X11 Compose, IBus 등으로 데드 키·Compose 시퀀스를 처리한다.

---

## 6. 한글·일본어와의 차이

- **한글/일본어/중국어**: 조합 **세션**이 길고(여러 키), **compositionupdate**가 여러 번 발생한다.
- **유럽권 데드 키**: 보통 **데드 키 1회 + 문자 1회**로 끝나서, composition이 **한두 번**만 나오거나 **아예 안 나올** 수 있다.

에디터는 **compositionstart ~ compositionend** 구간을 preedit으로 표시하고, **compositionend**의 data를 commit으로 반영하는 동작을 유지하면, 유럽권 입력도 함께 처리된다.
