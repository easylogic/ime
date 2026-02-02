---
title: 브라우저·플랫폼별 IME 동작 차이
description: 검증된 테스트 결과 기반의 브라우저/플랫폼/IME 조합별 정확한 동작
---

이 문서는 **검증된 사실**만 기록한다. "~할 수 있다"가 아니라 "~한다" 또는 "~하지 않는다"로 기술한다.

---

## 1. iOS Safari

### 1.1 딕테이션(음성 입력): composition 이벤트 미발생

| 항목 | 값 |
|------|-----|
| **버그 ID** | [WebKit Bug 261764](https://bugs.webkit.org/show_bug.cgi?id=261764) |
| **상태** | **OPEN** (2026-02 기준 미해결) |
| **보고일** | 2023-09-19 |
| **영향 버전** | iOS 15.7.2, 16.6.1, 17.0 이상 (현재까지 모든 버전) |
| **Apple Radar** | rdar://problem/115811978 |

**동작:**
- 딕테이션 버튼(마이크)으로 음성 입력 시 `compositionstart`, `compositionupdate`, `compositionend` 이벤트가 **발생하지 않는다**.
- `beforeinput`과 `input` 이벤트만 발생한다.
- `inputType`은 `insertText`다.

**macOS Safari와의 차이:**
- macOS Safari에서는 딕테이션 시 composition 이벤트가 **정상 발생한다**.
- 이 문제는 **iOS/iPadOS 전용 버그**다.

**처리 방법:**
```javascript
// iOS Safari 딕테이션은 composition 없이 input만 온다
el.addEventListener('input', (e) => {
  if (e.inputType === 'insertText' && !isComposing) {
    // 커서 위치에 e.data 삽입
    insertText(e.data);
  }
});
```

### 1.2 한글 입력: composition 이벤트 발생 여부가 불규칙

| 항목 | 값 |
|------|-----|
| **증상** | 한글 입력 시 `compositionstart`가 발생하지 않고 `insertText`만 오는 경우가 있음 |
| **재현 조건** | iOS Safari + 기본 한글 키보드, 일부 서드파티 키보드 |
| **원인** | WebKit이 iOS 키보드 이벤트를 composition으로 처리하지 않는 경우가 있음 |

**동작 패턴 (테스트 결과):**

```
[패턴 A: composition 발생]
사용자: ㄱ → ㅏ → 스페이스
이벤트: compositionstart → compositionupdate("ㄱ") → compositionupdate("가") → compositionend("가")

[패턴 B: composition 미발생]
사용자: ㄱ → ㅏ → 스페이스
이벤트: input(insertText, "가")
```

**패턴 B가 발생하는 경우:**
- 빠르게 입력할 때
- 일부 서드파티 키보드 사용 시
- iOS 버전/키보드 설정에 따라 다름

**처리 방법:**
```javascript
let isComposing = false;

el.addEventListener('compositionstart', () => { isComposing = true; });
el.addEventListener('compositionend', (e) => {
  isComposing = false;
  commit(e.data);
});
el.addEventListener('input', (e) => {
  // composition 없이 insertText가 오면 바로 commit
  if (!isComposing && e.inputType === 'insertText') {
    commit(e.data);
  }
});
```

### 1.3 beforeinput의 inputType

| inputType | iOS Safari 발생 여부 |
|-----------|---------------------|
| `insertText` | **발생** |
| `insertCompositionText` | **발생하지 않음** |
| `deleteContentBackward` | **발생** |
| `deleteWordBackward` | **발생** (단어 삭제 제스처 시) |
| `insertReplacementText` | **발생** (자동 수정 시) |

**핵심 사실:**
- iOS Safari는 `insertCompositionText` inputType을 **사용하지 않는다**.
- Input Events Level 2 명세에는 조합 중 삽입 시 `insertCompositionText`를 사용하도록 정의되어 있으나, WebKit/iOS Safari는 이를 구현하지 않았다.
- `beforeinput`의 `inputType`으로 "조합 중"을 판단하면 **안 된다**.

---

## 2. macOS Safari

### 2.1 keydown/keyup과 composition 이벤트 순서

| 항목 | 값 |
|------|-----|
| **버그 ID** | [WebKit Bug 165004](https://bugs.webkit.org/show_bug.cgi?id=165004) |
| **상태** | **OPEN** (2026-02 기준) |
| **보고일** | 2016 |
| **원인** | WebKit이 IE 동작에 맞추려고 의도적으로 구현한 것 (현재는 불필요) |

**Safari 실제 순서:**
```
1. compositionstart
2. compositionupdate
3. input
4. keydown
5. keyup
```

**W3C 명세 순서:**
```
1. keydown
2. compositionstart
3. compositionupdate
4. input
5. keyup
```

**영향:**
- `keydown` 시점에 `isComposing`이 이미 true여야 하는데, Safari에서는 composition이 먼저 끝나고 keydown이 온다.
- Enter로 조합을 확정할 때 `keydown.isComposing`이 `false`로 올 수 있다.

**처리 방법:**
```javascript
el.addEventListener('keydown', (e) => {
  // Safari 보완: keyCode 229면 IME가 처리 중
  if (e.isComposing || e.keyCode === 229) {
    return; // 단축키 처리하지 않음
  }
  // 단축키 처리
});
```

### 2.2 blur 시 compositionend 미발생

| 항목 | 값 |
|------|-----|
| **버그 ID** | [WebKit Bug 164369](https://bugs.webkit.org/show_bug.cgi?id=164369) |
| **증상** | 일본어/데드키 조합 중 요소가 blur되면 `compositionend`가 발생하지 않음 |
| **Chrome/Firefox** | blur 시 `compositionend` 발생 |

**처리 방법:**
```javascript
let isComposing = false;
let preeditText = '';

el.addEventListener('compositionstart', () => { isComposing = true; });
el.addEventListener('compositionupdate', (e) => { preeditText = e.data; });
el.addEventListener('compositionend', (e) => {
  isComposing = false;
  preeditText = '';
  commit(e.data);
});

el.addEventListener('blur', () => {
  if (isComposing) {
    // Safari: compositionend가 안 오므로 강제로 정리
    isComposing = false;
    // 정책에 따라: preeditText를 commit하거나 버림
    preeditText = '';
  }
});
```

---

## 3. Firefox

### 3.1 Enter 시 compositionend 조기 발생

| 항목 | 값 |
|------|-----|
| **버그 ID** | [Mozilla Bug 1675313](https://bugzilla.mozilla.org/show_bug.cgi?id=1675313) |
| **영향 버전** | Firefox 84+ (Windows) |
| **증상** | CJK IME 조합 중 Enter 누르면 `compositionend`가 keyup에서 조기 발생 |

**문제 시나리오:**
```
사용자: 일본어 "あ" 입력 중 Enter
기대: compositionend("あ") → 줄바꿈 또는 폼 제출
실제: compositionend(미확정 문자열) → 폼에 "あ" 대신 "a"가 제출됨
```

**처리 방법:**
```javascript
el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.isComposing) {
    // Enter를 IME에 넘기고 직접 처리하지 않음
    return;
  }
  if (e.key === 'Enter') {
    submitForm();
  }
});
```

---

## 4. Android Chrome

### 4.1 keydown의 keyCode가 항상 229

| 항목 | 값 |
|------|-----|
| **동작** | 소프트 키보드로 입력 시 거의 모든 `keydown`의 `keyCode`가 229 |
| **원인** | Android IME가 모든 키를 가로채서 처리하므로 브라우저에 실제 키 코드가 전달되지 않음 |

**실제 로그:**
```javascript
// Android Chrome에서 "가" 입력 시
keydown: key="Process", keyCode=229
compositionstart: data=""
compositionupdate: data="ㄱ"
compositionupdate: data="가"
keydown: key="Process", keyCode=229  // 다음 글자 입력
compositionend: data="가"
```

**처리 방법:**
- `keydown`의 `keyCode`에 의존하지 않는다.
- 텍스트 내용은 `compositionupdate.data`, `compositionend.data`, `input.data`에서만 얻는다.

---

## 5. Windows/Chrome

### 5.1 compositionupdate 호출 횟수

| IME | "가" 입력 시 compositionupdate 횟수 |
|-----|-------------------------------------|
| Microsoft 한글 | 2회: `"ㄱ"`, `"가"` |
| Google 한글 입력기 | 2회: `"ㄱ"`, `"가"` |

이벤트 순서:
```
compositionstart (data: "")
compositionupdate (data: "ㄱ")
compositionupdate (data: "가")
input (inputType: insertCompositionText, data: "가")
compositionend (data: "가")
input (inputType: insertText, data: "가")  // 일부 버전
```

---

## 6. 요약: 환경별 핵심 차이

| 환경 | composition 이벤트 | beforeinput inputType | keyCode | 주의점 |
|------|-------------------|----------------------|---------|--------|
| **iOS Safari 딕테이션** | 발생 안 함 | insertText | 229 | input만으로 처리 |
| **iOS Safari 한글** | 불규칙 | insertText (insertCompositionText 없음) | 229 | composition 없이 올 수 있음 |
| **macOS Safari** | 발생 | insertCompositionText | 229 | 이벤트 순서 역전, blur 시 compositionend 없음 |
| **Firefox (Windows)** | 발생 | insertCompositionText | 실제 키 | Enter 시 조기 compositionend |
| **Android Chrome** | 발생 | insertCompositionText | 항상 229 | keyCode 의존 금지 |
| **Chrome/Edge (Windows)** | 발생 | insertCompositionText | 229 | 정상 동작 |

---

## 7. 버전별 변경 이력

| 날짜 | 브라우저 | 변경 내용 |
|------|----------|-----------|
| 2016 | Safari | Bug 165004 보고 (이벤트 순서) - 2026-02 현재 미해결 |
| 2023-09 | iOS Safari | Bug 261764 보고 (딕테이션) - 2026-02 현재 미해결 |
| Firefox 84 | Firefox | Bug 1675313 (Enter compositionend) |

---

## 8. 참고 링크

- [WebKit Bug 261764 - iOS dictation composition](https://bugs.webkit.org/show_bug.cgi?id=261764)
- [WebKit Bug 165004 - keydown/composition order](https://bugs.webkit.org/show_bug.cgi?id=165004)
- [WebKit Bug 164369 - blur compositionend](https://bugs.webkit.org/show_bug.cgi?id=164369)
- [Mozilla Bug 1675313 - Enter compositionend](https://bugzilla.mozilla.org/show_bug.cgi?id=1675313)
- [MDN: beforeinput event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event)
- [W3C Input Events Level 2](https://www.w3.org/TR/input-events-2/)
