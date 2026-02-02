---
title: composition 이벤트 시나리오별 처리 규칙
description: compositionstart/update/end가 예상대로 오지 않을 때 처리하는 방법
---

이 문서는 **이벤트 시나리오별로 에디터가 어떻게 처리해야 하는지**를 정의한다. 브라우저별 구체적인 동작 차이는 [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/)를 참고한다.

---

## 1. 정상 시나리오: composition 3종이 모두 발생

```
compositionstart (data: "")
compositionupdate (data: "ㄱ")
compositionupdate (data: "가")
compositionend (data: "가")
```

**처리:**
1. `compositionstart` → `isComposing = true`
2. `compositionupdate` → `preedit = e.data` (화면에만 표시, 문서에 반영 안 함)
3. `compositionend` → `isComposing = false`, `commit(e.data)` (문서에 반영)

---

## 2. compositionstart 없이 compositionend만 오는 경우

**발생 조건:** 레거시 IME, 상태가 꼬인 경우

**처리:**
```javascript
el.addEventListener('compositionend', (e) => {
  // compositionstart가 없었어도 data가 있으면 commit
  if (e.data) {
    commit(e.data);
  }
  isComposing = false;
});
```

**규칙:**
- `compositionend.data`가 비어있지 않으면 → 커서 위치에 삽입
- `compositionend.data`가 빈 문자열이면 → 무시 (취소로 간주)

---

## 3. compositionupdate가 0번인 경우

**발생 조건:** 일부 IME에서 조합 없이 바로 확정

```
compositionstart (data: "")
compositionend (data: "가")
```

**처리:**
- preedit 구간이 비어 있었던 것으로 처리
- `compositionend.data`를 그대로 commit

---

## 4. composition 없이 insertText만 오는 경우

**발생 조건:**
- 데드 키 입력 (é 등)
- 아랍어 IME (단순 키→문자 매핑)
- iOS Safari 딕테이션
- iOS Safari 한글 (불규칙하게 발생)

**처리:**
```javascript
el.addEventListener('input', (e) => {
  if (!isComposing && e.inputType === 'insertText') {
    commit(e.data);
  }
});
```

**규칙:**
- `compositionstart`가 한 번도 발생하지 않았으면 → "조합 중"이 아님
- `insertText`의 `data`를 바로 문서에 반영

---

## 5. compositionend.data가 긴 문자열인 경우

**발생 조건:**
- 중국어/일본어: 후보에서 문절·문장 단위 선택
- 일본어 再変換 (재변환)

**처리:**
```javascript
el.addEventListener('compositionend', (e) => {
  // 길이 제한 없이 그대로 commit
  commit(e.data);  // "東京都渋谷区" 같은 긴 문자열 가능
});
```

**규칙:**
- `compositionend.data`가 한 글자라고 가정하지 않는다
- 전체 문자열을 하나의 undo 단위로 처리

---

## 6. compositionend.data가 빈 문자열인 경우 (취소)

**발생 조건:**
- 사용자가 Esc 누름
- IME가 조합 취소

**처리:**
```javascript
el.addEventListener('compositionend', (e) => {
  if (e.data === '') {
    // 취소: preedit 구간만 제거
    removePreedit();
  } else {
    commit(e.data);
  }
  isComposing = false;
});
```

---

## 7. compositionend 직후 input이 중복 발생하는 경우

**발생 조건:** 일부 브라우저에서 compositionend 후 같은 내용의 input이 한 번 더 옴

```
compositionend (data: "가")
input (inputType: insertText, data: "가")  // 중복
```

**처리:**
```javascript
let lastCommit = null;
let lastCommitTime = 0;

el.addEventListener('compositionend', (e) => {
  lastCommit = e.data;
  lastCommitTime = Date.now();
  commit(e.data);
  isComposing = false;
});

el.addEventListener('input', (e) => {
  // compositionend 직후 100ms 이내에 같은 내용이 오면 무시
  if (Date.now() - lastCommitTime < 100 && e.data === lastCommit) {
    return;
  }
  if (!isComposing && e.inputType === 'insertText') {
    commit(e.data);
  }
});
```

---

## 8. 삭제 inputType만 오는 경우 (composition 없이)

**발생 조건:** iOS Safari에서 한글 삭제 시

**처리:**
```javascript
el.addEventListener('beforeinput', (e) => {
  switch (e.inputType) {
    case 'deleteContentBackward':
      // 커서 앞 1글자 삭제
      deleteBackward(1);
      break;
    case 'deleteWordBackward':
    case 'deleteBackwardWord':
      // 커서 앞 단어 삭제
      const range = e.getTargetRanges?.()?.[0];
      if (range) {
        deleteRange(range);
      } else {
        deleteWordBackward();
      }
      break;
  }
});
```

---

## 9. blur 시 compositionend가 오지 않는 경우

**발생 조건:** Safari (macOS)

**처리:**
```javascript
el.addEventListener('blur', () => {
  if (isComposing) {
    // Safari: compositionend가 안 옴
    // 정책 선택:
    // A) preedit 버림: removePreedit();
    // B) preedit commit: commit(preeditText);
    isComposing = false;
    preeditText = '';
  }
});
```

---

## 10. 처리 우선순위 정리

| 우선순위 | 조건 | 처리 |
|----------|------|------|
| 1 | `compositionend` 발생 | `e.data`가 있으면 commit, 없으면 취소 |
| 2 | `compositionupdate` 발생 | preedit 갱신 (문서에 반영 안 함) |
| 3 | composition 없이 `insertText` | 바로 commit |
| 4 | composition 없이 `delete*` | 해당 범위 삭제 |
| 5 | `blur` 발생 중 `isComposing` | 강제 정리 |

---

## 11. 참고 문서

- [브라우저·플랫폼별 IME 동작 차이](/reference/browser-platform-quirks/) - 환경별 구체적 동작
- [에디터 구현 시 고려사항](/editor/implementation-notes/) - 전체 구현 가이드
- [용어집](/reference/glossary/) - IME 관련 용어 정의
