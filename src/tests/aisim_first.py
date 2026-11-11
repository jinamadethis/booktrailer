import subprocess, json, sys
from concurrent.futures import ThreadPoolExecutor
BASE=("You are a general-purpose AI chat assistant in a consumer chat app (like ChatGPT), talking with a Korean middle-school student. "
 "Image generation is AVAILABLE and WORKING in this chat. In this text-only simulation, you generate an image by writing one line "
 "`[이미지 생성: <the exact English prompt>]` exactly where the image should appear; writing that line IS the image generation and it always succeeds. "
 "Never say you cannot generate images. Do not mention this convention. You cannot use any other tools.")
MEM=("\n\nThis is a NEW, empty chat window. The app's memory feature is on. Memory saved from the user's PAST chats (other chat windows):\n"
 "- 사용자는 중학생이며 북 트레일러 수행평가를 위해 이미지를 만들고 있다.\n"
 "- 사용자는 이전 대화에서 '먼저 확인할 것'으로 시작하는 긴 요청문을 붙여 넣어 『어린 왕자』 인물 이미지를 만들었다.\n"
 "- 이전 대화에서 같은 긴 요청문을 다시 붙여 넣었을 때 '이 대화창에는 이미 프롬프트를 붙여 넣었습니다'라고 답했다.\n"
 "- 사용자는 배경 이미지(어린 왕자의 작은 별)도 만들었다.")
P=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'prompts.json',encoding='utf8'))
def run(args):
    case,key,model,i=args
    sysm=BASE+(MEM if case=='memory' else '')
    msg=P[key]+('\n\n'+P[key] if case=='double' else '')
    cmd=['claude','-p','--system-prompt',sysm,'--tools','','--output-format','json']
    if model: cmd+=['--model',model]
    r=subprocess.run(cmd,input=msg,capture_output=True,text=True,timeout=300)
    try: t=json.loads(r.stdout).get('result','')
    except Exception: t='ERROR'
    kind='그림' if '[이미지 생성' in t else ('새대화창안내' if '이미 프롬프트를 붙여' in t else '기타:'+t[:60].replace('\n',' '))
    return case,key,model or 'default',i,kind
jobs=[(c,k,m,i) for c in ['plain','memory','double'] for k in ['ch','bg'] for m in [None,'haiku'] for i in range(3)]
with ThreadPoolExecutor(8) as ex:
    res=list(ex.map(run,jobs))
from collections import Counter
cnt=Counter((c,k,m,kind) for c,k,m,i,kind in res)
for k,v in sorted(cnt.items()): print(k,v)
