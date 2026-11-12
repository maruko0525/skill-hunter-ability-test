/* Complete backups preserve map and ability identities together. */
(()=>{'use strict';
const FORMAT='skill-hunter-full-v1',MAPS='skill-hunter-v1',AP='skill-hunter-practice-v1',JOURNAL='skill-hunter-restore-journal-v1';
const copy=x=>JSON.parse(JSON.stringify(x));
function recover(storage){const raw=storage.getItem(JOURNAL);if(!raw)return;const old=JSON.parse(raw);for(const key of [MAPS,AP]){if(old[key]===null)storage.removeItem(key);else storage.setItem(key,old[key]);}storage.removeItem(JOURNAL);}
function validate(p){
 const fail=()=>{throw Error('全体バックアップの形式または関連付けが不正です。')};
 if(p?.format!==FORMAT||!p.mapsDB||!Array.isArray(p.mapsDB.maps)||!p.practice||!Array.isArray(p.practice.abilities)||!Array.isArray(p.practice.logs))fail();
 const unique=items=>{const ids=new Set();for(const x of items){if(!x||typeof x.id!=='string'||!x.id||ids.has(x.id))fail();ids.add(x.id);}return ids;};
 unique(p.mapsDB.maps);const abilityIds=unique(p.practice.abilities);unique(p.practice.logs);
 for(const m of p.mapsDB.maps){if(typeof m.name!=='string'||!Array.isArray(m.nodes)||!Array.isArray(m.edges))fail();const ids=unique(m.nodes);for(const n of m.nodes)if(typeof n.title!=='string'||!Number.isFinite(n.x)||!Number.isFinite(n.y))fail();for(const e of m.edges)if(!e||!ids.has(e.from)||!ids.has(e.to))fail();}
 for(const a of p.practice.abilities)if(typeof a.name!=='string'||!Number.isFinite(a.ap)||a.ap<0)fail();
 const assoc=p.practice.associations;if(!assoc||typeof assoc!=='object'||Array.isArray(assoc))fail();
 for(const ids of Object.values(assoc))if(!Array.isArray(ids)||ids.some(id=>!abilityIds.has(id)))fail();
 for(const l of p.practice.logs){if(l.allocations!==undefined&&(!Array.isArray(l.allocations)||l.allocations.some(id=>!abilityIds.has(id))))fail();if(l.abilityId&&!abilityIds.has(l.abilityId))fail();}
 return copy(p);
}
function restore(storage,p){const next=validate(p);recover(storage);const old={[MAPS]:storage.getItem(MAPS),[AP]:storage.getItem(AP)};storage.setItem(JOURNAL,JSON.stringify(old));try{storage.setItem(MAPS,JSON.stringify(next.mapsDB));storage.setItem(AP,JSON.stringify(next.practice));storage.removeItem(JOURNAL);}catch(e){try{recover(storage);}catch{throw Error('復元を中断しました。保存領域を確保して再読み込みしてください。元のデータは復旧用に保持しています。');}throw Error('保存できなかったため、復元前のデータに戻しました。');}return next;}
window.HunterFullBackup={FORMAT,validate,restore,recover};
try{recover(localStorage);}catch{alert('前回の復元からの復旧が必要です。保存領域を確保して再読み込みしてください。');}
})();
