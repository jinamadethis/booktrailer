# AI 프롬프트 페이지 빌드: src.html → (글꼴 서브셋·예시 그림 끼워 넣기) → build/prompt-maker.html
# 실행: cd src && python3 build.py      (필요: pip install fonttools brotli --break-system-packages)
# 그 다음: python3 sync.py  → ../ai/index.html 갱신('처음 화면' 링크 유지)
import base64, io, json, os
from fontTools import subset
from fontTools.ttLib import TTFont
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src=open('src.html',encoding='utf8').read()
used=set(src)
ks=set()
for a in range(0xB0,0xC9):
    for b in range(0xA1,0xFF):
        try: ks.add(bytes([a,b]).decode('euc-kr'))
        except: pass
base=set(chr(c) for c in range(0x20,0x7F))|set(chr(c) for c in range(0x3131,0x318F))|set(chr(c) for c in range(0x1100,0x1200))|set("·…‘’“”—–→←↑↓×『』「」〈〉《》①②③④⑤⑥⑦⑧⑨⑩○●□■▶%~")
def sub(path, chars):
    f=TTFont(path)
    o=subset.Options(); o.flavor='woff2'; o.layout_features=['*']; o.name_IDs=['*']; o.notdef_outline=True
    s=subset.Subsetter(o); s.populate(text=''.join(chars)); s.subset(f)
    b=io.BytesIO(); f.flavor='woff2'; f.save(b); return b.getvalue()
p7=sub('fonts/Paperlogy-7Bold.woff2', used|base)
p8=sub('fonts/Paperlogy-8ExtraBold.woff2', used|base)
pr=sub('fonts/SUIT-Variable.woff2', used|base|ks)
e=lambda x: base64.b64encode(x).decode()
ex=json.load(open('ex/examples.json')); exl=[ex.get(str(i)) for i in range(9)]
bgj=json.load(open('ex/bg.json')); bgl=[bgj.get(str(i)) for i in range(9)]
out=(src.replace('__EXAMPLES__',json.dumps(exl)).replace('__EXAMPLES_BG__',json.dumps(bgl))
        .replace('__PAPER7__',e(p7)).replace('__PAPER8__',e(p8)).replace('__SUIT__',e(pr)))
os.makedirs('build',exist_ok=True)
open('build/prompt-maker.html','w',encoding='utf8').write(out)
print('build/prompt-maker.html', len(out.encode()), 'bytes')
