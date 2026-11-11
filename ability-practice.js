(()=>{'use strict';
const KEY='skill-hunter-practice-v1';const names=['医学・健康','動物ケア','法律・制度','金融・経済','科学・技術','観察・分析','判断・対応','情報収集','交渉・対話','創造・開発','生活・実務','身体・運動'];
const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!==undefined)e.textContent=txt;return e};const id=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
let data;try{data=JSON.parse(localStorage.getItem(KEY))}catch{}if(!data||!Array.isArray(data.abilities)||!Array.isArray(data.logs))data={abilities:names.map(n=>({id:id(),name:n,ap:0,last:0})),logs:[],associations:{}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){alert('実践ノートの保存に失敗。バックアップを保存してください。')}}
const overlay=el('section','ap-screen');overlay.id='apScreen';document.body.append(overlay);
const style=el('style');style.textContent=`.ap-screen{position:fixed;inset:0;z-index:1000;background:radial-gradient(ellipse at top,#123451,#050e1d 65%);color:#dff4ff;overflow:auto;padding:calc(env(safe-area-inset-top) + 22px) 16px calc(env(safe-area-inset-bottom) + 24px);font-family:system-ui,sans-serif}.ap-screen[hidden]{display:none!important}.ap-inner{max-width:680px;margin:auto;border:1px solid #328cb6;border-radius:20px;padding:19px;background:#081b2ceb;box-shadow:0 0 28px #117cbb4c}.ap-top{font-size:12px;letter-spacing:2px;color:#75d4ff}.ap-title{text-align:center;font-size:42px;font-weight:800;margin:25px 0 4px;text-shadow:0 0 18px #42bfff}.ap-sub{text-align:center;color:#89b6ce;margin-bottom:26px}.ap-row{padding:9px 0}.ap-flex{display:flex;justify-content:space-between;gap:8px;align-items:center}.ap-track{height:7px;background:#163a54;border-radius:9px;margin-top:8px;overflow:hidden}.ap-fill{height:100%;background:#55bafa}.ap-screen button,.ap-screen input,.ap-screen select,.ap-screen textarea{font:inherit}.ap-screen button{color:#e4f7ff;background:#17476a;border:1px solid #3983ad;border-radius:10px;padding:11px;cursor:pointer}.ap-screen button:disabled{opacity:.45}.ap-screen input,.ap-screen select,.ap-screen textarea{width:100%;box-sizing:border-box;color:#091522;background:#f4fbff;border-radius:8px;border:1px solid #92c7e5;padding:10px;margin:4px 0 12px}.ap-screen textarea{min-height:80px}.ap-screen label{display:block;font-size:13px;color:#b1d9ef;margin-top:9px}.ap-actions{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}.ap-actions button{flex:1}.ap-main{width:100%;background:#146894!important;font-weight:bold}.ap-log{background:#102d46;border:1px solid #326181;border-radius:12px;padding:13px;margin:10px 0}.ap-muted{color:#94bad0;font-size:12px}.ap-screen h3{margin:20px 0 10px;color:#bdeeff}#practiceOpen{background:#255877!important;color:#fff!important}#readPractice{background:#255877!important;color:#fff!important}.ap-screen .ap-check{display:flex;align-items:center;gap:9px;padding:7px 0}.ap-screen .ap-check input{width:auto;margin:0}`;document.head.append(style);
let page='status',editId=null;
function shell(title){overlay.replaceChildren();const b=el('div','ap-inner');overlay.append(b);const top=el('div','ap-flex');top.append(el('span','ap-top','SYSTEM / '+title));let close=el('button','', '閉じる ×');close.onclick=()=>{overlay.hidden=true};top.append(close);b.append(top);return b}
function btn(parent,text,cb,cls=''){let b=el('button',cls,text);b.type='button';b.onclick=cb;parent.append(b);return b}
function field(parent,label,value='',type='text'){let l=el('label','',label);parent.append(l);let inp=el(type==='textarea'?'textarea':'input');if(type!=='textarea')inp.type=type;inp.value=value;parent.append(inp);return inp}
function list(){page='status';overlay.hidden=false;let b=shell('ABILITY STATUS');const sorted=[...data.abilities].sort((a,c)=>c.ap-a.ap||c.last-a.last);let total=sorted.reduce((s,a)=>s+a.ap,0);b.append(el('div','ap-title','LEVEL '+String(1+Math.floor(total/10)).padStart(2,'0')),el('div','ap-sub','TOTAL AP '+total));let max=Math.max(1,...sorted.map(a=>a.ap));sorted.forEach((a,i)=>{let r=el('div','ap-row');r.append(el('div','ap-flex'));r.firstChild.append(el('span','',`#${i+1} ${a.name}`),el('span','',`${a.ap} AP · Lv.${1+Math.floor(a.ap/10)}`));let track=el('div','ap-track');let fill=el('div','ap-fill');fill.style.width=(a.ap/max*100)+'%';track.append(fill);r.append(track);b.append(r)});let actions=el('div','ap-actions');b.append(actions);btn(actions,'⚔️ 魔導書へ',()=>{overlay.hidden=true;document.getElementById('hunter').classList.remove('hidden');document.getElementById('hunterGrimoire').classList.add('hide');document.getElementById('hunterSplash').classList.remove('hide')},'ap-main');btn(actions,'📓 実践ノート',logs);btn(actions,'⚙️ アビリティ設定',settings);btn(actions,'⬇ バックアップ',backup)}
function mapList(){try{return db.maps||[]}catch{return []}}
function related(m){if(!m)return data.abilities;const ids=Array.isArray(data.associations?.[m.id])?data.associations[m.id]:[];return data.abilities.filter(a=>ids.includes(a.id))}

function allocationsOf(l){
 if(Array.isArray(l.allocations))return l.allocations.filter(x=>typeof x==='string');
 return l.awarded&&l.abilityId?[l.abilityId]:[];
}
function applyDelta(prev,next){
 const delta=new Map();prev.forEach(x=>delta.set(x,(delta.get(x)||0)-1));next.forEach(x=>delta.set(x,(delta.get(x)||0)+1));
 for(let [key,n] of delta){const a=data.abilities.find(a=>a.id===key);if(a){a.ap=Math.max(0,(Number(a.ap)||0)+n);if(n>0)a.last=Date.now()}}
}
function logs(){page='logs';overlay.hidden=false;let b=shell('PRACTICE LOG');let a=el('div','ap-actions');b.append(a);btn(a,'＋ 実践記録',()=>editor());btn(a,'← ステータス',list);data.logs.forEach(l=>{let d=el('div','ap-log');const earned=allocationsOf(l).length;d.append(el('strong','',l.title),el('div','ap-muted',l.date+(earned?' · +'+earned+' AP':'')),el('div','',(l.tags||[]).map(x=>'#'+x).join(' ')));let ac=el('div','ap-actions');btn(ac,'開く・編集',()=>editor(l));btn(ac,'削除',()=>{if(!confirm('記録と獲得APを削除しますか？'))return;applyDelta(allocationsOf(l),[]);data.logs=data.logs.filter(x=>x.id!==l.id);save();logs()});d.append(ac);b.append(d)})}
function editor(existing={},initialMap=null,initialTitle='',mastery=null){
 if(!mastery&&existing.source==='learning'&&existing.nodeId){const found=mapList().find(m=>m.id===existing.mapId);if(found){initialMap=found;mastery={nodeId:existing.nodeId};}}
 page='editor';overlay.hidden=false;let b=shell('PRACTICE LOG');b.append(el('h3','',mastery?'習得完了・APの記録':(existing.id?'実践記録の編集':'新しい実践記録')));
 let title=field(b,'題名',existing.title||initialTitle);
 let date=field(b,'日付',existing.date||new Date().toISOString().slice(0,10),'date');
 let body=field(b,'実際に起こったこと・対応',existing.body||'','textarea');
 let learned=field(b,'今回習得したこと（複数記入できます）',existing.learned||'','textarea');
 let tags=field(b,'ハッシュタグ（空白で区切る）',(existing.tags||[]).map(x=>'#'+x).join(' '));
 b.append(el('label','','関連するマップ'));
 let maps=mapList(),select=el('select');select.append(new Option('関連マップなし',''));
 maps.forEach(m=>select.append(new Option(m.name,m.id)));select.value=existing.mapId||initialMap?.id||'';b.append(select);
 if(mastery){select.value=initialMap.id;select.disabled=true;b.append(el('p','ap-muted','この項目の学習記録です。同じ項目の習得APは、再度保存しても差分だけを反映します。'));}
 let oldAlloc=allocationsOf(existing);
 b.append(el('label','','習得AP数（自己申告・1つの習得に1AP）'));
 if(mastery&&!existing.id)learned.placeholder=initialTitle+'について、何を理解・習得できたか記入してください';
 let count=el('input');count.type='number';count.min='0';count.max='100';count.step='1';count.value=String(oldAlloc.length||1);b.append(count);
 b.append(el('p','ap-muted','習得した数だけ設定して、それぞれのAPを関連アビリティへ振り分けてください。記録だけ残す場合は0APも選べます。'));
 b.append(el('h3','','APごとの振り分け先'));
 const slots=el('div');b.append(slots);
 const allocationHelp=el('p','ap-muted');b.append(allocationHelp);
 let current=oldAlloc.slice();
 function drawSlots(){
  const n=Math.max(0,Math.min(100,Number(count.value)||0));
  slots.replaceChildren();let allowed=related(maps.find(m=>m.id===select.value));allocationHelp.textContent=select.value?(allowed.length?'このマップに設定済みのアビリティだけ選べます。':'振り分け先が未設定です。「ステータス → アビリティ設定」で、このマップに関連付けてください。'):'関連マップなし：すべてのアビリティから選べます。';
  for(let i=0;i<n;i++){
   let row=el('div','ap-flex');row.style.margin='6px 0';let lab=el('span','','AP '+(i+1));lab.style.minWidth='55px';row.append(lab);
   let pick=el('select');pick.style.margin='0';pick.style.flex='1';
   pick.append(new Option(allowed.length?'振り分け先を選択':'関連アビリティがありません',''));
   allowed.forEach(a=>pick.append(new Option(a.name,a.id)));
   pick.value=allowed.some(a=>a.id===current[i])?current[i]:'';
   current[i]=pick.value;
   pick.onchange=()=>{current[i]=pick.value};row.append(pick);slots.append(row);
  }
  current.length=n;
 }
 count.oninput=()=>{let n=Number(count.value);if(!Number.isInteger(n)||n<0||n>100){slots.replaceChildren();slots.append(el('p','ap-muted','AP数は0〜100の整数にしてください。'));return}drawSlots()};
 select.onchange=()=>{current=[];drawSlots()};drawSlots();
 if(oldAlloc.length)b.append(el('p','ap-muted','保存済みのAPも編集できます。保存すると差分だけを反映します。'));
 let acts=el('div','ap-actions');b.append(acts);
 function commit(award){
  if(!title.value.trim())return alert('題名を入力してください');
  let n=Number(count.value);if(!Number.isInteger(n)||n<0||n>100)return alert('AP数は0〜100の整数にしてください');
  if(award&&n===0)return alert('APを獲得する場合は1以上を指定してください');
  if(award&&!learned.value.trim())return alert('今回習得したことを記入してください');
  const next=award?current.slice(0,n):oldAlloc.slice();
  const allowedIds=new Set(related(maps.find(m=>m.id===select.value)).map(a=>a.id));
  if(!award&&oldAlloc.length&&select.value!==(existing.mapId||''))return alert('AP付き記録の関連マップを変更する場合は、振り分け先を選び直し「APを振り分けて保存」を押してください');
  if(award&&(next.length!==n||next.some(x=>!allowedIds.has(x))))return alert('すべてのAPの振り分け先を選んでください');
  let l=existing.id?data.logs.find(x=>x.id===existing.id):null;
  let prev=l?allocationsOf(l):[];
  const values={title:title.value.trim(),date:date.value,body:body.value,learned:learned.value,tags:[...new Set(tags.value.split(/[\s,#＃、]+/).filter(Boolean))],mapId:select.value};
  if(mastery)Object.assign(values,{source:'learning',nodeId:mastery.nodeId});
  if(!l){l={id:id(),...values};data.logs.unshift(l)}else Object.assign(l,values);
  applyDelta(prev,next);l.allocations=next;l.awarded=next.length>0;l.abilityId=next[0]||null;
  save();logs();
 }
 btn(acts,'記録だけ保存',()=>commit(false));btn(acts,'APを振り分けて保存',()=>commit(true),'ap-main');btn(acts,'戻る',logs);
}
function settings(){page='settings';overlay.hidden=false;let b=shell('ABILITY SETTINGS');let row=el('div','ap-actions');b.append(row);btn(row,'← ステータス',list);let name=field(b,'アビリティを追加');btn(b,'＋ 追加',()=>{let v=name.value.trim();if(!v||data.abilities.some(a=>a.name===v))return alert('名前を確認してください');data.abilities.push({id:id(),name:v,ap:0,last:0});save();settings()});b.append(el('h3','','アビリティ名の編集'));data.abilities.forEach(a=>{let d=el('div','ap-flex');let input=el('input');input.value=a.name;input.style.margin='3px 0';d.append(input);btn(d,'保存',()=>{let v=input.value.trim();if(!v||data.abilities.some(x=>x.id!==a.id&&x.name===v))return alert('重複または空欄です');a.name=v;save();settings()});b.append(d)});b.append(el('h3','','マップとアビリティの関連付け'));const maps=mapList();let sel=el('select');maps.forEach(m=>sel.append(new Option(m.name,m.id)));b.append(sel);let checks=el('div');b.append(checks);function render(){checks.replaceChildren();let m=maps.find(x=>x.id===sel.value);if(!m)return;let ids=related(m).map(x=>x.id);data.abilities.forEach(a=>{let label=el('label','ap-check');let inp=el('input');inp.type='checkbox';inp.checked=ids.includes(a.id);inp.onchange=()=>{let set=new Set(data.associations[m.id]||[]);inp.checked?set.add(a.id):set.delete(a.id);data.associations[m.id]=[...set];save()};label.append(inp,document.createTextNode(a.name));checks.append(label)})}sel.onchange=render;render()}
function backup(){let payload={format:KEY,exportedAt:new Date().toISOString(),data};let a=el('a');let url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.href=url;a.download='SKILL_HUNTER_実践ノート_APバックアップ.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),8000)}
let restore=el('input');restore.type='file';restore.accept='.json,application/json';restore.hidden=true;restore.onchange=async()=>{let f=restore.files?.[0];if(!f)return;try{let p=JSON.parse(await f.text());if(p.format!==KEY||!Array.isArray(p.data?.logs)||!Array.isArray(p.data?.abilities))throw Error('形式が違います');if(!confirm('現在の実践ノートとAPを置き換えますか？'))return;data=p.data;save();list()}catch(e){alert('読み込みできません: '+e.message)}restore.value=''};document.body.append(restore);
const originalList=list;
const statusButton=el('button','','✦ STATUS');statusButton.type='button';statusButton.onclick=()=>originalList();document.getElementById('hunterSplash').append(statusButton);
const nav=el('button','','✦ ステータス');nav.id='hunterStatusOpen';nav.onclick=()=>originalList();document.querySelector('#hunter .bookshelf-tools')?.append(nav);
const p=el('button','','📓 実践ノート');p.id='practiceOpen';p.onclick=logs;document.querySelector('#hunter .bookshelf-tools')?.append(p);
const read=el('button','','📓 実践記録');read.id='readPractice';read.onclick=()=>{let m=null,n=null;try{m=map;n=m?.nodes?.find(x=>x.id===readId)}catch{}editor({},m,n?.title||'')};document.getElementById('readTools')?.append(read);

const masteryButton=el('button','','✓ 習得完了');masteryButton.id='readMastery';masteryButton.style.cssText='background:#fff0c3;color:#211507;-webkit-text-fill-color:#211507;border-color:#bd943a;font-weight:700';
masteryButton.onclick=()=>{let m,n;try{m=map;n=m?.nodes?.find(x=>x.id===readId)}catch{}if(!m||!n)return alert('項目を選択してください');const previous=data.logs.find(l=>l.source==='learning'&&l.mapId===m.id&&l.nodeId===n.id);editor(previous||{},m,n.title,{nodeId:n.id});};
document.getElementById('readTools')?.append(masteryButton);
const back=el('button','','✦ アビリティ');back.onclick=()=>originalList();document.querySelector('header')?.append(back);
const restored=el('button','','📥 AP復元');restored.id='hunterAPRestore';restored.onclick=()=>restore.click();document.querySelector('#hunter .bookshelf-tools')?.append(restored);
originalList();
})();
