"""Validate the delivered NAOSIQ design/document kit. Standard library only.

Usage: python scripts/validate_delivery.py
This does not validate the production CRM or external services.
"""
from pathlib import Path
import csv
import hashlib
import json
import sys
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]

def main():
    errors=[]
    def check(ok, message):
        if not ok: errors.append(message)
    try:
        screens=json.loads((ROOT/'contracts/screens-actions.json').read_text(encoding='utf-8'))['screens']
        flow=json.loads((ROOT/'contracts/ux-flow-navigation.json').read_text(encoding='utf-8'))
        ids=[s['id'] for s in screens]
        aids=[a['id'] for s in screens for a in s['actions']]
        check(len(ids)==118 and len(set(ids))==118,'Expected 118 unique screens')
        check(len(aids)==363 and len(set(aids))==363,'Expected 363 unique actions')
        check(len(flow['journeys'])==32,'Expected 32 journeys')
        check(set(aids)=={a['action_id'] for a in flow['actions']},'Action references differ')
        for s in screens:
            svg=ROOT/'design/screens'/f"{s['id']}.svg"
            check(svg.is_file(),f"Missing SVG: {s['id']}")
            if svg.is_file():
                ET.parse(svg)
            for a in s['actions']:
                check(a['target'] in ids,f"Invalid source action target: {a['id']}")
        for f in flow['journeys']:
            for st in f['steps']:
                check(st['screen'] in ids,f"Invalid journey screen: {f['id']}")
        for p in ROOT.rglob('*.json'):
            json.loads(p.read_text(encoding='utf-8'))
        frames=json.loads((ROOT/'figma/FRAME_MANIFEST.json').read_text(encoding='utf-8'))
        for frame in frames:
            check((ROOT/frame['svg']).is_file(),'Missing Figma handoff SVG')
        with (ROOT/'figma/connections.csv').open(encoding='utf-8',newline='') as f:
            check(len(list(csv.DictReader(f)))==363,'Expected 363 Figma handoff connections')
        for p in ROOT.rglob('*'):
            check(p.suffix.lower() not in {'.ttf','.otf','.woff','.woff2'},'Font binaries must not be distributed')
        manifest=ROOT/'MANIFEST_SHA256.txt'
        if manifest.exists():
            for line in manifest.read_text(encoding='utf-8').splitlines():
                if not line.strip(): continue
                expected,name=line.split('  ',1)
                p=ROOT/name
                check(p.is_file(),f'Manifest file missing: {name}')
                if p.is_file(): check(hashlib.sha256(p.read_bytes()).hexdigest()==expected,f'Hash differs: {name}')
        print(json.dumps({'scope':'Document and design kit only','passed':not errors,'screens':len(ids),'actions':len(aids),'journeys':len(flow['journeys']),'errors':errors},ensure_ascii=False,indent=2))
        return 1 if errors else 0
    except (OSError,ValueError,KeyError,ET.ParseError) as exc:
        print(json.dumps({'passed':False,'error':str(exc)},ensure_ascii=False))
        return 1

if __name__=='__main__':
    sys.exit(main())
