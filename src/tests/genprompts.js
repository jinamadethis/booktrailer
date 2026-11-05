const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/site/prompt-maker.html';
async function fillCh(p,o,preset){
  for(const c of await p.$$('[data-pledge]')) await c.check();
  await p.click('#wiz-next');await p.click('#tab-character');await p.click('#wiz-next');
  await p.click('.preset >> nth='+preset);await p.click('#wiz-next');
  for(const [k,v] of Object.entries(o)){await p.click('#ch-'+k);await p.type('#ch-'+k,v)}
  await p.click('#wiz-next');await p.click('#wiz-next');
  return p.evaluate(()=>document.querySelector('#slip').textContent);
}
(async()=>{const b=await chromium.launch();const fs=require('fs');
let ctx=await b.newContext();let p=await ctx.newPage();await p.goto(URL);
fs.writeFileSync('p_ch1.txt',await fillCh(p,{kinddesc:'현대 대한민국',name:'윤하',age:'열다섯 살 여자아이',look:'작고 마른 몸, 어깨까지 오는 검은 생머리, 동그란 안경',outfit:'남색 교복 재킷, 회색 치마, 흰 운동화',person:'겁이 많지만 할 말은 하는 성격',pose:'두 손으로 휴대폰을 꼭 쥐고 고개를 숙인 모습',key:'없음'},0));
await ctx.close();ctx=await b.newContext();p=await ctx.newPage();await p.goto(URL);
fs.writeFileSync('p_ch2.txt',await fillCh(p,{kinddesc:'현대 대한민국',name:'도윤',age:'열여섯 살 남자아이',look:'키가 크고 마른 몸, 짧은 갈색 머리',outfit:'검은 후드티, 청바지, 낡은 운동화',person:'무뚝뚝하지만 다정한 성격',pose:'주머니에 손을 넣고 비스듬히 서 있음',key:'이어폰'},0));
await ctx.close();ctx=await b.newContext();p=await ctx.newPage();await p.goto(URL);
for(const c of await p.$$('[data-pledge]')) await c.check();
await p.click('#wiz-next');await p.click('#tab-background');await p.click('#wiz-next');await p.click('.preset >> nth=3');await p.click('#wiz-next');
for(const [k,v] of Object.entries({place:'학교 옥상',see:'녹슨 난간, 물탱크, 빈 의자 하나',time:'해 질 무렵, 바람 부는 날',mood:'쓸쓸함'})){await p.click('#pl-0-'+k);await p.type('#pl-0-'+k,v)}
await p.click('#wiz-next');await p.click('#panel-background [data-screen="5"] label:has-text("왼쪽")');await p.click('#wiz-next');
fs.writeFileSync('p_bg1.txt',await p.evaluate(()=>document.querySelector('#slip').textContent));
await b.close();console.log('ok')})();
