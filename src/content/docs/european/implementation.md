---
title: 유럽권 입력기 구현
description: 데드 키·Compose 시퀀스, NFC/NFD 정규화, 구현 흐름
---

유럽권 IME를 구현하려면 **데드 키(dead key)** 또는 **Compose 키 시퀀스**로 악센트 문자를 만들고, **preedit/commit**을 구분해야 한다. 웹에서는 OS IME를 쓰는 것이 보통이다.

## 구현할 것 요약

1. **데드 키**: "부호 키만 누름" → 다음 키 대기. 다음 키가 오면 "부호 + 문자" → 한 문자(예: U+00E9 é) 생성. Space만 오면 부호만 출력(´ 등).
2. **Compose 시퀀스**: Compose 키 + 두 키(예: ~ + n) → 한 문자(ñ U+00F1). 시퀀스 테이블(XCompose 형식 등) 참고.
3. **조합 중(preedit)**: 데드 키만 눌렀을 때 ´ 등을 preedit으로 표시. 다음 키 입력 시 완성 문자로 commit.
4. **commit**: 완성 문자를 문서에 반영. compositionend의 data 또는 insertText의 data.
5. **취소**: Esc·포커스 잃음. preedit 제거.

## 데드 키 매핑

- **acute (´)**: 데드 acute + e → é (U+00E9). 데드 acute + Space → ´ (U+00B4).
- **grave, circumflex, umlaut, tilde** 등도 동일. 데드 키 코드 → (다음 키 → 결과 문자) 테이블을 두면 된다.
- **미리 조합형(Precomposed)**: 결과는 한 코드 포인트(예: U+00E9). **분해형(Decomposed)** 로 내보낼 수도 있다(e + U+0301). 에디터는 둘 다 받을 수 있도록 하고, 필요 시 NFC/NFD 정규화를 적용하면 된다.

## NFC vs NFD

- **NFC(Normalization Form Composed)**: 가능하면 한 코드 포인트(é = U+00E9).
- **NFD(Normalization Form Decomposed)**: 기준 문자 + 결합 부호(e + U+0301).
- 문자열 비교·검색 시 **한 가지 정규화**로 통일해 두는 것이 좋다.

## 상태와 commit

- **조합 중**: 데드 키만 눌린 상태. preedit에 부호(´ 등) 또는 빈 문자열 표시. 다음 키 입력 시 완성 문자로 commit.
- **commit**: 완성 문자(또는 분해형 시퀀스)를 문서에 반영. compositionend 또는 insertText.
- **취소**: Esc. preedit 제거, commit 없음.

## 라이브러리·참고

- **X11 XCompose**: ~/.XCompose 형식의 Compose 시퀀스 테이블. 많은 시퀀스 정의가 공개되어 있다.
- **유니코드 정규화**: UAX #15 (Unicode Normalization Forms). NFC/NFD 변환.
- 웹에서는 OS IME 결과(composition 이벤트 또는 insertText)만 처리하면 되므로, 자체 유럽권 IME 구현은 특수 환경(임베디드 등)에서만 필요하다.
