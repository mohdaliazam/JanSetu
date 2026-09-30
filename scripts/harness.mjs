import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const statuses = new Set(['pending', 'in_progress', 'blocked', 'done']);
const targets = new Set(['demo', 'full']);
const fail = message => { throw new Error(message); };
const readJSON = filename => JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));

export function safePath(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) fail('Expected repository-relative path');
  const resolved = path.resolve(root, relative);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail(`Path escapes repository: ${relative}`);
  if (!fs.existsSync(resolved)) fail(`Missing file: ${relative}`);
  const realRoot = fs.realpathSync(root);
  const realRel = path.relative(realRoot, fs.realpathSync(resolved));
  if (realRel.startsWith('..') || path.isAbsolute(realRel)) fail(`Symlink escapes repository: ${relative}`);
  if (!fs.statSync(resolved).isFile()) fail(`Expected file: ${relative}`);
  return resolved;
}

export function load(root = ROOT) {
  return { tasks: readJSON(safePath(root, 'harness/tasks.json')).tasks, state: readJSON(safePath(root, 'harness/state.json')) };
}

export function validateGraph(tasks) {
  if (!Array.isArray(tasks) || !tasks.length) fail('Empty task graph');
  const ids = new Set();
  for (const t of tasks) {
    if (!/^[PX]\d{2}$/.test(t.id) || ids.has(t.id)) fail(`Invalid/duplicate task ID: ${t.id}`);
    ids.add(t.id);
    if (!targets.has(t.target) || !t.title || !Array.isArray(t.depends_on) || !t.read?.length || !t.acceptance?.length) fail(`Incomplete task: ${t.id}`);
  }
  const byId = new Map(tasks.map(t => [t.id, t]));
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) fail(`Task dependency cycle: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of byId.get(id).depends_on) {
      if (!ids.has(dep)) fail(`Unknown dependency: ${dep}`);
      if (byId.get(id).target === 'demo' && byId.get(dep).target === 'full') fail(`Demo task depends on full task: ${id}`);
      visit(dep);
    }
    visiting.delete(id); visited.add(id);
  }
  tasks.forEach(t => visit(t.id));
}

export function validateEvidence(root, relative, taskId, startedAt) {
  if (path.basename(relative) === 'TEMPLATE.json') fail('Evidence template is not an observation');
  const e = readJSON(safePath(root, relative));
  if (e.task_id !== taskId) fail(`Evidence belongs to another task: ${relative}`);
  if (!Number.isFinite(Date.parse(e.recorded_at)) || Date.parse(e.recorded_at) > Date.now() + 60000) fail('Invalid/future evidence timestamp');
  if (startedAt && Date.parse(e.recorded_at) < Date.parse(startedAt)) fail('Evidence predates current task attempt');
  for (const field of ['source_revision', 'environment']) {
    if (typeof e[field] !== 'string' || !e[field].trim() || /REPLACE_WITH/.test(e[field])) fail(`Missing evidence ${field}`);
  }
  if (!Array.isArray(e.checks) || !e.checks.length) fail('Evidence needs observed checks');
  for (const c of e.checks) {
    for (const key of ['name', 'action', 'expected', 'actual']) {
      if (typeof c[key] !== 'string' || !c[key].trim() || /REPLACE_WITH/.test(c[key])) fail(`Missing observed check ${key}`);
    }
    if (!['pass', 'fail'].includes(c.status)) fail('Evidence check must be pass or fail');
    if (!Array.isArray(c.acceptance) || !c.acceptance.length || c.acceptance.some(n => !Number.isInteger(n) || n < 1)) fail('Each check must map to numbered task acceptance criteria');
  }
  if (!Array.isArray(e.artifacts) || !Array.isArray(e.limitations)) fail('Evidence needs artifacts and limitations arrays');
  e.artifacts.forEach(p => safePath(root, p));
  return e;
}

function requireAcceptance(task, records) {
  const covered = new Set(records.flatMap(e => e.checks.flatMap(c => c.acceptance)));
  if ([...covered].some(n => n > task.acceptance.length)) fail(`Unknown acceptance criterion for ${task.id}`);
  if (task.acceptance.some((_, i) => !covered.has(i + 1))) fail(`Evidence does not cover every acceptance criterion for ${task.id}`);
}

export function validateState(root, tasks, state) {
  if (state.schema_version !== 1 || !targets.has(state.target) || !state.tasks || !Number.isFinite(Date.parse(state.updated_at))) fail('Invalid state header');
  const ids = tasks.map(t => t.id);
  if (Object.keys(state.tasks).sort().join() !== [...ids].sort().join()) fail('State/task ID mismatch');
  for (const t of tasks) {
    const s = state.tasks[t.id];
    if (!statuses.has(s.status) || !Array.isArray(s.evidence) || typeof s.note !== 'string') fail(`Invalid state: ${t.id}`);
    if (s.status === 'blocked' && !s.note.trim()) fail(`Blocked task needs a reason: ${t.id}`);
    if (['in_progress', 'done'].includes(s.status) && !Number.isFinite(Date.parse(s.started_at))) fail(`Task needs start time: ${t.id}`);
    const records = s.evidence.map(p => validateEvidence(root, p, t.id, s.started_at));
    if (s.status === 'done') {
      if (!records.length || records.some(e => e.checks.some(c => c.status !== 'pass'))) fail(`Done task lacks passing evidence: ${t.id}`);
      requireAcceptance(t, records);
      if (t.depends_on.some(id => state.tasks[id].status !== 'done')) fail(`Done task has incomplete dependency: ${t.id}`);
    }
  }
}

export function eligible(tasks, state) {
  const selected = tasks.filter(t => state.target === 'full' || t.target === 'demo');
  const active = selected.filter(t => state.tasks[t.id].status === 'in_progress');
  if (active.length) return active;
  return selected.filter(t => state.tasks[t.id].status === 'pending' && t.depends_on.every(id => state.tasks[id].status === 'done'));
}

function invalidateDescendants(tasks, state, parent) {
  const affected = new Set([parent]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of tasks) if (!affected.has(t.id) && t.depends_on.some(id => affected.has(id))) { affected.add(t.id); changed = true; }
  }
  for (const id of affected) {
    if (id === parent) continue;
    if (state.tasks[id].status !== 'pending' || state.tasks[id].evidence.length) {
      state.tasks[id] = { status: 'pending', evidence: [], note: `Dependency ${parent} reopened; reverify before completion.` };
    }
  }
}

export function transition(root, tasks, state, id, status, note = '') {
  const t = tasks.find(t => t.id === id);
  if (!t || !statuses.has(status)) fail('Unknown task or status');
  if (state.target === 'demo' && t.target === 'full' && status === 'in_progress') fail('Select full target before starting an extension');
  const s = state.tasks[id];
  if (['in_progress', 'done'].includes(status) && t.depends_on.some(dep => state.tasks[dep].status !== 'done')) fail('Dependencies must be done first');
  if (status === 'blocked' && !note.trim()) fail('Blocked requires a concrete reason');
  if (status === 'done') {
    if (s.status !== 'in_progress') fail('Start task before completing it');
    const records = s.evidence.map(p => validateEvidence(root, p, id, s.started_at));
    if (!records.length || records.some(e => e.checks.some(c => c.status !== 'pass'))) fail('Passing observed evidence required');
    requireAcceptance(t, records);
  }
  if (s.status === 'done' && status !== 'done') invalidateDescendants(tasks, state, id);
  if (status === 'pending' || (status === 'in_progress' && s.status !== 'in_progress')) {
    s.evidence = [];
    delete s.completed_at;
    if (status === 'in_progress') s.started_at = new Date().toISOString(); else delete s.started_at;
  }
  s.status = status; s.note = note;
  if (status === 'done') s.completed_at = new Date().toISOString();
  state.updated_at = new Date().toISOString();
}

// Small validator for the keywords in the bundled contracts, not a general JSON Schema engine.
export function checkSchema(value, schema, location = '$') {
  if ('const' in schema && value !== schema.const) fail(`${location}: wrong constant`);
  if (schema.enum && !schema.enum.includes(value)) fail(`${location}: invalid enum`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matches = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;
    if (!types.some(matches)) fail(`${location}: wrong type`);
  }
  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength || schema.maxLength && value.length > schema.maxLength) fail(`${location}: string length`);
    if (schema.format === 'date-time' && !Number.isFinite(Date.parse(value))) fail(`${location}: invalid timestamp`);
  }
  if (typeof value === 'number' && (!Number.isFinite(value) || schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum)) fail(`${location}: number bounds`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems || schema.maxItems !== undefined && value.length > schema.maxItems) fail(`${location}: array length`);
    if (schema.items) value.forEach((v, i) => checkSchema(v, schema.items, `${location}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const key of schema.required || []) if (!(key in value)) fail(`${location}: missing ${key}`);
    for (const [key, val] of Object.entries(value)) {
      if (schema.properties?.[key]) checkSchema(val, schema.properties[key], `${location}.${key}`);
      else if (schema.additionalProperties === false) fail(`${location}: unexpected ${key}`);
    }
  }
}

export function validate(root = ROOT) {
  const manifest = readJSON(safePath(root, 'harness/manifest.json'));
  manifest.required_files.forEach(p => safePath(root, p));
  const { tasks, state } = load(root);
  validateGraph(tasks); validateState(root, tasks, state);
  tasks.forEach(t => t.read.forEach(p => safePath(root, p)));
  for (const p of manifest.required_files.filter(p => p.endsWith('.md'))) {
    const content = fs.readFileSync(safePath(root, p), 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const m of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = m[1];
      if (/^(https?:|#)/.test(link)) continue;
      safePath(root, path.join(path.dirname(p), decodeURIComponent(link.split('#')[0])));
    }
  }
  const data = readJSON(safePath(root, 'fixtures/demo-data.json'));
  if (data.synthetic !== true || data.schema_version !== '1.0') fail('Demo data must be synthetic and versioned');
  const localityIds = new Set(data.localities.map(x => x.id)), sourceIds = new Set(data.sources.map(x => x.id));
  if (localityIds.size !== data.localities.length || new Set(data.localities.map(x => x.state_code)).size < 3) fail('Need unique localities across three states');
  if (data.localities.some(x => !x.synthetic) || data.sources.some(x => x.kind !== 'synthetic' || !x.caveat)) fail('Missing synthetic provenance');
  const extraction = readJSON(safePath(root, 'contracts/extraction.schema.json'));
  const categories = extraction.properties.category.enum;
  for (const row of [...data.indicators, ...data.plans, ...data.seed_reports]) {
    if (!localityIds.has(row.locality_id) || !categories.includes(row.category)) fail(`Invalid locality/category: ${row.id}`);
    if ('source_id' in row && !sourceIds.has(row.source_id)) fail(`Missing source: ${row.id}`);
  }
  for (const row of data.indicators) {
    if (row.population !== null && (!Number.isFinite(row.population) || row.population < 0) || row.gap_pct !== null && (!Number.isFinite(row.gap_pct) || row.gap_pct < 0 || row.gap_pct > 100)) fail(`Invalid indicator: ${row.id}`);
  }
  for (const row of data.seed_reports) {
    if (row.provider_mode !== 'fixture') fail('Seed cannot claim live Gemini');
    checkSchema({category: row.category, summary_en: row.summary_en, language: row.language, urgency: row.urgency, evidence_quote: row.text, needs_review: false, review_reasons: []}, extraction);
  }
  const cases = readJSON(safePath(root, 'fixtures/ai-cases.json'));
  if (cases.length < 8 || new Set(cases.map(c => c.id)).size !== cases.length) fail('Insufficient/duplicate AI evaluation cases');
  for (const c of cases) if (!localityIds.has(c.locality_id) || c.expected_category !== null && !categories.includes(c.expected_category) || typeof c.expected_review !== 'boolean') fail(`Invalid evaluation case ${c.id}`);
  const briefSchema = readJSON(safePath(root, 'contracts/brief.schema.json'));
  checkSchema({title:'Inspect water supply',rationale:[{claim:'Reports describe unreliable supply.',source_ids:['SEED-01']}],next_steps:['Verify reported service gaps.'],caveats:['Synthetic demonstration.']}, briefSchema);
  const exportSchema = readJSON(safePath(root, 'contracts/export.schema.json'));
  checkSchema({schema_version:'1.0',synthetic:true,provider_mode:'fixture',group_id:'EXAMPLE',locality_id:'IN-BR-PAT-L01',category:'water',report_ids:['SEED-01'],indicator_ids:['IND-01'],plan_ids:[],source_ids:['SRC-DEMO-01'],score:59.5,formula_version:'v1',exported_at:new Date().toISOString(),evidence_packet:{locality:data.localities[0],indicators:[data.indicators[0]],plans:[],reports:[{id:'SEED-01',redacted_text:data.seed_reports[0].text,provider_mode:'fixture'}],sources:data.sources}}, exportSchema);
  return {files: manifest.required_files.length, tasks: tasks.length, localities: localityIds.size, ai_cases: cases.length, note: 'H0 blueprint checks only; no application or live provider verification.'};
}

function save(root, state) {
  const filename = path.join(root, 'harness/state.json');
  fs.copyFileSync(filename, filename + '.bak');
  const tmp = filename + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, filename);
}

export function main(args, root = ROOT) {
  const [command = 'status', id, value, ...rest] = args;
  if (command === 'validate') { console.log(JSON.stringify(validate(root), null, 2)); return; }
  const {tasks, state} = load(root);
  validateGraph(tasks); validateState(root, tasks, state);
  if (command === 'status') {
    console.log(`Target: ${state.target}. Status records are not independent proof of runtime behavior.`);
    for (const t of tasks) console.log(`${t.id} [${state.tasks[t.id].status}] ${t.title}${t.target === 'full' ? ' (full)' : ''}`);
  } else if (command === 'next') {
    const options = eligible(tasks, state);
    console.log(options.length ? JSON.stringify(options[0], null, 2) : 'No eligible pending task. Inspect blocked tasks or run release-check; do not infer completion.');
  } else if (command === 'set') {
    transition(root, tasks, state, id, value, rest.join(' ')); save(root, state);
    console.log(`${id}: ${value}`);
  } else if (command === 'record') {
    if (!state.tasks[id] || state.tasks[id].status !== 'in_progress') fail('Record evidence for an in_progress task');
    validateEvidence(root, value, id, state.tasks[id].started_at);
    if (!state.tasks[id].evidence.includes(value)) state.tasks[id].evidence.push(value);
    state.updated_at = new Date().toISOString(); save(root, state); console.log(`Recorded ${value}`);
  } else if (command === 'target') {
    if (!targets.has(id)) fail('Target must be demo or full');
    if (state.target === 'full' && id === 'demo') fail('Do not silently downgrade scope. Record explicit user agreement and edit state target with an ADR.');
    state.target = id; state.updated_at = new Date().toISOString(); save(root, state); console.log(`Target: ${id}`);
  } else if (command === 'release-check') {
    const remaining = tasks.filter(t => (state.target === 'full' || t.target === 'demo') && state.tasks[t.id].status !== 'done');
    if (remaining.length) fail(`Release incomplete: ${remaining.map(t => t.id).join(', ')}`);
    console.log('Task evidence structure passes. Independently inspect G1-G8 evidence and deployed revision before claiming release.');
  } else fail('Unknown command. Use validate, status, next, set, record, target or release-check.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (e) { console.error(`HARNESS ERROR: ${e.message}`); process.exitCode = 1; }
}
