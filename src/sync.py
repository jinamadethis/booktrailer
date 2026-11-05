# build/prompt-maker.html(클로드 게시본과 같은 파일)로 ../ai/index.html을 바꾸되,
# 지금 ai/index.html의 <div class="wrap"> 바로 아래 '처음 화면' 링크는 그대로 남김.
import os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
old=open('../ai/index.html',encoding='utf8').read()
m=re.search(r'<style>\.home-link\{.*?</a>\n?',old,re.S)
assert m, "ai/index.html에서 '처음 화면' 링크를 찾지 못함"
home=m.group(0)
new=open('build/prompt-maker.html',encoding='utf8').read()
i=new.find('<title>'); new=new[i:] if i>0 else new
head=old[:old.find('<title>')]
k=new.find('<div class="wrap">\n')
assert k>=0, '<div class="wrap"> 없음'
k+=len('<div class="wrap">\n')
new=new[:k]+home+new[k:]
new=re.sub(r'\s*</body>\s*</html>\s*$','',new)
open('../ai/index.html','w',encoding='utf8').write(head+new+'\n\n</body>\n</html>\n')
print('ai/index.html 갱신')
