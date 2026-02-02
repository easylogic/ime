---
title: 에디터 IME 처리 코드 예시
description: contenteditable, React, ProseMirror/Slate/Lexical 구현 예시
---

---

## 1. contenteditable 기본 구현

```javascript
let isComposing = false;
let compositionStart = 0;

editorEl.addEventListener('compositionstart', () => {
  isComposing = true;
  compositionStart = getCursorOffset();
});

editorEl.addEventListener('compositionupdate', (e) => {
  // DOM에만 preedit 표시 (문서 모델에는 반영하지 않음)
  showPreeditInDOM(compositionStart, e.data);
});

editorEl.addEventListener('compositionend', (e) => {
  isComposing = false;
  clearPreeditFromDOM();
  
  if (e.data) {
    insertToDocument(compositionStart, e.data);
    pushUndoStack();
  }
});

// composition 없이 오는 입력 처리 (iOS Safari 등)
editorEl.addEventListener('input', (e) => {
  if (!isComposing && e.inputType === 'insertText' && e.data) {
    insertToDocument(getCursorOffset(), e.data);
    pushUndoStack();
  }
});

// 단축키에서 조합 중 제외
editorEl.addEventListener('keydown', (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  
  if (e.key === 'Enter') handleEnter();
  if (e.ctrlKey && e.key === 'b') toggleBold();
});

// Safari blur 대응
editorEl.addEventListener('blur', () => {
  if (isComposing) {
    isComposing = false;
    clearPreeditFromDOM();
  }
});
```

---

## 2. compositionend 직후 input 중복 방지

```javascript
let lastCommit = null;
let lastCommitTime = 0;

editorEl.addEventListener('compositionend', (e) => {
  isComposing = false;
  if (e.data) {
    lastCommit = e.data;
    lastCommitTime = Date.now();
    insertToDocument(compositionStart, e.data);
    pushUndoStack();
  }
});

editorEl.addEventListener('input', (e) => {
  // 100ms 이내 동일 내용 무시
  if (Date.now() - lastCommitTime < 100 && e.data === lastCommit) {
    return;
  }
  
  if (!isComposing && e.inputType === 'insertText' && e.data) {
    insertToDocument(getCursorOffset(), e.data);
  }
});
```

---

## 3. React controlled input

```javascript
function IMEInput() {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const composingRef = useRef(false);

  const handleCompositionStart = () => {
    composingRef.current = true;
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    composingRef.current = false;
    setIsComposing(false);
    // React의 onChange가 실제 값을 처리함
  };

  const handleChange = (e) => {
    // 조합 중이든 아니든 값을 반영
    // React는 controlled input에서 조합 중에도 값을 업데이트해야 함
    setValue(e.target.value);
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
}
```

**주의:** React controlled input에서는 조합 중에도 `value`를 업데이트해야 한다. 그렇지 않으면 IME 동작이 깨진다.

---

## 4. ProseMirror

```javascript
// view.composing으로 조합 중 여부 확인
if (view.composing) {
  // 조합 중에는 특정 처리 생략
}

// 플러그인에서 composition 이벤트 활용
const plugin = new Plugin({
  props: {
    handleDOMEvents: {
      compositionstart(view) {
        // 조합 시작 처리
        return false; // ProseMirror 기본 처리 유지
      },
      compositionend(view, event) {
        // 조합 종료 후 처리
        return false;
      }
    }
  }
});
```

**Safari 주의사항:** MutationObserver가 compositionend보다 먼저 fire하는 버그가 있다 (ProseMirror issue #1190).

---

## 5. Slate

```javascript
// Slate의 beforeinput 처리
const withIME = (editor) => {
  const { insertText } = editor;
  
  editor.insertText = (text) => {
    // 조합 중 여부에 따라 처리 분기
    if (editor.composition) {
      // preedit으로만 처리
    } else {
      insertText(text);
    }
  };
  
  return editor;
};
```

---

## 6. Undo 처리

```javascript
// 조합 중: undo 스택에 넣지 않음
// compositionend: 한 번만 넣음

editorEl.addEventListener('compositionupdate', (e) => {
  // pushUndoStack() 호출하지 않음
  showPreedit(e.data);
});

editorEl.addEventListener('compositionend', (e) => {
  if (e.data) {
    insertToDocument(e.data);
    pushUndoStack(); // 여기서만 한 번
  }
});
```

---

## 7. 참고 문서

- [에디터 IME 구현 가이드](/editor/implementation-notes/)
- [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/)
- [composition 시나리오별 처리 규칙](/reference/composition-edge-cases/)
