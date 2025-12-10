let cards=[
{word:'Pollution',pos:'n.',zh:'污染',ex:'Air pollution is a serious problem in big cities.'},
{word:'Popular',pos:'adj.',zh:'受欢迎的',ex:'The song is very popular among teenagers.'},
{word:'Population',pos:'n.',zh:'人口',ex:'The population of the city is growing fast.'},
{word:'Spread',pos:'v./n.',zh:'传播；扩散',ex:'The virus spread quickly across the country.'},
{word:'Strange',pos:'adj.',zh:'奇怪的',ex:'It sounds strange to me.'},
{word:'Describe',pos:'v.',zh:'描述',ex:'Please describe what you saw.'},
{word:'Environment',pos:'n.',zh:'环境',ex:'We must protect the environment.'},
{word:'Daily',pos:'adj./adv.',zh:'每天的；日常的',ex:'Daily exercise is good for your health.'},
{word:'List',pos:'n./v.',zh:'清单；列出',ex:'Make a list of your tasks.'},
{word:'Inner',pos:'adj.',zh:'内部的；内心的',ex:'She found her inner strength.'},
{word:'Infer',pos:'v.',zh:'推断',ex:'We can infer the meaning from the context.'},
{word:'Regard',pos:'v.',zh:'认为；看待',ex:'He is regarded as a hero.'},
{word:'Attitude',pos:'n.',zh:'态度',ex:'His attitude towards work is positive.'}
];
let index=0
let front=true
const card=document.getElementById('card')
const frontEl=document.getElementById('frontWord')||document.getElementById('cardFront')
const backEl=document.getElementById('cardBack')
const imgEl=document.getElementById('imgWord')
const phoneticEl=document.getElementById('phonetic')
const posEl=document.getElementById('pos')
const zhEl=document.getElementById('zh')
const exEl=document.getElementById('ex')
const creditEl=document.getElementById('credit')
const audioEl=document.getElementById('pronAudio')
const footEl=document.getElementById('cardFoot')
const progressEl=document.getElementById('progress')
const btnPrev=document.getElementById('btnPrev')
const btnNext=document.getElementById('btnNext')
const btnRestart=document.getElementById('btnRestart')
const slider=document.getElementById('slider')
const DICT_CACHE_KEY='dict_cache'
const DICT_TTL=86400000
const dictCache=new Map()

function parseCSV(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim().length)
  const rows=[]
  for(const line of lines){
    const out=[]
    let cur=''
    let inQ=false
    for(let i=0;i<line.length;i++){
      const ch=line[i]
      if(ch==='"'){
        if(inQ&&line[i+1]==='"'){cur+='"';i++}
        else inQ=!inQ
      }else if(ch===','&&!inQ){out.push(cur);cur=''}
      else cur+=ch
    }
    out.push(cur)
    rows.push(out)
  }
  const headers=rows[0].map(s=>String(s).trim().toLowerCase())
  const idx=(name)=>{const i=headers.indexOf(name);return i>=0?i:-1}
  const w=idx('word'),p=idx('pos'),z=idx('zh'),e=idx('ex')
  const start=headers.length?1:0
  return rows.slice(start).map(r=>({
    word:w>=0?r[w]:r[0],
    pos:p>=0?r[p]:r[1],
    zh:z>=0?r[z]:r[2],
    ex:e>=0?r[e]:r[3]
  }))
}

async function tryLoad(){
  try{
    let res=await fetch('capillary.csv',{cache:'no-store'})
    if(!res.ok) res=await fetch('vocab.csv',{cache:'no-store'})
    if(res.ok){
      const txt=await res.text()
      const data=parseCSV(txt).filter(x=>x.word)
      if(data.length) cards=data
    }
  }catch{}
}

async function fetchDict(word){
  const api=`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  const ctrl=new AbortController()
  const t=setTimeout(()=>ctrl.abort(),4000)
  try{
    const r=await fetch(api,{cache:'no-store',signal:ctrl.signal})
    if(!r.ok) return null
    const data=await r.json()
    const entry=Array.isArray(data)?data[0]:null
    if(!entry) return null
    const phonetic=entry.phonetic||((Array.isArray(entry.phonetics)&&entry.phonetics.find(p=>p.text))?.text||'')
    const audio=((Array.isArray(entry.phonetics)&&entry.phonetics.find(p=>p.audio))?.audio||'')
    const meaning=(Array.isArray(entry.meanings)&&entry.meanings[0])||null
    const pos=meaning?.partOfSpeech||''
    const defs=Array.isArray(meaning?.definitions)?meaning.definitions:[]
    const example=(defs.find(d=>d.example)?.example)||defs[0]?.example||''
    return { phonetic, audio, pos, example }
  }catch{
    return null
  }finally{
    clearTimeout(t)
  }
}

function applyDict(d){
  const cur=cards[index]
  if(!cur) return
  phoneticEl.textContent=d?.phonetic||''
  if(d?.pos) posEl.textContent=d.pos
  if(d?.example) exEl.textContent=d.example
  if(d?.audio){
    audioEl.src=d.audio
    audioEl.style.display='block'
    audioEl.setAttribute('controls','controls')
  }else{
    audioEl.removeAttribute('src')
    audioEl.style.display='none'
    audioEl.removeAttribute('controls')
  }
}

async function ensureDict(word){
  const now=Date.now()
  try{
    const raw=sessionStorage.getItem(DICT_CACHE_KEY)
    if(raw){
      const obj=JSON.parse(raw)
      const hit=obj[word]
      if(hit&&now-hit.t<DICT_TTL){
        applyDict(hit.data)
        return
      }
    }
  }catch{}
  if(dictCache.has(word)){
    const d=dictCache.get(word)
    applyDict(d)
    return
  }
  const d=await fetchDict(word)
  if(!d){applyDict({})
    try{
      const raw=sessionStorage.getItem(DICT_CACHE_KEY)
      const obj=raw?JSON.parse(raw):{}
      obj[word]={data:{},t:now}
      sessionStorage.setItem(DICT_CACHE_KEY,JSON.stringify(obj))
    }catch{}
    return
  }
  dictCache.set(word,d)
  try{
    const raw=sessionStorage.getItem(DICT_CACHE_KEY)
    const obj=raw?JSON.parse(raw):{}
    obj[word]={data:d,t:now}
    sessionStorage.setItem(DICT_CACHE_KEY,JSON.stringify(obj))
  }catch{}
  if(cards[index]?.word===word) applyDict(d)
}

function show(){
  if(!cards.length){
    frontEl.textContent='暂无单词'
    phoneticEl.textContent=''
    posEl.textContent=''
    zhEl.textContent=''
    exEl.textContent=''
    imgEl.style.display='none'
    audioEl.removeAttribute('src')
    audioEl.style.display='none'
    progressEl.textContent='0 / 0'
    card.classList.remove('flipped')
    if(slider){slider.disabled=true;slider.max='1';slider.value='1'}
    return
  }
  const c=cards[index]
  frontEl.textContent=c.word||' '
  phoneticEl.textContent=''
  posEl.textContent=c.pos||''
  zhEl.textContent=c.zh||''
  exEl.textContent=c.ex||''
  creditEl.textContent=''
  imgEl.removeAttribute('src')
  imgEl.style.display='none'
  audioEl.removeAttribute('src')
  audioEl.style.display='none'
  ensureDict(c.word)
  footEl.textContent=front?'查看释义':'返回单词'
  if(front) card.classList.remove('flipped')
  else card.classList.add('flipped')
  progressEl.textContent=`${index+1} / ${cards.length}`
  if(slider){slider.disabled=false;slider.max=String(cards.length);slider.value=String(index+1)}
}

function flip(){if(!cards.length)return;front=!front;show()}
function prev(){if(!cards.length)return;index=(index-1+cards.length)%cards.length;front=true;show()}
function next(){if(!cards.length)return;index=(index+1)%cards.length;front=true;show()}
function restart(){if(!cards.length)return;index=0;front=true;show()}

card.addEventListener('click',flip)
btnPrev.addEventListener('click',prev)
btnNext.addEventListener('click',next)
btnRestart.addEventListener('click',restart)
slider.addEventListener('input',()=>{if(!cards.length)return;const v=Math.max(1,Math.min(Number(slider.value)||1,cards.length));index=v-1;front=true;show()})

window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();flip()}else if(e.key==='ArrowLeft')prev();else if(e.key==='ArrowRight')next()})

(async function(){await tryLoad();show()})()
