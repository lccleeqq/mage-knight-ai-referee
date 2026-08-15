// Rules Engine v2: deterministic normalization layer.
// This layer does not decide strategy and does not claim legality by itself.
const ACTION_PATTERNS=[
  {action:'use_unit',patterns:[/(?:使用|啟動|activate|use).*(?:unit|部隊|單位)/i,/(?:unit|部隊|單位).*(?:使用|啟動)/i]},
  {action:'concentration_mana',patterns:[/(?:concentration|集中精神).*(?:mana|魔力)/i]},
  {action:'block',patterns:[/(?:格擋|block).*(?:攻擊|傷害)/i]},
  {action:'attack',patterns:[/(?:攻擊|attack).*(?:敵人|enemy)/i]},
  {action:'move',patterns:[/(?:移動|move).*(?:森林|平原|沙漠|沼澤|forest|plains|desert|swamp)/i]}
];
function normalizeAction(text){
  const value=String(text||'').trim();
  const result={raw:value,action:'unknown',entities:{},signals:[],confidence:0};
  if(!value)return result;
  for(const item of ACTION_PATTERNS){if(item.patterns.some(p=>p.test(value))){result.action=item.action;result.confidence=0.9;break;}}
  if(/(?:spent|已使用|用過|已用過)/i.test(value))result.entities.unitState='spent';
  else if(/(?:ready|就緒|可用)/i.test(value))result.entities.unitState='ready';
  if(/(?:block|格擋)/i.test(value))result.entities.phase='Block';
  if(/(?:attack|攻擊)/i.test(value)&&result.entities.phase!=='Block')result.entities.phase='Attack';
  if(/(?:night|晚上|夜間)/i.test(value))result.entities.time='Night';
  if(/(?:day|白天)/i.test(value))result.entities.time='Day';
  if(/(?:forest|森林)/i.test(value))result.entities.terrain='forest';
  result.signals=[...new Set([
    /(?:再|再次|第二次|兩次|2次|又)/i.test(value)?'repeat_use':null,
    /(?:一定|確定|合法)/i.test(value)?'legality_claim':null,
    /(?:可以嗎|能不能|是否合法)/i.test(value)?'question':null
  ].filter(Boolean))];
  return result;
}
function buildGameState(overrides={}){return{round:overrides.round??null,time:overrides.time??'unknown',phase:overrides.phase??'unknown',unitState:overrides.unitState??'unknown',terrain:overrides.terrain??'unknown',action:overrides.action??'unknown'}}
if(typeof module!=='undefined')module.exports={normalizeAction,buildGameState};
