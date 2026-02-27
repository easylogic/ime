---
title: 히브리어 조합 원리
description: RTL·bidi, 어두/어중/어말형, 니쿠드(결합 문자), composition 패턴
---

히브리어는 **오른쪽에서 왼쪽(RTL)**으로 쓰이며, **어두·어중·어말형**(문자 위치에 따른 모양)과 **니쿠드(Niqqud)**—모음·강세를 나타내는 결합 문자—를 사용한다. 에디터는 **UAX #9(양방향 알고리즘)**과 **composition 이벤트** 처리로 RTL·결합 문자를 다룬다.

---

## 1. RTL·bidi

- **텍스트는 논리 순서**로 저장하고, **표시** 시 **오른쪽→왼쪽**으로 배치한다. 아랍어와 마찬가지로 **UAX #9(Unicode Bidirectional Algorithm)**으로 **bidi runs**를 나눠 그린다.
- **혼합 텍스트**(히브리어 + 숫자 + 영문)에서는 runs가 나뉘므로, 커서·선택은 **논리 오프셋**으로 다루고, 시각적 위치는 bidi 알고리즘 결과에 따른다. (상세는 [아랍어 조합 원리](/docs/arabic/combination)의 RTL·bidi 섹션 참고.)

---

## 2. 어두·어중·어말형

- 히브리어 자음은 **단독형·어두형·어중형·어말형**으로 **같은 코드 포인트**가 **위치**에 따라 **다른 모양**으로 그려진다. 폰트·렌더러가 주변 문자에 따라 형태를 선택한다.
- **유니코드**에는 대부분 **단일 코드 포인트**(예: U+05D0 Alef)로 되어 있고, **조합**은 폰트 측에서 처리한다. IME는 **기본 코드 포인트**만 보낸다.

---

## 3. 니쿠드(Niqqud, 결합 문자)

- **니쿠드**는 **모음·강세**를 나타내는 **결합 문자**(combining character)다. 자음 **아래·위**에 붙는다.
- **데드 키** 또는 **결합 문자**로 입력. **composition 이벤트**가 발생할 수도, **insertText**만 올 수도 있다. (유럽권·베트남어의 데드 키와 유사.)
- 에디터는 **composition이 오면** 조합 구간으로, **오지 않으면** `inputType === 'insertText'`로 처리하면 된다.

---

## 4. composition 패턴

- **히브리어 키보드**에서 로마자 전환·니쿠드 입력 시, OS/IME에 따라 **compositionstart** → **compositionupdate** → **compositionend**가 발생하거나, **insertText** 한 번만 올 수 있다.
- **문절 단위 commit**은 일본어·중국어보다 적지만, 후보 선택이 있으면 **compositionend.data**에 여러 글자가 올 수 있다. [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases)의 "compositionend.data가 긴 문자열인 경우"를 참고한다.

---

## 5. 참고

- [아랍어 조합 원리](/docs/arabic/combination) — RTL, Joining_Type, bidi.
- [유럽권 조합 원리](/docs/european/combination) — 데드 키, composition 유무.
- [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases).
