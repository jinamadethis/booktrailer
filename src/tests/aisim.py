import subprocess, json, sys, os
SYS_IMG = ("You are a general-purpose AI chat assistant in a consumer chat app (like ChatGPT), talking with a Korean middle-school student. "
           "Image generation is AVAILABLE and WORKING in this chat. In this text-only simulation, you generate an image by writing one line "
           "`[이미지 생성: <the exact English prompt>]` exactly where the image should appear; writing that line IS the image generation and it always succeeds. "
           "Never say you cannot generate images. Do not mention this convention. You cannot use any other tools.")
SYS_NOIMG = ("You are a general-purpose AI chat assistant in a consumer chat app, talking with a Korean middle-school student. "
             "You cannot generate images in this chat. You cannot use any other tools.")
def chat(turns, sysp, model=None):
    sid=None; out=[]
    for t in turns:
        cmd=['claude','-p','--system-prompt',sysp,'--tools','','--output-format','json']
        if model: cmd+=['--model',model]
        if sid: cmd+=['--resume',sid]
        r=subprocess.run(cmd,input=t,capture_output=True,text=True,timeout=300)
        try: j=json.loads(r.stdout)
        except Exception: out.append('ERROR: '+r.stdout[:300]+r.stderr[:300]); break
        sid=j.get('session_id'); out.append(j.get('result',''))
    return out
P={k:open(k+'.txt',encoding='utf8').read() for k in ['p_ch1','p_ch2','p_bg1']}
FU_LIKE='이 인물의 얼굴, 머리, 체형, 옷, 그림체는 그대로 두고 아래만 바꾼 이미지를 한 장 더 만들어 줘. 배경은 계속 흰 배경.\n- 표정: 눈물을 참는 얼굴'
SC={
 'A':(SYS_IMG,[P['p_ch1'],FU_LIKE,'안경을 더 크게',P['p_ch2'],P['p_ch1']]),
 'B':(SYS_IMG,[P['p_bg1'],P['p_ch1']]),
 'C':(SYS_NOIMG,[P['p_ch1']]),
 'D':(SYS_IMG,[P['p_ch1'],'이번엔 다른 친구도 그려 줘. 키 크고 갈색 머리 남자애']),
}
name=sys.argv[1]; model=sys.argv[2] if len(sys.argv)>2 and sys.argv[2]!='-' else None
sysp,turns=SC[name]
res=chat(turns,sysp,model)
labels={'A':['1 첫 붙여넣기(윤하)','2 7단계 추가 요청(표정)','3 짧은 수정(안경)','4 다른 인물 프롬프트 붙여넣기(도윤)','5 같은 인물 프롬프트 다시 붙여넣기'],
        'B':['1 배경 첫 붙여넣기','2 인물 프롬프트 붙여넣기'],'C':['1 이미지 못 만드는 AI에 붙여넣기'],'D':['1 첫 붙여넣기','2 글로 다른 인물 요청']}[name]
with open(f'sim_{name}_{model or "default"}.txt','w',encoding='utf8') as f:
    for l,r in zip(labels,res): f.write(f'===== {l}\n{r}\n\n')
print('done',name,model,len(res))
