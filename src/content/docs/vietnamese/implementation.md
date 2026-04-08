---
title: 베트남어 입력기 구현
description: Telex/VNI/VIQR 상태·commit, NFC/NFD, 웹·네이티브에서 composition·insertText
---

베트남어 입력기는 **로마자 시퀀스**를 **확장 문자·성조가 붙은 한 글자**(ă, ệ 등)로 바꾼다. [베트남어 조합 원리](/docs/vietnamese/combination)의 Telex·VNI·VIQR 규칙을 엔진이 구현한다. 웹 에디터는 대부분 **OS IME**가 보내는 **composition 이벤트**와 **insertText**만 처리하면 된다. **자체 IME**(임베디드·게임 등)를 만들 때 아래를 구분한다.

---

## 1. 구현할 것 요약

1. **입력법 테이블**: Telex·VNI·VIQR별로 **키 시퀀스 → 유니코드 코드 포인트(또는 시퀀스)** 매핑. 예: Telex `aa` → U+0103 (ă), `dd` → U+0111 (đ).
2. **성조 규칙**: 성조 부호는 **결합 문자**로 붙거나 **미리 조합된 한 코드 포인트**(예: U+1EC7 ệ)로 끝날 수 있다. 엔진은 **출력할 NFC/NFD 정책**을 하나로 정한다.
3. **조합 중(preedit)**: 아직 확정되지 않은 로마자 버퍼 또는 중간 형태를 preedit으로 표시. OS·IME는 **setMarkedText** / **compositionupdate**에 해당 문자열을 넣는다.
4. **commit**: 음절·글자가 확정되면 **compositionend**의 `data` 또는 **insertText**의 `data`로 문서에 반영.
5. **취소**: Esc·포커스 잃음 → preedit 제거, commit 없음.

---

## 2. 상태 머신(자체 엔진 시)

- **버퍼**: 사용자가 친 ASCII/로마자를 누적한다. Telex에서 `e` 다음 `e`가 오면 `ê`로 치환할지, 아직 `ee`를 기다릴지 등 **최대 시퀀스 길이**를 규칙으로 정한다.
- **중간 결과**: `ươ` 같은 다타 입력은 여러 키 끝에 한 번에 유니코드로 확정되거나, 글자마다 갱신될 수 있다. **compositionupdate** 횟수는 IME 구현에 따라 다르다.
- **commit 타이밍**: 스페이스·문장 부호·다음 글자의 첫 키가 오면 이전 음절을 확정하는 식으로 정할 수 있다. OS IME와 동일할 필요는 없으나, **사용자 기대**와 맞추는 것이 좋다.

---

## 3. 유니코드·정규화

- 같은 표면 문자가 **NFC**(한 코드 포인트)와 **NFD**(기준 문자 + 결합 문자)로 둘 다 표현될 수 있다. [베트남어 조합 원리 §1.2](/docs/vietnamese/combination) 참고.
- 저장·검색·비교 전에 **String.prototype.normalize('NFC')** 또는 **normalize('NFD')** 중 하나로 통일한다.
- 에디터는 **IME가 준 문자열**을 그대로 넣고, **검색 인덱스**만 정규화하는 방식이 흔하다.

---

## 4. 웹·플랫폼에서의 이벤트

- **Windows TSF / macOS NSTextInputClient / Linux IBus·Fcitx**: 조합 문자열과 commit을 플랫폼 API로 전달. 브라우저는 **CompositionEvent** 또는 **InputEvent(insertText)** 로 매핑한다.
- **composition이 오는 경우**: [글자 조합](/docs/guide/composition)에 따라 compositionstart → compositionupdate → compositionend 처리.
- **composition 없이 insertText만 오는 경우**: [composition 시나리오별 처리 규칙](/docs/reference/composition-edge-cases), [트러블슈팅](/docs/reference/troubleshooting). `inputType === 'insertText'`이면 `data`를 commit.
- **모바일**: Android/iOS 키보드 앱마다 composition 발생 여부가 다르다. [베트남어 입력기 §4](/docs/vietnamese/input-methods)와 동일한 대응이면 된다.

---

## 5. 에디터 구현 체크(베트남어 특유)

- [ ] Telex/VNI로 **여러 키**에 걸친 조합이 **insertText 한 번**으로만 올 때도 텍스트가 누락되지 않는가.
- [ ] **데드 키** 경로(유럽권과 동일)와 **IME 조합** 경로가 **동시에** 켜져 있을 때 중복 삽입이 없는가.
- [ ] 문자열 **정규화**를 할 경우 **커서 오프셋**이 코드 유닛 기준으로 깨지지 않는가(UTF-16 서로게이트 쌍).

---

## 6. 참고

- [베트남어 조합 원리](/docs/vietnamese/combination) — Telex·VNI·VIQR, 데드 키
- [베트남어 입력기](/docs/vietnamese/input-methods) — OS별 IME
- [유럽권 조합 원리](/docs/european/combination) — 데드 키·composition 유무
- [에디터 IME 구현 가이드](/docs/editor/implementation-notes) — 공통 composition·insertText 처리
