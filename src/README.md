# AI 프롬프트 페이지 원본

`ai/index.html`(= 클로드 게시본 https://claude.ai/artifact/7gS9TUbUeFRgvFyzESP1yo)을 만드는 원본입니다.
게시된 HTML에는 글꼴이 쓰인 글자만 잘라서 들어 있으므로, 새 글자가 들어가는 수정은 여기서 고친 뒤 다시 빌드합니다.

## 고치는 순서
1. `src.html` 고치기 (페이지 맨 위 `페이지 버전` 숫자도 올리기)
2. `python3 build.py` → `build/prompt-maker.html` 생성 (필요: `pip install fonttools brotli`)
3. `build/prompt-maker.html`을 클로드 게시본(위 링크)에 게시
4. `python3 sync.py` → `../ai/index.html` 갱신 ('처음 화면' 링크는 자동으로 유지)
5. 커밋·푸시 후 https://jinamadethis.github.io/booktrailer/ai/index.html 에서 확인

## 파일
- `src.html` — 페이지 원본. `__PAPER7__` `__PAPER8__` `__SUIT__` `__EXAMPLES__` `__EXAMPLES_BG__` 자리에 빌드 때 글꼴·예시 그림이 들어감
- `ex/examples.json`, `ex/bg.json` — 그림체 9종의 인물·배경 예시 그림(base64)
- `fonts/` — Paperlogy 7·8, SUIT Variable (둘 다 SIL Open Font License)
- `tests/` — Playwright 점검 스크립트(`t41.js` 전체 흐름, `mock.js` 모의 수업, `tcopy2.js` 복사 버튼 반짝임), `genprompts.js`(채운 프롬프트 생성), `aisim.py`(AI 응답 모의 실험). 스크립트는 `site/prompt-maker.html` 경로를 쓰므로 실행 전 경로를 `build/prompt-maker.html`로 맞출 것

직접 촬영 안내(`shoot/index.html`)는 글꼴을 따로 넣지 않으므로 그 파일 자체가 원본입니다.
