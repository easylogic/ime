---
title: 비밀번호 필드와 IME
description: 비밀번호 입력 시 IME 비활성화 이유, HTML·모바일 동작, 에디터 대응
---

비밀번호를 입력하는 필드에서는 **OS·앱**이 **IME를 비활성화하거나 제한**하는 경우가 많다. 그 이유와 **HTML**·**모바일**에서의 동작, **에디터**에서 비밀번호 모드를 쓸 때의 주의점을 정리한다.

---

## 1. 비밀번호 필드에서 IME를 끄는 이유

- **IME**는 **키 입력**을 **조합**해 **문자**로 바꾼다. 그 과정에서 **조합 중 문자열(preedit)** 이 메모리·입력 버퍼에 잠시 존재한다.
- **키로깅**·**중간 조합 문자열 노출** 등 보안 이슈를 줄이기 위해, 많은 **OS**가 **비밀번호 필드**에 포커스가 있을 때 **IME를 비활성화**하거나 **일반 텍스트만** 받도록 제한한다.
- **실제 동작**은 OS·브라우저마다 다르다. "비밀번호 필드에서는 IME를 끄는 것이 권장된다"는 정책이 있고, 그에 따라 **키보드가 영문만** 뜨거나 **조합이 비활성화**되는 환경이 있다.

---

## 2. HTML에서의 동작

- **`input type="password"`**: 브라우저는 이 필드를 **비밀번호 필드**로 인식한다. **포커스 시** OS에 "비밀번호 모드"를 알릴 수 있고, OS가 **IME를 끄거나** **키보드 레이아웃을 제한**할 수 있다. 동작은 **브라우저·OS**에 따라 다르다.
- **`autocomplete="current-password"`** / **`new-password`**: 자동 완성과 함께 **비밀번호 필드**로 취급될 수 있어, IME 동작에 영향을 줄 수 있다.
- **`inputmode`**: `inputmode="text"` 등으로 **키보드 타입**을 힌트할 수 있으나, **비밀번호 필드**에서는 OS가 **inputmode를 무시**하고 영문/숫자만 허용하는 경우가 있다.

---

## 3. 모바일에서의 동작

- **iOS**: 비밀번호 필드에 포커스하면 **기본적으로 영문 키보드**가 뜨고, **한글·일본어 등 IME**로 전환되지 않거나 제한될 수 있다. 버전·설정에 따라 다름.
- **Android**: 비밀번호 필드에서 **키보드**가 **숫자·영문**만 보이도록 하고, **IME 조합**을 막는 경우가 있다.
- **결과**: 비밀번호 필드에서는 **composition 이벤트**가 **발생하지 않거나** **insertText**만 오는 환경이 많다. 에디터가 **비밀번호 모드**일 때는 **composition 처리**를 해도 되지만, **실제로 조합이 오지 않을 수 있다**는 점만 알아 두면 된다.

---

## 4. 에디터에서 비밀번호 모드

- **contenteditable** 또는 **input**을 **비밀번호 입력**에 쓰는 경우(마스킹 처리 등), **보안 정책**에 따라 **IME를 노출하지 않도록** 할 수 있다.
- **방법**: **`inputmode="text"`** 를 바꾸지 않고, **필드 타입**을 **password**로 두거나, **`attr autocomplete`** 로 **current-password** 등을 주면, OS·브라우저가 비밀번호 필드로 인식해 IME를 제한할 수 있다.
- **커스텀 에디터**에서 **비밀번호 마스킹**만 하고 **IME는 그대로** 두는 경우, **composition 이벤트**와 **insertText**를 **동일하게** 처리하면 된다. 다만 **실제 서비스**에서는 **비밀번호 필드는 input type="password"** 를 쓰는 것이 일반적이고, 그 경우 IME 동작은 **OS·브라우저**가 결정한다.

---

## 5. 참고

- [IME 구현 상세](/docs/reference/ime-implementation-details) — 플랫폼별 IME 연동.
- [브라우저·플랫폼별 IME 동작 차이](/docs/reference/browser-platform-quirks) — 환경별 동작.
- HTML 명세: [input type=password](https://html.spec.whatwg.org/multipage/input.html#attr-input-type-password), [autocomplete](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute).
