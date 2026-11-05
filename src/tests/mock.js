const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/site/prompt-maker.html';
const log=(...a)=>console.log(...a);
const issues=[];
const note=(who,msg)=>{issues.push(who+': '+msg);log('  ⚠',msg)};

async function scr(p){return p.$eval('body',b=>b.dataset.screen)}
async function msg(p){return p.evaluate(()=>{const m=document.querySelector('#wiz-msg');return m&&!m.hidden?document.querySelector('#wiz-msg-text').textContent:null})}
async function closeMsg(p){if(await msg(p)) await p.click('#wiz-msg-ok')}
async function overflow(p,who,where){const w=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);if(w[0]>w[1]+1)note(who,`가로 넘침 ${w[0]}>${w[1]} (${where})`)}
async function typeIn(p,sel,txt){await p.click(sel);await p.type(sel,txt)}
async function clip(p){return p.evaluate(()=>navigator.clipboard.readText())}
function checkPrompt(who,t,must){
  for(const m of must) if(!t.includes(m)) note(who,`프롬프트에 "${m}" 없음`);
  for(const bad of ['(비움)','(그림체를 고르세요)','undefined','null']) if(t.includes(bad)) note(who,`프롬프트에 "${bad}" 들어감`);
  if(!t.startsWith('먼저 확인할 것')) note(who,'프롬프트 맨 앞이 먼저 확인할 것이 아님');
}

async function student(ctx,who,vp,plan){
  const p=await ctx.newPage();await p.setViewportSize(vp);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto(URL);log(`\n== ${who} (${vp.width}x${vp.height})`);
  await plan(p);
  if(errs.length) note(who,'스크립트 오류: '+errs.join(' | '));
  await p.close();
}

(async()=>{
const b=await chromium.launch();
const book=await b.newContext({permissions:['clipboard-read','clipboard-write']}); // 크롬북 한 대 (공용)

// ---------- 학생 1: 사람 인물, 실수 많이 함 ----------
await student(book,'학생1',{width:1366,height:768},async p=>{
  await p.click('#wiz-next');log('  약속 체크 안 하고 다음:',await msg(p));await closeMsg(p);
  for(const c of await p.$$('[data-pledge]')) await c.check();
  await p.click('#wiz-next');log('  2단계:',await scr(p));
  await p.click('#tab-character');await p.click('#wiz-next');
  await p.click('#wiz-next');log('  그림체 안 고르고 다음:',await msg(p));await closeMsg(p);
  await p.click('.preset >> nth=0');await p.click('#wiz-next');
  await typeIn(p,'#ch-name','윤하');await typeIn(p,'#ch-age','열다섯 살 여자아이');
  await p.click('#wiz-next');const m=await msg(p);log('  빈 칸 두고 다음:',m&&m.slice(0,60));await closeMsg(p);
  const focused=await p.evaluate(()=>document.activeElement&&document.activeElement.id);log('  팝업 닫은 뒤 커서:',focused);
  // 붙여넣기 시도
  await p.evaluate(()=>navigator.clipboard.writeText('AI가 써 준 아주 긴 생김새 묘사입니다 어깨까지 오는 검은 생머리'));
  await p.click('#ch-look');await p.keyboard.press('Control+V');
  const pm=await p.$eval('#paste-modal',e=>!e.hidden);log('  붙여넣기 → 팝업:',pm, '칸 값:',JSON.stringify(await p.$eval('#ch-look',e=>e.value)));
  if(!pm) note('학생1','붙여넣기 팝업이 안 뜸');
  if(pm) await p.click('#paste-close');
  await typeIn(p,'#ch-kinddesc','현대 대한민국');
  await typeIn(p,'#ch-look','작고 마른 몸, 어깨까지 오는 검은 생머리, 동그란 안경');
  await typeIn(p,'#ch-outfit','남색 교복 재킷, 회색 치마, 흰 운동화');
  await typeIn(p,'#ch-person','겁이 많지만 할 말은 하는 성격');
  await typeIn(p,'#ch-pose','두 손으로 휴대폰을 꼭 쥐고 고개를 숙인 모습');
  await typeIn(p,'#ch-key','없음');
  await p.click('#wiz-next');log('  5단계:',await scr(p));await overflow(p,'학생1','5단계');
  await p.click('#seg-shot label:has-text("풀 숏")');
  await p.click('#wiz-next');log('  6단계:',await scr(p));
  const ready=await p.$eval('#copy',e=>e.classList.contains('ready')&&e.style.boxShadow!=='');
  await p.waitForTimeout(400);const glow=await p.$eval('#copy',e=>e.style.boxShadow);
  log('  복사 버튼 반짝임:',!!glow);if(!glow) note('학생1','복사 버튼이 반짝이지 않음');
  await p.click('#copy');await p.waitForTimeout(300);
  const t=await clip(p);log('  복사된 프롬프트 길이:',t.length);
  checkPrompt('학생1',t,['윤하','열다섯 살 여자아이','동그란 안경','흰 운동화','풀 숏','modern Korean webtoon','drawn entirely in','되묻거나 확인을 기다리지 말고','이 대화창에는 이미 프롬프트를']);
  log('  복사 뒤 반짝임 멈춤:',!(await p.$eval('#copy',e=>e.classList.contains('ready'))));
  await p.click('#wiz-next');log('  7단계:',await scr(p),'버튼:',await p.$eval('#wiz-next',e=>e.textContent));
  await p.click('#fu-like');await p.click('label:has(#fu-w-0)');await typeIn(p,'#fu-t-0','눈물을 참는 얼굴');
  await p.click('#fu-copy');await p.waitForTimeout(200);log('  추가 요청:',JSON.stringify(await clip(p)));
  await p.click('#fu-fix');await typeIn(p,'#fu-fix-text','안경을 더 크게');await p.click('#fu-copy');await p.waitForTimeout(200);
  log('  수정 요청:',JSON.stringify(await clip(p)));
  // 두 번째 인물
  await p.click('#wiz-next');log('  다른 인물 만들기 →',await scr(p));
  await p.click('#tab-character');await p.click('#wiz-next');await p.click('#wiz-next');
  const kept=await p.$eval('#ch-name',e=>e.value);log('  두 번째 인물 시작 시 이름 칸:',JSON.stringify(kept));
  if(kept) note('학생1','두 번째 인물을 만들 때 앞 인물 묘사가 칸에 그대로 남아 있음 (직접 "칸 비우고 다시 작성하기"를 눌러야 함)');
});

// ---------- 학생 2: 같은 크롬북을 다음 시간에 쓰는 학생 ----------
await student(book,'학생2(같은 기기)',{width:1366,height:768},async p=>{
  log('  처음 열었을 때 단계:',await scr(p));
  const nm=await p.$eval('#ch-name',e=>e.value);const made=await p.$eval('#made',e=>e.textContent.trim().slice(0,60));
  log('  앞 학생 이름 남음:',JSON.stringify(nm),'| 만든 목록:',made);
  if(nm||!made.startsWith('아직')) note('학생2','같은 기기를 쓰는 다음 학생에게 앞 학생의 묘사·그림체·만든 목록이 그대로 보임');
  await p.click('.stepper [data-go="3"]').catch(()=>{});
  if(await scr(p)==='3'){await p.click('.preset >> nth=4');log('  다른 그림체 고르면 경고 팝업:',await p.$eval('#preset-modal',e=>!e.hidden));}
});

// ---------- 학생 3: 휴대폰, 동물 ----------
const phone=await b.newContext({permissions:['clipboard-read','clipboard-write'],isMobile:true,hasTouch:true,viewport:{width:390,height:844}});
await student(phone,'학생3(휴대폰)',{width:390,height:844},async p=>{
  for(const c of await p.$$('[data-pledge]')) await c.check();
  await p.click('#wiz-next');await p.click('#tab-character');await p.click('#wiz-next');
  await p.click('.preset >> nth=2');await p.click('#wiz-next');await overflow(p,'학생3','4단계');
  await p.click('#seg-kind label:has-text("동물")');
  await typeIn(p,'#ch-name','여우');await typeIn(p,'#ch-age','다 자란 여우');await typeIn(p,'#ch-kinddesc','귀가 큰 사막여우');
  await typeIn(p,'#ch-look','작은 몸, 커다란 세모 귀');await typeIn(p,'#ch-outfit','옷 없음');
  await typeIn(p,'#ch-person','경계심이 많은 성격');await typeIn(p,'#ch-pose','풀밭에 앉아 고개를 갸웃함');await typeIn(p,'#ch-key','없음');
  await p.click('#wiz-next');await overflow(p,'학생3','5단계');await p.click('#wiz-next');await overflow(p,'학생3','6단계');
  await p.click('#copy');await p.waitForTimeout(300);const t=await clip(p);
  checkPrompt('학생3',t,['여우','귀가 큰 사막여우','soft watercolor']);
  if(t.includes('natural Korean facial features')) note('학생3','동물인데 한국인 얼굴 문장이 들어감');
  await p.click('#wiz-next');await overflow(p,'학생3','7단계');
});

// ---------- 학생 4: 배경 ----------
const pc=await b.newContext({permissions:['clipboard-read','clipboard-write']});
await student(pc,'학생4(배경)',{width:1366,height:768},async p=>{
  for(const c of await p.$$('[data-pledge]')) await c.check();
  await p.click('#wiz-next');await p.click('#tab-background');await p.click('#wiz-next');
  await p.click('.preset >> nth=3');await p.click('#wiz-next');
  await typeIn(p,'#pl-0-place','학교 옥상');await typeIn(p,'#pl-0-see','녹슨 난간, 물탱크, 빈 의자 하나');
  await typeIn(p,'#pl-0-time','해 질 무렵, 바람 부는 날');await typeIn(p,'#pl-0-mood','쓸쓸함');
  await p.click('#wiz-next');log('  5단계:',await scr(p));
  await p.click('#panel-background [data-screen="5"] label:has-text("하이 앵글")');await p.click('#panel-background [data-screen="5"] label:has-text("왼쪽")');
  const tip=await p.evaluate(()=>[...document.querySelectorAll('#panel-background [data-screen="5"] .note, #panel-background [data-screen="5"] .hint')].map(e=>e.textContent).filter(Boolean).join(' / ').slice(0,160));
  log('  각도·자리 안내:',tip);
  await p.click('#wiz-next');await p.click('#copy');await p.waitForTimeout(300);const t=await clip(p);
  checkPrompt('학생4',t,['학교 옥상','녹슨 난간','하이 앵글','인물 자리: 왼쪽','16:9','emotional anime-style background','이 대화창에는 이미 프롬프트를']);
  await p.click('#wiz-next');await p.click('#fu-like');
  const items=await p.$$eval('#fu-what label',l=>l.map(x=>x.textContent));log('  배경 추가 요청 항목:',items.join(', '));
});

log('\n==== 발견 ====');issues.forEach(i=>log('-',i));
await b.close();})();
