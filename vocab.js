let cards=[
{word:'Pollution',pos:'n.',zh:'污染',ex:'Air pollution is a serious problem in big cities.',img:'https://source.unsplash.com/1200x800/?pollution'},
{word:'Popular',pos:'adj.',zh:'受欢迎的',ex:'The song is very popular among teenagers.',img:'https://source.unsplash.com/1200x800/?crowd'},
{word:'Population',pos:'n.',zh:'人口',ex:'The population of the city is growing fast.',img:'https://source.unsplash.com/1200x800/?population'},
{word:'Spread',pos:'v./n.',zh:'传播；扩散',ex:'The virus spread quickly across the country.',img:'https://source.unsplash.com/1200x800/?virus'},
{word:'Strange',pos:'adj.',zh:'奇怪的',ex:'It sounds strange to me.',img:'https://source.unsplash.com/1200x800/?strange'},
{word:'Describe',pos:'v.',zh:'描述',ex:'Please describe what you saw.',img:'https://source.unsplash.com/1200x800/?writing'},
{word:'Environment',pos:'n.',zh:'环境',ex:'We must protect the environment.',img:'https://source.unsplash.com/1200x800/?environment'},
{word:'Daily',pos:'adj./adv.',zh:'每天的；日常的',ex:'Daily exercise is good for your health.',img:'https://source.unsplash.com/1200x800/?daily'},
{word:'List',pos:'n./v.',zh:'清单；列出',ex:'Make a list of your tasks.',img:'https://source.unsplash.com/1200x800/?notebook'},
{word:'Inner',pos:'adj.',zh:'内部的；内心的',ex:'She found her inner strength.',img:'https://source.unsplash.com/1200x800/?meditation'},
{word:'Infer',pos:'v.',zh:'推断',ex:'We can infer the meaning from the context.',img:'https://source.unsplash.com/1200x800/?brain'},
{word:'Regard',pos:'v.',zh:'认为；看待',ex:'He is regarded as a hero.',img:'https://source.unsplash.com/1200x800/?respect'},
{word:'Attitude',pos:'n.',zh:'态度',ex:'His attitude towards work is positive.',img:'https://source.unsplash.com/1200x800/?confidence'}
];
let index=0
let front=true
const card=document.getElementById('card')
const frontEl=document.getElementById('frontWord')||document.getElementById('cardFront')
const backEl=document.getElementById('cardBack')
const imgEl=document.getElementById('imgWord')
const posEl=document.getElementById('pos')
const zhEl=document.getElementById('zh')
const exEl=document.getElementById('ex')
const creditEl=document.getElementById('credit')
const footEl=document.getElementById('cardFoot')
const progressEl=document.getElementById('progress')
const btnPrev=document.getElementById('btnPrev')
const btnNext=document.getElementById('btnNext')
const btnRestart=document.getElementById('btnRestart')
const slider=document.getElementById('slider')
const imgCache=new Map()
const CACHE_KEY='pexels_cache'
const CACHE_TTL=86400000

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

function getApiKey(){
  try{const v=localStorage.getItem('pexels_key');if(v) return v}catch{}
  const params=new URLSearchParams(location.search)
  const k=params.get('pexels')
  if(k){try{localStorage.setItem('pexels_key',k)}catch{};return k}
  return ''
}
async function fetchImage(word){
  const key=getApiKey()
  const proxy=`/api/img?q=${encodeURIComponent(word)}`
  try{
    const r=await fetch(proxy,{cache:'no-store'})
    if(r.ok){
      const info=await r.json()
      if(info?.url) return info
    }
  }catch{}
  if(!key) return ''
  const url=`https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=5&orientation=landscape`
  const ctrl=new AbortController()
  const t=setTimeout(()=>ctrl.abort(),4000)
  const res=await fetch(url,{headers:{Authorization:key},signal:ctrl.signal})
  if(!res.ok) return ''
  const data=await res.json()
  const arr=Array.isArray(data?.photos)?data.photos:[]
  const p=arr[0]
  const landscape=p?.src?.landscape||p?.src?.large2x||p?.src?.large||p?.src?.medium||p?.src?.original||''
  const info={
    url: landscape,
    alt: p?.alt||'',
    color: p?.avg_color||'',
    page: p?.url||'',
    ph: p?.photographer||'',
    phUrl: p?.photographer_url||''
  }
  clearTimeout(t)
  return info
}
async function ensureImage(word){
  const now=Date.now()
  try{
    const raw=sessionStorage.getItem(CACHE_KEY)
    if(raw){
      const obj=JSON.parse(raw)
      const hit=obj[word]
      if(hit&&now-hit.t<CACHE_TTL){
        if(hit.url){imgEl.src=hit.url;imgEl.alt=hit.alt||'';imgEl.style.display='block';creditEl.innerHTML=hit.ph?`Photo: <a href="${hit.phUrl||'#'}" target="_blank" rel="noopener">${hit.ph}</a>`:''}
        return
      }
    }
  }catch{}
  if(imgCache.has(word)){
    const u=imgCache.get(word)
    if(u&&u.url){imgEl.src=u.url;imgEl.alt=u.alt||'';imgEl.style.display='block';creditEl.innerHTML=u.ph?`Photo: <a href="${u.phUrl||'#'}" target="_blank" rel="noopener">${u.ph}</a>`:''}
    return
  }
  let u=await fetchImage(word)
  if(!u||!u.url){
    const fallback=cards[index]?.img||`https://source.unsplash.com/1200x800/?${encodeURIComponent(word)}`
    u={url:fallback,alt:word,color:'',page:'',ph:'',phUrl:''}
  }
  imgCache.set(word,u)
  try{
    const raw=sessionStorage.getItem(CACHE_KEY)
    const obj=raw?JSON.parse(raw):{}
    obj[word]={...u,t:now}
    sessionStorage.setItem(CACHE_KEY,JSON.stringify(obj))
  }catch{}
  if(cards[index]?.word===word&&u&&u.url){imgEl.src=u.url;imgEl.alt=u.alt||'';imgEl.style.display='block';creditEl.innerHTML=u.ph?`Photo: <a href="${u.phUrl||'#'}" target="_blank" rel="noopener">${u.ph}</a>`:''}
}

function show(){
  if(!cards.length){
    frontEl.textContent='暂无单词'
    posEl.textContent=''
    zhEl.textContent=''
    exEl.textContent=''
    imgEl.style.display='none'
    progressEl.textContent='0 / 0'
    card.classList.remove('flipped')
    if(slider){slider.disabled=true;slider.max='1';slider.value='1'}
    return
  }
  const c=cards[index]
  frontEl.textContent=c.word||' '
  posEl.textContent=c.pos||''
  zhEl.textContent=c.zh||''
  exEl.textContent=c.ex||''
  creditEl.textContent=''
  imgEl.removeAttribute('src')
  imgEl.style.display='none'
  ensureImage(c.word)
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
