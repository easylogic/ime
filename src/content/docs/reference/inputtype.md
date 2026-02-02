---
title: beforeinput/input의 inputType
description: inputType의 종류, 환경별 차이, 차이가 발생하는 구조적 이유
---

`inputType`은 **브라우저가 편집 동작을 해석해 붙이는 이름**이다. OS IME가 보낸 실제 동작이 아니라 **브라우저가 판단한 결과**이므로, 같은 동작도 환경에 따라 다른 `inputType`이 올 수 있다.

---

## 1. inputType 목록

### 1.1 삽입 관련

| inputType | 의미 | 발생 조건 |
|-----------|------|-----------|
| `insertText` | 일반 텍스트 삽입 | 영문 입력, composition 없이 오는 입력 |
| `insertCompositionText` | 조합 중 텍스트 삽입 | IME 조합 중 (iOS Safari 제외) |
| `insertReplacementText` | 텍스트 교체 | 자동 수정, 추천 후보 선택 |
| `insertFromPaste` | 붙여넣기 | Ctrl+V, 컨텍스트 메뉴 붙여넣기 |
| `insertFromDrop` | 드롭 | 드래그 앤 드롭으로 텍스트 삽입 |
| `insertLineBreak` | 줄바꿈 삽입 | Shift+Enter |
| `insertParagraph` | 문단 삽입 | Enter |

### 1.2 삭제 관련

| inputType | 의미 | 발생 조건 |
|-----------|------|-----------|
| `deleteContentBackward` | 커서 앞 1자 삭제 | Backspace |
| `deleteContentForward` | 커서 뒤 1자 삭제 | Delete |
| `deleteWordBackward` | 커서 앞 단어 삭제 | Ctrl+Backspace (Windows), Option+Delete (macOS) |
| `deleteWordForward` | 커서 뒤 단어 삭제 | Ctrl+Delete (Windows), Option+Fn+Delete (macOS) |
| `deleteByCut` | 잘라내기 | Ctrl+X |
| `deleteByDrag` | 드래그로 삭제 | 드래그 앤 드롭 원본 삭제 |

### 1.3 기타

| inputType | 의미 |
|-----------|------|
| `historyUndo` | Undo |
| `historyRedo` | Redo |
| `formatBold` | 굵게 |
| `formatItalic` | 기울임 |

---

## 2. 환경별 inputType 차이

### 2.1 iOS Safari

| 상황 | 다른 환경 | iOS Safari |
|------|-----------|------------|
| 한글 조합 중 | `insertCompositionText` | `insertText` 또는 composition 이벤트 없이 `insertText` |
| 딕테이션 | `insertCompositionText` | `insertText` (composition 이벤트 없음) |
| 단어 삭제 | `deleteWordBackward` | `deleteWordBackward` 또는 `deleteBackwardWord` |

**핵심:** iOS Safari는 `insertCompositionText`를 사용하지 않는다.

### 2.2 데드 키 (é 등)

| 브라우저 | 동작 |
|----------|------|
| Chrome (Windows) | `compositionstart` → `compositionupdate` → `compositionend` |
| Chrome (macOS) | `insertText` 한 번 (composition 없음) |
| Safari | `insertText` 한 번 (composition 없음) |
| Firefox | 브라우저 버전에 따라 다름 |

**핵심:** 데드 키가 composition을 발생시키는지는 OS/브라우저 조합에 따라 다르다.

### 2.3 모바일 IME 자동 기능

| 기능 | inputType |
|------|-----------|
| 자동 수정 (autocorrect) | `insertReplacementText` 또는 `insertText` |
| 추천 후보 탭 | `insertReplacementText` 또는 `insertText` |
| 단어 삭제 제스처 | `deleteWordBackward`, `deleteBackwardWord`, 또는 여러 번의 `deleteContentBackward` |

**핵심:** 모바일 IME는 composition 이벤트 없이 inputType만으로 처리할 수 있다.

---

## 3. inputType이 다른 이유

### 3.1 플랫폼 API가 다르다

| 플랫폼 | IME API | 브라우저가 받는 정보 |
|--------|---------|---------------------|
| Windows | TSF (Text Services Framework) | 조합 범위 + commit 문자열 |
| macOS | NSTextInputClient | `setMarkedText` (preedit) + `insertText` (commit) |
| Linux | IBus/Fcitx | preedit/commit 문자열 |

같은 "한글 가 입력"이라도:
- Windows: TSF가 조합 범위를 관리 → 브라우저가 `insertCompositionText`로 매핑
- macOS: `setMarkedText("가")` → 브라우저가 `insertCompositionText` 또는 `insertText`로 매핑
- iOS: 키보드가 직접 문자열 전송 → 브라우저가 `insertText`로 매핑

### 3.2 브라우저 구현이 다르다

같은 macOS에서도 Chrome, Firefox, Safari가 **OS 이벤트를 DOM 이벤트로 변환하는 로직**이 다르다.

| 브라우저 | 특징 |
|----------|------|
| Chrome | 명세를 비교적 충실히 따름 |
| Firefox | 조기 `compositionend` 버그 (Enter 시) |
| Safari | 이벤트 순서 역전, `insertCompositionText` 사용 불규칙 |

### 3.3 IME/키보드 앱이 다르다

같은 iOS Safari라도:
- 기본 한글 키보드 → 간헐적으로 composition 발생
- 서드파티 키보드 (예: Gboard) → 다른 패턴

같은 Android Chrome이라도:
- Gboard → 특정 패턴
- Samsung 키보드 → 다른 패턴

### 3.4 Input Events Level 2 명세의 한계

**명세가 강제하지 않는 부분:**
- `beforeinput`이 **발생하지 않을 수 있음** (MDN: IME, 자동 완성, 비밀번호 관리자 등)
- `beforeinput`이 **non-cancelable**일 수 있음
- "단어 삭제"의 **단어 경계** 정의가 언어마다 다름

**결과:** 브라우저가 재량으로 구현하는 부분이 많아 동작이 다르다.

---

## 4. 처리 규칙

### 4.1 기본 원칙

```javascript
// 1. composition 이벤트가 오면 최우선 처리
// 2. composition 없으면 inputType 기반 처리
// 3. beforeinput 없으면 input으로 동일 처리

let isComposing = false;

el.addEventListener('compositionstart', () => { isComposing = true; });
el.addEventListener('compositionend', (e) => {
  isComposing = false;
  if (e.data) commit(e.data);
});

el.addEventListener('beforeinput', (e) => {
  if (isComposing) return; // composition이 처리

  switch (e.inputType) {
    case 'insertText':
      commit(e.data);
      break;
    case 'insertReplacementText':
      const range = e.getTargetRanges()?.[0];
      replaceRange(range, e.data);
      break;
    case 'deleteContentBackward':
      deleteBackward(1);
      break;
    case 'deleteWordBackward':
    case 'deleteBackwardWord':
      deleteWordBackward();
      break;
  }
});
```

### 4.2 getTargetRanges() 활용

```javascript
el.addEventListener('beforeinput', (e) => {
  const ranges = e.getTargetRanges();
  if (ranges.length > 0) {
    const range = ranges[0];
    // range.startContainer, range.startOffset, 
    // range.endContainer, range.endOffset 로 정확한 범위 파악
  }
});
```

**주의:** `getTargetRanges()`는 모든 환경에서 지원되지 않는다. 없으면 직접 계산해야 한다.

---

## 5. 참고 문서

- [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/) - 환경별 구체적 동작
- [composition 이벤트 시나리오별 처리 규칙](/reference/composition-edge-cases/) - 예외 케이스 처리
- [MDN: beforeinput event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event)
- [W3C Input Events Level 2](https://www.w3.org/TR/input-events-2/)
