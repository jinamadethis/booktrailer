const {chromium}=require('playwright');const fs=require('fs');
const URL='file://'+process.cwd()+'/site/prompt-maker.html';
const clip=p=>p.evaluate(()=>navigator.clipboard.readText());
async function typeIn(p,sel,t){await p.click(sel);await p.fill(sel,'');await p.type(sel,t)}
async function fuLike(p,boxes,fill){await p.click('#fu-like');
  for(const i of [0,1,2]){const c=await p.$eval('#fu-w-'+i,e=>e.checked);if(c!==boxes.includes(i))await p.click('label:has(#fu-w-'+i+')');}
  await fill(p);await p.click('#fu-copy');await p.waitForTimeout(250);return clip(p)}
async function fuFix(p,t){await p.click('#fu-fix');await p.fill('#fu-fix-text','');await p.type('#fu-fix-text',t);await p.click('#fu-copy');await p.waitForTimeout(250);return clip(p)}
(async()=>{const b=await chromium.launch();const out={};
 let ctx=await b.newContext({permissions:['clipboard-read','clipboard-write']});let p=await ctx.newPage();await p.goto(URL);
 for(const c of await p.$$('[data-pledge]')) await c.check();
 await p.click('#wiz-next');await p.click('#tab-character');await p.click('#wiz-next');await p.click('.preset >> nth=2');await p.click('#wiz-next');
 for(const [k,v] of Object.entries({kinddesc:'사막에 불시착한 비행사가 만난 작은 별의 세계',name:'어린 왕자',age:'열 살쯤 된 남자아이',look:'작고 마른 몸, 곱슬곱슬한 금빛 머리, 동그란 얼굴',outfit:'발목까지 오는 초록 코트, 긴 노란 목도리, 작은 장화',person:'궁금한 것은 끝까지 묻는 고집 센 성격',pose:'두 발을 모으고 고개를 갸웃한 채 서 있는 모습',key:'없음'})) await typeIn(p,'#ch-'+k,v);
 await p.click('#wiz-next');await p.click('#wiz-next');await p.click('#copy');await p.waitForTimeout(300);out.ch=await clip(p);
 await p.click('#wiz-next');
 out.ch_like1=await fuLike(p,[0,2],async p=>{await typeIn(p,'#fu-t-0','눈물을 참으며 입술을 꼭 다문 얼굴');await p.click('#fu-fields label:has-text("풀 숏")');await p.click('#fu-fields label:has-text("옆모습")');await p.click('#fu-fields label:has-text("로 앵글")')});
 out.ch_like2=await fuLike(p,[1],async p=>{await typeIn(p,'#fu-t-1','무릎을 꿇고 장미에 물을 주는 자세')});
 out.ch_fix=await fuFix(p,'목도리를 더 길게\n머리 색을 더 밝은 금빛으로');
 out.ch_fixbg=await fuFix(p,'뒤에 사막 배경을 그려 줘');
 out.ch_likebg=await fuLike(p,[1],async p=>{await typeIn(p,'#fu-t-1','작은 별 위에 서서 노을을 보는 모습, 배경에 노을 진 하늘도 그려 줘')});
 await ctx.close();
 ctx=await b.newContext({permissions:['clipboard-read','clipboard-write']});p=await ctx.newPage();await p.goto(URL);
 for(const c of await p.$$('[data-pledge]')) await c.check();
 await p.click('#wiz-next');await p.click('#tab-background');await p.click('#wiz-next');await p.click('.preset >> nth=3');await p.click('#wiz-next');
 for(const [k,v] of Object.entries({place:'어린 왕자의 작은 별',see:'작은 화산 세 개, 유리 덮개 안의 장미 한 송이, 바오바브나무 싹',time:'해 질 무렵, 맑은 날',mood:'고요하고 쓸쓸함'})) await typeIn(p,'#pl-0-'+k,v);
 await p.click('#wiz-next');await p.click('#panel-background [data-screen="5"] label:has-text("오른쪽")');await p.click('#wiz-next');await p.click('#copy');await p.waitForTimeout(300);out.bg=await clip(p);
 await p.click('#wiz-next');
 out.bg_like1=await fuLike(p,[0,1,2],async p=>{await p.click('#fu-fields fieldset:has(legend:has-text("카메라 각도")) label:has-text("하이 앵글")');await typeIn(p,'#fu-t-1','비 오는 밤');await p.click('#fu-fields fieldset:has(legend:has-text("인물 자리")) label:has-text("왼쪽")')});
 out.bg_like2=await fuLike(p,[2],async p=>{await p.click('#fu-fields fieldset:has(legend:has-text("인물 자리")) label:has-text("없음")')});
 out.bg_fix=await fuFix(p,'하늘을 더 어둡게\n화산 하나를 더 작게');
 out.bg_fixch=await fuFix(p,'오른쪽 빈자리에 어린 왕자를 그려 넣어 줘');
 fs.writeFileSync('prompts.json',JSON.stringify(out,null,1));
 for(const [k,v] of Object.entries(out)) if(!k.match(/^(ch|bg)$/)) console.log('---',k,'\n'+v);
 console.log('ch ver ok',out.ch.includes('편집 앱에서 인물과 합성'),'bg',out.bg.includes('편집 앱에서 배경과 합성'));
 await b.close()})();
