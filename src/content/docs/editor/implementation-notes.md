---
title: 에디터 IME 구현 가이드
description: composition 이벤트 처리, 예외 케이스 대응, 완전한 구현 코드
---

이 문서는 웹 에디터에서 IME를 올바르게 처리하는 **완전한 구현 가이드**다.

---

## 1. 기본 구현

### 1.1 최소 구현 (필수)

```javascript
class IMEHandler {
  constructor(element) {
    this.el = element;
    this.isComposing = false;
    this.preeditText = '';
    
    this.el.addEventListener('compositionstart', this.onCompositionStart.bind(this));
    this.el.addEventListener('compositionupdate', this.onCompositionUpdate.bind(this));
    this.el.addEventListener('compositionend', this.onCompositionEnd.bind(this));
    this.el.addEventListener('input', this.onInput.bind(this));
  }

  onCompositionStart(e) {
    this.isComposing = true;
    this.preeditText = '';
  }

  onCompositionUpdate(e) {
    this.preeditText = e.data;
    this.updatePreeditDisplay(e.data);
  }

  onCompositionEnd(e) {
    this.isComposing = false;
    this.preeditText = '';
    
    if (e.data) {
      this.commit(e.data);
    } else {
      this.cancelPreedit();
    }
  }

  onInput(e) {
    // composition 없이 insertText가 오면 바로 commit
    if (!this.isComposing && e.inputType === 'insertText' && e.data) {
      this.commit(e.data);
    }
  }

  updatePreeditDisplay(text) {
    // 화면에만 표시, 문서 모델에는 반영하지 않음
  }

  commit(text) {
    // 문서에 반영, undo 스택에 추가
  }

  cancelPreedit() {
    // preedit 구간 제거
  }
}
```

### 1.2 처리 규칙

| 이벤트 | 처리 |
|--------|------|
| `compositionstart` | `isComposing = true`, preedit 구간 생성 |
| `compositionupdate` | preedit 내용 갱신 (문서 반영 안 함) |
| `compositionend` + data 있음 | `isComposing = false`, commit |
| `compositionend` + data 없음 | `isComposing = false`, preedit 취소 |
| `input` + `!isComposing` + `insertText` | commit |

---

## 2. 브라우저별 예외 처리

### 2.1 Safari: keyCode 229 보완

Safari에서는 `isComposing`이 올바르게 설정되지 않는 경우가 있다.

```javascript
onKeyDown(e) {
  // Safari 보완: keyCode 229면 IME가 처리 중
  if (e.isComposing || e.keyCode === 229) {
    return; // 단축키로 처리하지 않음
  }
  
  this.handleShortcut(e);
}
```

### 2.2 Safari: blur 시 compositionend 미발생

```javascript
constructor(element) {
  // ... 기존 코드 ...
  this.el.addEventListener('blur', this.onBlur.bind(this));
}

onBlur() {
  if (this.isComposing) {
    // Safari: compositionend가 안 옴
    this.isComposing = false;
    
    // 정책 선택 (둘 중 하나):
    // A) preedit 버림
    this.cancelPreedit();
    
    // B) preedit commit
    // if (this.preeditText) this.commit(this.preeditText);
    
    this.preeditText = '';
  }
}
```

### 2.3 Firefox: Enter 시 isComposing 확인

```javascript
onKeyDown(e) {
  if (e.key === 'Enter') {
    if (e.isComposing) {
      // Enter를 IME에 넘김 (Firefox 조기 compositionend 버그 대응)
      return;
    }
    this.submitOrNewLine();
  }
}
```

### 2.4 compositionend 직후 input 중복 방지

```javascript
constructor(element) {
  // ... 기존 코드 ...
  this.lastCommit = null;
  this.lastCommitTime = 0;
}

onCompositionEnd(e) {
  this.isComposing = false;
  this.preeditText = '';
  
  if (e.data) {
    this.lastCommit = e.data;
    this.lastCommitTime = Date.now();
    this.commit(e.data);
  } else {
    this.cancelPreedit();
  }
}

onInput(e) {
  // compositionend 직후 100ms 이내 동일 내용 무시
  if (Date.now() - this.lastCommitTime < 100 && e.data === this.lastCommit) {
    return;
  }
  
  if (!this.isComposing && e.inputType === 'insertText' && e.data) {
    this.commit(e.data);
  }
}
```

---

## 3. iOS Safari 대응

iOS Safari는 composition 이벤트가 불규칙하게 발생한다. **composition에만 의존하면 안 된다.**

### 3.1 inputType 기반 처리 추가

```javascript
constructor(element) {
  // ... 기존 코드 ...
  this.el.addEventListener('beforeinput', this.onBeforeInput.bind(this));
}

onBeforeInput(e) {
  // composition 중이면 무시 (compositionend에서 처리)
  if (this.isComposing) return;

  switch (e.inputType) {
    case 'insertText':
      // composition 없이 오는 입력 처리
      // onInput에서도 처리하므로 여기서는 생략 가능
      break;
      
    case 'insertReplacementText':
      // 자동 수정
      e.preventDefault();
      const ranges = e.getTargetRanges();
      if (ranges.length > 0) {
        this.replaceRange(ranges[0], e.data);
      }
      break;
      
    case 'deleteContentBackward':
      e.preventDefault();
      this.deleteBackward(1);
      break;
      
    case 'deleteWordBackward':
    case 'deleteBackwardWord':
      e.preventDefault();
      const deleteRanges = e.getTargetRanges();
      if (deleteRanges.length > 0) {
        this.deleteRange(deleteRanges[0]);
      } else {
        this.deleteWordBackward();
      }
      break;
  }
}
```

### 3.2 딕테이션(음성 입력) 처리

iOS Safari 딕테이션은 composition 이벤트가 발생하지 않는다.

```javascript
onInput(e) {
  // composition 없이 insertText가 오면 바로 commit
  // → 딕테이션, 또는 한글 입력이 composition 없이 오는 경우
  if (!this.isComposing && e.inputType === 'insertText' && e.data) {
    this.commit(e.data);
  }
}
```

---

## 4. DOM/Selection 관리

### 4.1 preedit 구간 표시

```javascript
updatePreeditDisplay(text) {
  if (!this.preeditNode) {
    // preedit 구간 생성
    this.preeditNode = document.createElement('span');
    this.preeditNode.className = 'ime-preedit';
    this.preeditNode.style.textDecoration = 'underline';
    // 커서 위치에 삽입
  }
  
  this.preeditNode.textContent = text;
}

cancelPreedit() {
  if (this.preeditNode) {
    this.preeditNode.remove();
    this.preeditNode = null;
  }
}

commit(text) {
  if (this.preeditNode) {
    // preedit 노드를 일반 텍스트로 교체
    const textNode = document.createTextNode(text);
    this.preeditNode.replaceWith(textNode);
    this.preeditNode = null;
  } else {
    // preedit 없이 commit이 온 경우 (iOS Safari 등)
    this.insertAtCursor(text);
  }
  
  this.addToUndoStack({ type: 'insert', text });
}
```

### 4.2 Selection 주의사항

```javascript
// 조합 중에는 selection을 임의로 바꾸지 않는다
// IME 상태가 꼬일 수 있음

onSelectionChange() {
  if (this.isComposing) {
    // 조합 중에는 selection 변경 무시하거나
    // preedit 구간 내로 제한
    return;
  }
  
  this.updateSelectionState();
}
```

---

## 5. Undo/Redo

### 5.1 규칙

| 상황 | undo 스택 |
|------|-----------|
| compositionupdate | **넣지 않음** |
| compositionend (commit) | **한 번** 넣음 |
| compositionend (취소) | 넣지 않음 |
| insertText (composition 없이) | 넣음 |

### 5.2 구현

```javascript
commit(text) {
  // 문서에 반영
  this.insertAtCursor(text);
  
  // undo 스택에 한 번만
  this.undoStack.push({
    type: 'insert',
    text: text,
    position: this.cursorPosition - text.length
  });
}

// 조합 중 Undo 키 처리
onKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    if (this.isComposing) {
      // 조합 중에는 Undo를 IME에 맡기거나 무시
      return;
    }
    e.preventDefault();
    this.undo();
  }
}
```

---

## 6. 완전한 구현 예시

```javascript
class CompleteIMEHandler {
  constructor(element) {
    this.el = element;
    this.isComposing = false;
    this.preeditText = '';
    this.preeditNode = null;
    this.lastCommit = null;
    this.lastCommitTime = 0;
    this.undoStack = [];
    
    // 이벤트 리스너
    this.el.addEventListener('compositionstart', this.onCompositionStart.bind(this));
    this.el.addEventListener('compositionupdate', this.onCompositionUpdate.bind(this));
    this.el.addEventListener('compositionend', this.onCompositionEnd.bind(this));
    this.el.addEventListener('beforeinput', this.onBeforeInput.bind(this));
    this.el.addEventListener('input', this.onInput.bind(this));
    this.el.addEventListener('keydown', this.onKeyDown.bind(this));
    this.el.addEventListener('blur', this.onBlur.bind(this));
  }

  onCompositionStart(e) {
    this.isComposing = true;
    this.preeditText = '';
  }

  onCompositionUpdate(e) {
    this.preeditText = e.data;
    this.updatePreeditDisplay(e.data);
  }

  onCompositionEnd(e) {
    this.isComposing = false;
    
    if (e.data) {
      this.lastCommit = e.data;
      this.lastCommitTime = Date.now();
      this.commit(e.data);
    } else {
      this.cancelPreedit();
    }
    
    this.preeditText = '';
  }

  onBeforeInput(e) {
    if (this.isComposing) return;

    switch (e.inputType) {
      case 'insertReplacementText':
        e.preventDefault();
        const ranges = e.getTargetRanges();
        if (ranges.length > 0) {
          this.replaceRange(ranges[0], e.data);
        }
        break;
      case 'deleteContentBackward':
        e.preventDefault();
        this.deleteBackward(1);
        break;
      case 'deleteWordBackward':
      case 'deleteBackwardWord':
        e.preventDefault();
        this.deleteWordBackward();
        break;
    }
  }

  onInput(e) {
    // 중복 방지
    if (Date.now() - this.lastCommitTime < 100 && e.data === this.lastCommit) {
      return;
    }
    
    // composition 없이 오는 입력 (iOS Safari 등)
    if (!this.isComposing && e.inputType === 'insertText' && e.data) {
      this.commit(e.data);
    }
  }

  onKeyDown(e) {
    // IME 조합 중이면 단축키 무시
    if (e.isComposing || e.keyCode === 229) {
      return;
    }
    
    // Enter 처리
    if (e.key === 'Enter') {
      this.handleEnter(e);
      return;
    }
    
    // 단축키 처리
    this.handleShortcut(e);
  }

  onBlur() {
    if (this.isComposing) {
      // Safari: compositionend가 안 옴
      this.isComposing = false;
      this.cancelPreedit();
      this.preeditText = '';
    }
  }

  // ... 나머지 메서드 구현 ...
}
```

---

## 7. 체크리스트

에디터가 IME를 올바르게 지원하는지 확인:

- [ ] `compositionstart` / `compositionupdate` / `compositionend` 구독
- [ ] 조합 중 구간을 화면에만 표시 (문서 모델에 반영 안 함)
- [ ] `compositionend` 시점에만 commit
- [ ] `compositionend.data` 빈 문자열이면 취소 처리
- [ ] composition 없이 `insertText` 오면 commit (iOS Safari)
- [ ] `keydown`에서 `isComposing` 또는 `keyCode === 229` 확인
- [ ] `blur` 시 조합 중이면 강제 정리
- [ ] compositionend 직후 input 중복 방지
- [ ] `insertReplacementText` 처리 (모바일 자동 수정)
- [ ] `deleteWordBackward` / `deleteBackwardWord` 처리

---

## 8. 참고 문서

- [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/)
- [composition 이벤트 시나리오별 처리 규칙](/reference/composition-edge-cases/)
- [inputType 상세](/reference/inputtype/)
