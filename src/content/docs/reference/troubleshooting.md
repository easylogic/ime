---
title: 트러블슈팅
description: IME 입력 문제 해결을 위한 증상별 원인과 해결책
---

증상별로 **원인**과 **해결책**을 정리했다. 모든 내용은 [에디터 IME 구현 가이드](/editor/implementation-notes/)와 [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/)를 참고한다.

---

## 1. 한글이 깨져서 들어간다

### 원인

`compositionupdate`의 data를 문서에 바로 반영하고 있다.

### 해결

```javascript
// compositionupdate는 화면 표시만
editorEl.addEventListener('compositionupdate', (e) => {
  showPreedit(e.data); // 화면에만 표시
});

// compositionend만 문서에 반영
editorEl.addEventListener('compositionend', (e) => {
  if (e.data) {
    commitToDocument(e.data);
  }
});
```

---

## 2. compositionend가 안 온다

### 가능한 원인 4가지

| 원인 | 확인 방법 |
|------|-----------|
| iOS Safari 딕테이션 | 음성 입력 버튼 사용 여부 |
| iOS Safari 한글 입력 | composition 없이 insertText만 오는지 |
| 데드 키 입력 (é 등) | composition 없이 insertText만 오는지 |
| Safari blur | 포커스를 잃기 전에 조합 중이었는지 |

### 해결

```javascript
// composition 없이 insertText가 오면 바로 commit
editorEl.addEventListener('input', (e) => {
  if (!isComposing && e.inputType === 'insertText' && e.data) {
    commitToDocument(e.data);
  }
});

// Safari blur 대응
editorEl.addEventListener('blur', () => {
  if (isComposing) {
    isComposing = false;
    clearPreedit();
  }
});
```

---

## 3. Enter를 누르면 미확정 한글이 전송된다

### 원인

조합 중에 Enter를 처리하고 있다.

### 해결

```javascript
editorEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.isComposing) {
    return; // IME에 넘김
  }
  // Enter 처리
});
```

---

## 4. 조합 중에 단축키가 먹힌다

### 원인

`isComposing`을 확인하지 않고 있다.

### 해결

```javascript
editorEl.addEventListener('keydown', (e) => {
  // Safari 보완: keyCode 229도 체크
  if (e.isComposing || e.keyCode === 229) {
    return;
  }
  // 단축키 처리
});
```

---

## 5. 포커스를 잃었는데 조합 상태가 안 풀린다

### 원인

Safari는 blur 시 compositionend를 발생시키지 않는다 (WebKit Bug 164369).

### 해결

```javascript
editorEl.addEventListener('blur', () => {
  if (isComposing) {
    isComposing = false;
    clearPreedit(); // 또는 commit
  }
});
```

---

## 6. 디버깅 코드

문제 파악을 위해 아래 코드로 이벤트를 로깅한다:

```javascript
const events = ['compositionstart', 'compositionupdate', 'compositionend'];
events.forEach(name => {
  el.addEventListener(name, e => console.log(name, JSON.stringify(e.data)));
});

el.addEventListener('input', e => 
  console.log('input', e.inputType, JSON.stringify(e.data))
);

el.addEventListener('keydown', e => 
  console.log('keydown', e.key, e.keyCode, e.isComposing)
);
```

---

## 7. 테스트 매트릭스

| OS | 브라우저 | 예상 동작 |
|----|----------|-----------|
| Windows | Chrome | composition 정상 발생 |
| Windows | Firefox | Enter 시 조기 compositionend (Bug 1675313) |
| macOS | Safari | 이벤트 순서 역전, blur 시 compositionend 없음 |
| iOS | Safari | **composition 불규칙**, 딕테이션 시 composition 없음 |
| Android | Chrome | keyCode 항상 229 |

---

## 8. 참고 문서

- [에디터 IME 구현 가이드](/editor/implementation-notes/)
- [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/)
- [composition 시나리오별 처리 규칙](/reference/composition-edge-cases/)
