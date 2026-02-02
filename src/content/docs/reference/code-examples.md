---
title: IME·한글 구현 코드 예시
description: 웹 composition 처리, libhangul 사용, 완성형 계산 코드
---

IME와 한글 입력을 실제로 다룰 때 참고할 **코드 예시**를 정리했다. 웹에서는 composition 이벤트만 처리하면 되고, 네이티브·임베디드에서는 libhangul 또는 직접 조합 로직을 쓸 수 있다.

---

## 1. 웹: composition 이벤트 처리 (JavaScript)

### 1.1 기본 구독

```javascript
const el = document.querySelector('input'); // 또는 contenteditable 요소

let isComposing = false;
let compositionStartOffset = 0; // 조합 구간 시작 위치 (에디터 모델 기준)

el.addEventListener('compositionstart', (e) => {
  isComposing = true;
  compositionStartOffset = getCurrentCursorOffset(); // 구현에 따라 커서 위치 저장
});

el.addEventListener('compositionupdate', (e) => {
  const preedit = e.data;
  // preedit을 화면에만 표시. 문서 모델에는 반영하지 않음.
  updatePreeditDisplay(compositionStartOffset, preedit);
});

el.addEventListener('compositionend', (e) => {
  const committed = e.data;
  isComposing = false;
  if (committed.length > 0) {
    replaceRange(compositionStartOffset, getCurrentCursorOffset(), committed);
    pushUndo();
  }
  clearPreeditDisplay();
});
```

### 1.2 단축키에서 조합 중 제외 (isComposing)

```javascript
el.addEventListener('keydown', (e) => {
  if (e.isComposing) return; // IME 조합 중이면 단축키 무시
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    doBold();
  }
});
```

### 1.3 composition 없이 insertText만 오는 경우

```javascript
el.addEventListener('input', (e) => {
  if (isComposing) return; // compositionend에서 처리
  if (e.inputType === 'insertText' && e.data) {
    insertAtCursor(e.data);
    pushUndo();
  }
});
```

---

## 2. 한글 완성형 계산 (JavaScript)

유니코드 한글 음절 공식: `S = 0xAC00 + (L×588) + (V×28) + T`. L=초성 인덱스(0~18), V=중성(0~20), T=종성(0~27, 0=없음).

```javascript
const CHO = 19, JUNG = 21, JONG = 28;
const BASE = 0xac00;

function syllableToCodePoint(L, V, T) {
  if (L < 0 || V < 0) return null;
  const t = T >= 0 ? T : 0;
  return BASE + L * (JUNG * JONG) + V * JONG + t;
}

function codePointToSyllable(S) {
  if (S < BASE || S > 0xd7a3) return null;
  const x = S - BASE;
  const L = Math.floor(x / (JUNG * JONG));
  const V = Math.floor((x % (JUNG * JONG)) / JONG);
  const T = x % JONG;
  return { L, V, T: T === 0 ? -1 : T };
}
```

초성·중성·종성 인덱스는 "한글 조합 원리" 문서의 자모 표와 동일하다. 2벌식 키 → (L,V,T) 매핑은 "한글 입력기 구현" 문서 참고.

---

## 3. libhangul 사용 (C)

libhangul은 **HangulInputContext**로 키 입력을 받아 preedit·commit 문자열을 돌려준다.

### 3.1 초기화·키 처리

```c
#include <hangul/hangul.h>

HangulInputContext* hic = hangul_ic_new("2");  /* "2" = 2벌식 키보드 ID */

/* 키 입력 시 (ascii = 키 코드 또는 문자) */
bool ret = hangul_ic_process(hic, ascii);

const ucschar* preedit = hangul_ic_get_preedit_string(hic);
const ucschar* commit  = hangul_ic_get_commit_string(hic);
```

- **hangul_ic_process**: 키 하나를 넣으면 내부 상태(L,V,T)를 갱신한다. 반환값은 “이번 입력으로 commit이 발생했는지” 등 구현에 따라 다름.
- **hangul_ic_get_preedit_string**: 현재 조합 중인 문자열(완성형 한 글자 또는 자모).
- **hangul_ic_get_commit_string**: 이번 **process** 호출로 확정된 문자열. 있으면 앱이 문서에 반영한 뒤, 다음 process 전에 **hangul_ic_reset**으로 commit 버퍼를 비우는 식으로 쓴다.

### 3.2 백스페이스·리셋

```c
hangul_ic_backspace(hic);  /* 조합 중 한 단계 취소 */
hangul_ic_reset(hic);      /* 조합 상태·commit 버퍼 초기화 (포커스 잃음, Esc 등) */
```

### 3.3 한자 변환(한자 사전)

```c
HanjaTable* table = hanja_table_load("hanja.txt");  /* 한자 사전 파일 */
HanjaList*  list  = hanja_table_match_prefix(table, "한글");  /* 접두어 매칭 */

int n = hanja_list_get_size(list);
for (int i = 0; i < n; i++) {
  const char* key   = hanja_list_get_nth_key(list, i);
  const char* value = hanja_list_get_nth_value(list, i);
  /* key = 읽기, value = 한자 등 */
}
hanja_list_delete(list);
hanja_table_delete(table);
```

자세한 API는 [한글: libhangul API](/korean/libhangul-api/) 참고.

---

## 4. 참고

- **웹**: [composition 시나리오별 처리 규칙](/reference/composition-edge-cases/), [KeyboardEvent.isComposing](/reference/is-composing/).
- **한글 조합**: [한글 조합 원리](/korean/combination/), [한글 입력기 구현](/korean/implementation/).
- **플랫폼 IME**: [IME 구조](/guide/ime-architecture/), [IME 구현 상세](/reference/ime-implementation-details/).
