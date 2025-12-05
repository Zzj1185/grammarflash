let cards=[
{question:`哪个时态用于描述永恒的客观真理，或者在 when/if 引导的从句中表示将来的动作？`,answer:`一般现在时。<br> 结构： am/is/are 或 do/does。用于经常发生的动作或客观真理。在时间、条件状语从句中表示将来。`},
{question:`哪个时态的标志词包括 already, yet, just，并且常用于 for + 时间段 或 since + 时间点 的结构中？`,answer:`现在完成时。<br> 结构： have/has done。表示过去的动作对现在的影响或持续到现在。`},
{question:`哪个时态常用于 yesterday, last week 等过去时间点，但也可用于 just now？`,answer:`一般过去时。<br> 结构： was/were 或 did。表示过去某个时间里发生的动作或状态。just now 是其时间状语之一。`},
{question:`哪个时态用于表达“看！”、“听！”等情景下的动作，或在 while 引导的从句中出现？`,answer:`现在进行时。<br> 结构： am/is/are doing。表示现在或现阶段正在发生或进行的动作。now, look, listen 是其标志性时间状语或情景词。`},
{question:`在表达 “独自的” (by______)、“玩的愉快” (enjoy______)、“自学” (teach______) 时，横线处应使用哪一类代词？`,answer:`反身代词 (myself, ourselves 等)。<br> 固定搭配： by oneself, enjoy oneself, teach oneself。`},
{question:`something, everyone 这样的复合不定代词作主语时，谓语动词应使用什么形式？如果它们有形容词修饰，形容词应该放在哪里？`,answer:`谓语动词用第三人称单数 (三单)。<br> 形容词作定语时，需后置 (例如：nothing interesting)。`},
{question:`在一般疑问句和否定句中，表达“一些”或“任何”时应该优先使用 some 还是 any？`,answer:`优先使用 any。<br> some 用于肯定句，以及表示请求的疑问句。`},
{question:`被动语态 的基本结构是什么？在不同时态中，哪个部分需要变化来体现时态？`,answer:`基本结构是 be + 过去分词 (done)。<br> be 的形式变化体现时态（例如：一般将来时为 will be + done）。`},
{question:`如何判断由“泥土”、“牛奶”制成的物体，在翻译 “由...制成” 时，是用 be made of 还是 be made from？`,answer:`如果原材料看得出，用 be made of。<br> 如果原材料看不出（如发生化学变化），用 be made from。`},
{question:`翻译 “据说……” 和 “被用来做某事” 时，应使用的固定句型分别是什么？`,answer:`据说： It is said that...。<br> 被用来做某事： be used to do sth.。`},
{question:`宾语从句学习中，需要注意哪“三要素”？以及当从句内容是客观真理时，时态如何处理？`,answer:`宾语从句三要素是：连词、语序、时态。<br> 从句时态遵循“主过从从”原则，但如果从句是客观真理/规律，则时态永远使用一般现在时。`},
{question:`如果主句后接的是一个由一般疑问句转换而来的宾语从句，应该用什么连词引导？此时的语序是什么？`,answer:`连词用 if / whether。<br> 语序需要改为陈述语序。`},
{question:`关系代词只用 that 的五种情况，口诀 “特高序代双” 具体指的是什么？`,answer:`“特高序代双” 指：1. 引导特殊疑问句时；2. 先行词前有最高级、序数词或 the only, the very 等修饰时；3. 先行词是 不定代词 (something, all) 时；4. 先行词有人有物时。`},
{question:`当定语从句的先行词是物，且关系代词在从句中作宾语时，可以使用哪些连接词？`,answer:`可以用 which/that，或者直接省略。`},
{question:`区分 “主将从现” 的原则：哪些连词引导的从句需要遵循主句将来时，从句动词用一般现在时替换的原则？`,answer:`适用于时间状语从句和条件状语从句。<br> 涉及的连词： when, as soon as, until, if, unless。`},
{question:`在同一个复合句中，because (因为) 和 so (所以) 能否同时出现？`,answer:`不能同时连用。`},
{question:`如何快速判断感叹句应该用 What 开头还是用 How 开头？以及它们各自跟什么词？`,answer:`核心区别在于中心词：<br> What 引导时，后面跟名词；<br> How 引导时，后面跟形容词或副词。`},
{question:`如果感叹句中有名词，且该名词是可数名词的单数，那么这个感叹句的结构是什么？`,answer:`What + a/an + adj. + 可数名词单数 + 主语 + 谓语！`}
]
let index=0
let front=true
const card=document.getElementById('card')
const frontEl=document.getElementById('cardFront')
const backEl=document.getElementById('cardBack')
const footEl=document.getElementById('cardFoot')
const progressEl=document.getElementById('progress')
const btnPrev=document.getElementById('btnPrev')
const btnNext=document.getElementById('btnNext')
const btnRestart=document.getElementById('btnRestart')
const slider=document.getElementById('slider')

function show(){
  if(!cards.length){
    frontEl.textContent='暂无卡片'
    backEl.textContent=''
    footEl.textContent=''
    progressEl.textContent='0 / 0'
    card.classList.remove('flipped')
    if(slider){slider.disabled=true;slider.max='1';slider.value='1'}
    return
  }
  const c=cards[index]
  frontEl.textContent=c.question||' '
  backEl.textContent=c.answer||' '
  footEl.textContent=front?'查看答案':'返回题目'
  if(front) card.classList.remove('flipped')
  else card.classList.add('flipped')
  progressEl.textContent=`${index+1} / ${cards.length}`
  if(slider){slider.disabled=false;slider.max=String(cards.length);slider.value=String(index+1)}
}

function flip(){
  if(!cards.length) return
  front=!front
  show()
}

function prev(){
  if(!cards.length) return
  index=(index-1+cards.length)%cards.length
  front=true
  show()
}

function next(){
  if(!cards.length) return
  index=(index+1)%cards.length
  front=true
  show()
}

function restart(){
  if(!cards.length) return
  index=0
  front=true
  show()
}


card.addEventListener('click',flip)
btnPrev.addEventListener('click',prev)
btnNext.addEventListener('click',next)
btnRestart.addEventListener('click',restart)
slider.addEventListener('input',()=>{if(!cards.length) return; const v=Math.max(1,Math.min(Number(slider.value)||1,cards.length)); index=v-1; front=true; show()})

window.addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();flip()}
  else if(e.key==='ArrowLeft') prev()
  else if(e.key==='ArrowRight') next()
})

show()
