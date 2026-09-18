import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { run } from './process.mjs';
const requested = { CHECKOUT_SHA: ['actions/checkout','v7'], SETUP_NODE_SHA: ['actions/setup-node','v6'], UPLOAD_SHA: ['actions/upload-artifact','v4'] };
try {
  const destination = 'tools/action-pins.json';
  const refresh = process.argv.includes('--refresh');
  const pins = existsSync(destination) && !refresh ? JSON.parse(readFileSync(destination,'utf8')) : {};
  for (const [key, [repo, tag]] of Object.entries(requested)) {
    if (pins[key]?.sha && /^[a-f0-9]{40}$/.test(pins[key].sha)) continue;
    const result = run('git', ['ls-remote', `https://github.com/${repo}.git`, `refs/tags/${tag}`, `refs/tags/${tag}^{}`], { stdio: ['ignore','pipe','inherit'], encoding:'utf8' });
    const rows = result.stdout.trim().split('\n').map(row => row.split(/\s+/));
    const sha = (rows.find(row => row[1]?.endsWith('^{}')) ?? rows.find(row => row[1] === `refs/tags/${tag}`))?.[0];
    if (!sha || !/^[a-f0-9]{40}$/.test(sha)) throw new Error(`Cannot resolve reviewed tag: ${repo}@${tag}`);
    pins[key] = { repo, tag, sha, resolvedAt: new Date().toISOString() };
  }
  mkdirSync('tools', { recursive: true });
  writeFileSync(destination, JSON.stringify(pins,null,2)+'\n');
  mkdirSync('.github/workflows', { recursive: true });
  for(const file of readdirSync('tools/workflow-templates').filter(n=>n.endsWith('.yml.in'))) {
    let content = readFileSync(`tools/workflow-templates/${file}`,'utf8');
    for(const [key,value] of Object.entries(pins)) content=content.replaceAll(`__${key}__`,value.sha);
    if (/__[A-Z_]+__/.test(content)) throw new Error(`Unresolved workflow token: ${file}`);
    writeFileSync(`.github/workflows/${file.replace(/\.in$/,'')}`,content);
  }
  console.log('Workflow SHAs resolved once, not on every CI run. Review diffs before committing.');
} catch(error) { console.error(error.message); process.exitCode=1; }
