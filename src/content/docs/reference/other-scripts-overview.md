---
title: 기타 문자계 개요
description: 티베트·에티오피아 등 추가 문자계의 조합 특성, 유니코드, IME 관점 요약
---

이 사이트에서는 **한글·일본어·중국어·아랍어·유럽권·베트남어·태국어·인도계·히브리어**를 전용 문서로 다룬다. 아래는 **그 밖의 문자계**를 IME·에디터 관점에서 짧게 소개한 것이다. **티베트·미얀마·전통 몽골 문자**의 상세는 [티베트·미얀마·몽골 문자](/docs/reference/tibetan-myanmar-mongol)를 본다.

---

## 1. 티베트 문자 (Tibetan)

- **유니코드**: Tibetan 블록 (U+0F00~U+0FFF). **자음 + 모음 기호 + 종성** 등이 **위·아래로 쌓이는** 구조.
- **조합·IME·그래핀**: [티베트·미얀마·몽골 문자 §1](/docs/reference/tibetan-myanmar-mongol) 참고.

---

## 2. 에티오피아 문자 (Ethiopic / Ge'ez)

- **유니코드**: Ethiopic 블록 (U+1200~U+137F 등). **자음 + 모음**이 **한 음절**로 조합되는 **음절 문자** 계열.
- **조합**: **Precomposed** 음절(한 코드 포인트)이 많고, **분해형**도 있다. 문자열 비교·검색 시 **정규화**(NFC/NFD)를 통일하면 안정적이다. [인도계 문자](/docs/indic/combination), [macOS 한글 자소 분리](/docs/reference/mac-hangul-decomposition)의 정규화 논의와 유사하다.
- **IME**: 입력기마다 **조합 중**을 composition으로 보내는지, **한 번에 commit**만 보내는지 다를 수 있다. 에디터는 **composition 3종**과 **insertText** 둘 다 처리하면 된다.

---

## 3. 미얀마·몽골·캄보디아 등

- **미얀마·전통 몽골 문자**: [티베트·미얀마·몽골 문자](/docs/reference/tibetan-myanmar-mongol) §2·§3.
- **캄보디아(크메르)**: 동일 문서 §4.
- **태국**은 [태국어 조합 원리](/docs/thai/combination) 전용 문서가 있다.
- **신규 언어/문자계** 문서를 추가할 때는 **조합 원리**·**입력기**·**플랫폼별 동작**·**에디터 대응**을 같은 형식으로 두면, 기존 문서와 일관되게 유지할 수 있다.

---

## 4. 참고

- [티베트·미얀마·몽골 문자](/docs/reference/tibetan-myanmar-mongol) — 티베트·미얀마·몽골·크메르 요약
- [텍스트 세그멘테이션](/docs/reference/text-segmentation) — UAX #29, Intl.Segmenter
- [인도계 문자 조합 원리](/docs/indic/combination) — 자음+matra+연자, 정규화
- [태국어 조합 원리](/docs/thai/combination) — 자음·모음·성조, 그래핀
- [Unicode Standard](https://www.unicode.org/standard/standard.html) — 각 블록 명세
