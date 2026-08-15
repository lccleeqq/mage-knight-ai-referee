const rules = [
  { test: /(concentration|集中精神).*(產生|生成|增加).*(魔力|mana)/i, type: 'error', title: '❌ 不合法', body: '目前示範規則資料將此行動判定為錯誤：Concentration（集中精神）不能直接被當成產生魔力的效果。\n\n正確做法：依卡牌原文處理其強化下一張行動牌的效果。' },
  { test: /(部隊|單位).*(兩次|第二次|2次|再一次)/i, type: 'error', title: '❌ 不合法', body: '目前示範規則資料判定：同一單位在同一回合不可重複啟動。\n\n請確認該單位本回合是否已經使用過。' },
  { test: /(直接拿|直接取得|直接獲得).*(fame|聲望|名望)/i, type: 'warn', title: '⚠️ 需要檢查', body: '這段描述可能跳過戰鬥結算。擊敗敵人後，仍應依完整戰鬥流程處理獎勵。\n\n請提供敵人、攻擊方式與目前戰鬥階段，才能進一步判定。' },
  { test: /(不能|不可以).*(格擋|block).*(傷害|攻擊)/i, type: 'warn', title: '⚠️ 需要檢查', body: '目前資訊不足以判定。請提供使用的卡牌、敵人能力與戰鬥階段。' }
];

function check(text){
  const value=text.trim();
  if(!value) return {type:'warn',title:'⚠️ 請輸入行動',body:'請描述你準備執行的完整行動，例如：「我使用 Concentration 產生 2 點魔力。」'};
  for(const rule of rules){ if(rule.test.test(value)) return rule; }
  return {type:'ok',title:'✓ 目前未發現已知錯誤',body:'這個 Phase 1 原型沒有找到符合目前示範規則的違規情況。\n\n注意：這不是「一定合法」的保證；正式版需要完整規則資料庫、遊戲狀態與卡牌原文才能進行嚴格裁判。'};
}

const action=document.getElementById('action');
const result=document.getElementById('result');
function render(){
  const r=check(action.value);
  result.className=`result ${r.type}`;
  result.innerHTML=`<div class="verdict">${r.title}</div><div>${r.body.replaceAll('\n','<br>')}</div>`;
}
document.getElementById('checkBtn').addEventListener('click',render);
document.getElementById('clearBtn').addEventListener('click',()=>{action.value='';result.className='result empty';result.textContent='等待你的行動……';action.focus();});
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{action.value=btn.dataset.example;render();}));
action.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')render();});
