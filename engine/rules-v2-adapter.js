// Adapter: v2 normalizer + structured referee. Unknown actions remain insufficient, never legal.
function normalizeActionV2(text){
  const value=String(text||'').trim();
  const out={raw:value,action:'unknown',entities:{},signals:[],confidence:0};
  if(!value)return out;
  const has=(re)=>re.test(value);
  if(has(/(?:使用|啟動|activate|use)[\s\S]*(?:unit|部隊|單位)|(?:unit|部隊|單位)[\s\S]*(?:使用|啟動)/i)){out.action='use_unit';out.confidence=.9;}
  else if(has(/(?:concentration|集中精神)[\s\S]*(?:mana|魔力)/i)){out.action='concentration_mana';out.confidence=.95;}
  else if(has(/(?:格擋|block)[\s\S]*(?:攻擊|傷害)/i)){out.action='block';out.confidence=.9;}
  else if(has(/(?:攻擊|attack)[\s\S]*(?:敵人|enemy)|(?:攻擊|attack)[\s\S]*$/i)){out.action='attack';out.confidence=.8;}
  else if(has(/(?:移動|move)(?:到|至|往|進入|into|to)?[\s\S]*(?:森林|平原|沙漠|沼澤|forest|plains|desert|swamp)/i)){out.action='move';out.confidence=.85;}
  if(has(/(?:spent|已使用|用過|已用過)/i))out.entities.unitState='spent';
  else if(has(/(?:ready|就緒|可用)/i))out.entities.unitState='ready';
  if(has(/(?:night|晚上|夜間)/i))out.entities.time='Night';
  else if(has(/(?:day|白天)/i))out.entities.time='Day';
  if(has(/(?:forest|森林)/i))out.entities.terrain='forest';
  if(has(/(?:再|再次|第二次|兩次|2次|又)/i))out.signals.push('repeat_use');
  if(has(/(?:可以嗎|能不能|是否合法)/i))out.signals.push('question');
  if(has(/(?:一定|確定|合法)/i))out.signals.push('legality_claim');
  if(out.action==='block')out.entities.phase=has(/(?:attack|攻擊)/i)?'Attack':'unknown';
  else if(out.action==='attack')out.entities.phase='Attack';
  return out;
}
function evaluateStructuredV2(text,uiState={}){
  const n=normalizeActionV2(text);
  const state={...uiState,...n.entities};
  if(n.action==='use_unit'&&n.signals.includes('repeat_use')){
    if(state.unitState==='spent')return{type:'error',title:'❌ 違規：Unit 已經是 Spent',body:'此行動被標準化為「再次使用 Unit」，而目前狀態為 Spent。除非有明確 Ready 效果，否則不能再次使用。',ruleId:'UNIT_SPENT_REPEAT',normalized:n};
    return{type:'insufficient',title:'⚠️ 資訊不足：需要 Unit 狀態',body:'已辨識為再次使用 Unit，但尚缺 Ready/Spent 狀態，不能直接判定合法或違規。',ruleId:'UNIT_STATE_REQUIRED',normalized:n};
  }
  if(n.action==='concentration_mana')return{type:'ok',title:'✓ 未發現違規',body:'已辨識為 Concentration 取得 Mana；此描述本身不足以構成違規。',ruleId:'CONCENTRATION_MANA',normalized:n};
  if(n.action==='block'){
    if(uiState.phase==='Attack')return{type:'error',title:'❌ 可能的階段錯誤',body:'目前遊戲狀態為 Attack，Block 的時機需要進一步確認。',ruleId:'BLOCK_PHASE',normalized:n};
    if(uiState.phase==='Block')return{type:'ok',title:'✓ 階段符合',body:'目前遊戲狀態為 Block；仍需檢查具體效果與攻擊數值。',ruleId:'BLOCK_PHASE_VALID',normalized:n};
    return{type:'insufficient',title:'⚠️ 資訊不足：需要戰鬥階段',body:'已辨識為 Block，但目前沒有可靠的戰鬥階段資料。',ruleId:'BLOCK_PHASE_REQUIRED',normalized:n};
  }
  if(n.action==='attack')return{type:'insufficient',title:'⚠️ 資訊不足：需要完整戰鬥狀態',body:'已辨識為 Attack，但尚缺敵人、攻擊來源、攻擊值、相關效果與戰鬥階段，不能直接判定合法或違規。',ruleId:'ATTACK_STATE_REQUIRED',normalized:n};
  if(n.action==='move')return{type:'insufficient',title:'⚠️ 資訊不足：需要移動狀態',body:'已辨識為 Movement，但尚缺角色移動力、目前位置、目的地地形成本與相關效果，不能直接判定合法或違規。',ruleId:'MOVEMENT_STATE_REQUIRED',normalized:n};
  return{type:'insufficient',title:'⚠️ 資訊不足：無法完成規則判定',body:'目前無法將行動可靠地對應到可判定的規則。請補充行動、目標與遊戲狀態。',ruleId:'UNKNOWN_ACTION',normalized:n};
}
if(typeof module!=='undefined')module.exports={normalizeActionV2,evaluateStructuredV2};
