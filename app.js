const rules = [
  {
    id: 'CONCENTRATION_MANA',
    test: /(concentration|集中精神).*(產生|生成|增加|取得).*(魔力|mana)/i,
    type: 'ok',
    title: '✓ 合法：這個理解沒有錯',
    body: 'Concentration 的基本效果可以取得 1 個 Mana token；其強效果則可讓你免費使用另一張 Action card 的強效果。\n\n因此「使用 Concentration 取得魔力」本身不是規則錯誤。若你同時要使用另一張牌，還需要檢查該牌的類型、效果與使用時機。'
  },
  {
    id: 'CONCENTRATION_CARD_TYPE',
    test: /(concentration|集中精神).*(法術|spell|單位|unit|神器|artifact)/i,
    type: 'error',
    title: '❌ 可能不合法：牌的類型不符',
    body: 'Concentration 的強效果是針對另一張 Action card 的強效果；不能把任意 Spell、Unit 或 Artifact 當作 Action card。\n\n如果你提供具體牌名，正式裁判可以再檢查該牌的類型與卡牌原文。'
  },
  {
    id: 'UNIT_TWICE',
    test: /(部隊|單位).*(兩次|第二次|2次|再一次).*(同一回合|本回合|這回合)/i,
    type: 'error',
    title: '❌ 不合法：同一 Unit 不能重複啟動',
    body: '一般規則下，每個 Unit 每 Round 只能被啟動一次；使用後會變成 Spent，直到下一 Round Ready。\n\n如果某個效果讓 Unit Ready，則可能存在例外，因此正式裁判需要同時檢查該效果。'
  },
  {
    id: 'UNIT_DAMAGE',
    test: /(已使用|用過).*(部隊|單位).*(格擋|承受|分配).*(傷害)/i,
    type: 'warn',
    title: '⚠️ 需要檢查：啟動與承受傷害是不同概念',
    body: 'Unit 的「啟動能力」與「在傷害分配階段承受傷害」不是同一件事。已使用的 Unit 不代表它一定不能承受傷害。\n\n請提供敵人、傷害數值與 Unit 狀態才能裁判。'
  },
  {
    id: 'DIRECT_FAME',
    test: /(直接拿|直接取得|直接獲得).*(fame|聲望|名望)/i,
    type: 'warn',
    title: '⚠️ 需要檢查：可能跳過結算',
    body: '如果 Fame 是因擊敗敵人取得，必須完成相應的戰鬥與獎勵結算。\n\n請提供敵人、攻擊方式及目前戰鬥階段，才能確認是否真的漏掉規則步驟。'
  }
];

function check(text){
  const value = text.trim();
  if(!value) return {type:'warn',title:'⚠️ 請輸入行動',body:'請描述完整行動，例如：「我使用 Concentration 取得一個紅色 Mana token，然後使用另一張 Action card。」'};
  for(const rule of rules){
    if(rule.test.test(value)) return rule;
  }
  return {type:'ok',title:'✓ 未發現目前資料庫中的已知錯誤',body:'目前規則資料庫沒有找到與這段敘述衝突的規則。\n\n注意：這不是「一定合法」的保證。Phase 1 仍是原型，正式版需要完整卡牌、角色、Unit、敵人、Phase 與 FAQ 資料才能進行嚴格裁判。'};
}

const action=document.getElementById('action');
const result=document.getElementById('result');
function escapeHtml(s){
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function render(){
  const r=check(action.value);
  result.className=`result ${r.type}`;
  result.innerHTML=`<div class="verdict">${escapeHtml(r.title)}</div><div>${escapeHtml(r.body).replaceAll('\n','<br>')}</div>`;
}
document.getElementById('checkBtn').addEventListener('click',render);
document.getElementById('clearBtn').addEventListener('click',()=>{action.value='';result.className='result empty';result.textContent='等待你的行動……';action.focus();});
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>{action.value=btn.dataset.example;render();}));
action.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')render();});
