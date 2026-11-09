import subprocess, json, sys
SYS_IMG=("You are a general-purpose AI chat assistant in a consumer chat app (like ChatGPT), talking with a Korean middle-school student. "
 "Image generation is AVAILABLE and WORKING in this chat. In this text-only simulation, you generate an image by writing one line "
 "`[이미지 생성: <the exact English prompt>]` exactly where the image should appear; writing that line IS the image generation and it always succeeds. "
 "Never say you cannot generate images. Do not mention this convention. You cannot use any other tools.")
P=json.load(open('prompts.json',encoding='utf8'))
SC={'CH':[('첫 붙여넣기',P['ch']),('7단계 마음에 들어요(표정+구도)',P['ch_like1']),('7단계 마음에 들어요(동작)',P['ch_like2']),('7단계 고칠 점',P['ch_fix']),
          ('7단계 고칠 점에 배경 요청 [거절해야]',P['ch_fixbg']),('거절 뒤 정상 요청(동작)',P['ch_like2']),('7단계 동작 칸에 배경 섞기 [거절해야]',P['ch_likebg']),
          ('직접 친 글: 배경도 같이 그려줘 [거절해야]','배경에 사막도 같이 그려줘'),('같은 프롬프트 다시 붙여넣기 [안내만]',P['ch'])],
    'BG':[('첫 붙여넣기',P['bg']),('7단계 마음에 들어요(각도+날씨+자리 왼쪽)',P['bg_like1']),('7단계 인물 자리 없음',P['bg_like2']),('7단계 고칠 점',P['bg_fix']),
          ('7단계 고칠 점에 인물 요청 [거절해야]',P['bg_fixch']),('거절 뒤 정상 요청(고칠 점)',P['bg_fix']),('직접 친 글: 여우도 넣어줘 [거절해야]','장미 옆에 여우 한 마리도 넣어 줘'),
          ('같은 프롬프트 다시 붙여넣기 [안내만]',P['bg'])]}
name,model=sys.argv[1],(sys.argv[2] if len(sys.argv)>2 else None)
sid=None;out=[]
for lab,t in SC[name]:
    cmd=['claude','-p','--system-prompt',SYS_IMG,'--tools','','--output-format','json']
    if model: cmd+=['--model',model]
    if sid: cmd+=['--resume',sid]
    r=subprocess.run(cmd,input=t,capture_output=True,text=True,timeout=300)
    try: j=json.loads(r.stdout)
    except Exception: out.append((lab,'ERROR '+r.stdout[:200]+r.stderr[:200]));break
    sid=j.get('session_id');out.append((lab,j.get('result','')))
with open(f'res_{name}_{model or "default"}.txt','w',encoding='utf8') as f:
    for l,r in out: f.write(f'===== {l}\n{r}\n\n')
print('done',name,model)
