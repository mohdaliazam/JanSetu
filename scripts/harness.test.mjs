import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, validate, validateGraph, validateEvidence, validateState, eligible, transition, safePath, checkSchema, main } from './harness.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jansetu-harness-test-'));
  t.after(() => {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(root));
    assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative) && path.basename(root).startsWith('jansetu-harness-test-'));
    fs.rmSync(root, {recursive:true, force:true});
  });
  fs.mkdirSync(path.join(root,'harness/evidence'), {recursive:true});
  fs.writeFileSync(path.join(root,'README.md'),'test');
  const tasks = ['P00','P01','P02'].map((id,i) => ({id,title:id,target:'demo',depends_on:i ? [`P0${i-1}`] : [],read:['README.md'],acceptance:['Observed acceptance']}));
  const state = {schema_version:1,target:'demo',updated_at:new Date().toISOString(),tasks:Object.fromEntries(tasks.map(t => [t.id,{status:'pending',evidence:[],note:''}]))};
  return {root,tasks,state};
}
function evidence(root,id,overrides={}) {
  const p = `harness/evidence/${id}.json`;
  fs.writeFileSync(path.join(root,p),JSON.stringify({task_id:id,recorded_at:new Date().toISOString(),source_revision:'test-only-fixture',environment:'isolated test',checks:[{name:'check',action:'test fixture',expected:'expected',actual:'observed',status:'pass',acceptance:[1]}],artifacts:[],limitations:[],...overrides}));
  return p;
}
function complete(f,id) {
  transition(f.root,f.tasks,f.state,id,'in_progress');
  f.state.tasks[id].evidence.push(evidence(f.root,id));
  transition(f.root,f.tasks,f.state,id,'done');
}

test('delivered blueprint validates without claiming application completion', () => {
  const result = validate(ROOT);
  assert.equal(result.tasks,15); assert.equal(result.localities,6);
  assert.match(result.note,/no application/);
});
test('dependency graph rejects cycles and unknown dependencies', t => {
  const f=fixture(t); f.tasks[0].depends_on=['P02']; assert.throws(()=>validateGraph(f.tasks),/cycle/);
  f.tasks[0].depends_on=['P99']; assert.throws(()=>validateGraph(f.tasks),/Unknown dependency/);
});
test('next selects eligible task and resumes active work', t => {
  const f=fixture(t); assert.equal(eligible(f.tasks,f.state)[0].id,'P00');
  transition(f.root,f.tasks,f.state,'P00','in_progress'); assert.equal(eligible(f.tasks,f.state)[0].id,'P00');
  complete(f,'P00'); assert.equal(eligible(f.tasks,f.state)[0].id,'P01');
});
test('cannot start task before dependencies or complete without evidence', t => {
  const f=fixture(t); assert.throws(()=>transition(f.root,f.tasks,f.state,'P01','in_progress'),/Dependencies/);
  transition(f.root,f.tasks,f.state,'P00','in_progress'); assert.throws(()=>transition(f.root,f.tasks,f.state,'P00','done'),/evidence/);
});
test('failed observed check prevents completion', t => {
  const f=fixture(t); transition(f.root,f.tasks,f.state,'P00','in_progress');
  f.state.tasks.P00.evidence=[evidence(f.root,'P00',{checks:[{name:'x',action:'x',expected:'x',actual:'failed',status:'fail',acceptance:[1]}]})];
  assert.throws(()=>transition(f.root,f.tasks,f.state,'P00','done'),/Passing/);
});
test('template, wrong-task and stale evidence rejected', t => {
  const f=fixture(t); assert.throws(()=>validateEvidence(f.root,'TEMPLATE.json','P00'),/template/);
  const p=evidence(f.root,'P01'); assert.throws(()=>validateEvidence(f.root,p,'P00'),/another task/);
  const old=evidence(f.root,'P00',{recorded_at:'2020-01-01T00:00:00Z'}); assert.throws(()=>validateEvidence(f.root,old,'P00',new Date().toISOString()),/predates/);
});
test('path traversal and missing artifact rejected', t => {
  const f=fixture(t); assert.throws(()=>safePath(f.root,'../outside.json'),/escapes/);
  assert.throws(()=>safePath(f.root,'missing.json'),/Missing/);
  const p=evidence(f.root,'P00',{artifacts:['missing.png']}); assert.throws(()=>validateEvidence(f.root,p,'P00'),/Missing/);
});
test('reopening invalidates completed descendants and requires fresh evidence', t => {
  const f=fixture(t); ['P00','P01','P02'].forEach(id=>complete(f,id));
  transition(f.root,f.tasks,f.state,'P00','in_progress');
  assert.equal(f.state.tasks.P01.status,'pending'); assert.equal(f.state.tasks.P02.status,'pending');
  assert.deepEqual(f.state.tasks.P00.evidence,[]); assert.deepEqual(f.state.tasks.P02.evidence,[]);
  validateState(f.root,f.tasks,f.state);
});
test('blocked task needs actionable note and is not automatically retried', t => {
  const f=fixture(t); assert.throws(()=>transition(f.root,f.tasks,f.state,'P00','blocked'),/reason/);
  transition(f.root,f.tasks,f.state,'P00','blocked','Missing provider access'); assert.equal(eligible(f.tasks,f.state).length,0);
});
test('schema validator rejects invalid enum, extra key and numeric range',()=>{
  const s={type:'object',required:['score','mode'],additionalProperties:false,properties:{score:{type:['number','null'],minimum:0,maximum:100},mode:{enum:['live','fixture']}}};
  checkSchema({score:null,mode:'fixture'},s);
  assert.throws(()=>checkSchema({score:101,mode:'live'},s),/bounds/);
  assert.throws(()=>checkSchema({score:50,mode:'fake'},s),/enum/);
  assert.throws(()=>checkSchema({score:50,mode:'live',secret:'x'},s),/unexpected/);
});
test('CLI persists state and refuses incomplete release', t=>{
  const f=fixture(t);
  fs.writeFileSync(path.join(f.root,'harness/tasks.json'),JSON.stringify({tasks:f.tasks}));
  fs.writeFileSync(path.join(f.root,'harness/state.json'),JSON.stringify(f.state));
  main(['set','P00','in_progress'],f.root);
  const updated=JSON.parse(fs.readFileSync(path.join(f.root,'harness/state.json'),'utf8'));
  assert.equal(updated.tasks.P00.status,'in_progress'); assert.ok(fs.existsSync(path.join(f.root,'harness/state.json.bak')));
  assert.throws(()=>main(['release-check'],f.root),/Release incomplete/);
});
test('full extension cannot start under demo target', t=>{
  const f=fixture(t); f.tasks.push({id:'X01',title:'voice',target:'full',depends_on:[],read:['README.md'],acceptance:['voice tested']});
  f.state.tasks.X01={status:'pending',evidence:[],note:''};
  assert.throws(()=>transition(f.root,f.tasks,f.state,'X01','in_progress'),/full target/);
  f.state.target='full'; transition(f.root,f.tasks,f.state,'X01','in_progress'); assert.equal(f.state.tasks.X01.status,'in_progress');
});
test('evidence must cover every numbered acceptance criterion', t=>{
  const f=fixture(t); f.tasks[0].acceptance.push('Second required observation');
  transition(f.root,f.tasks,f.state,'P00','in_progress');
  f.state.tasks.P00.evidence=[evidence(f.root,'P00')];
  assert.throws(()=>transition(f.root,f.tasks,f.state,'P00','done'),/every acceptance/);
});
