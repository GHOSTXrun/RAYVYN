"""Export the local site to the repository root for branch-based GitHub Pages."""
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'frontend' / 'site'
BASE = '/' if (ROOT / 'CNAME').is_file() else '/RAYVYN/'
TOP = {p.name for p in SOURCE.iterdir()}
PATTERN = re.compile(r'''(?P<quote>["'(])/(?P<path>[^\s"'<>)]*)''')

def rewrite(match):
    path = match['path']
    first = re.split(r'[/#?]', path)[0]
    if first in TOP:
        return match['quote'] + BASE + path
    return match.group(0)

for source in SOURCE.rglob('*'):
    if not source.is_file() or source.name == 'CNAME' or source.suffix == '.orig':
        continue
    target = ROOT / source.relative_to(SOURCE)
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.suffix in {'.html', '.css', '.js', '.mjs', '.json'}:
        content = PATTERN.sub(rewrite, source.read_bytes().decode('utf-8'))
        if source.suffix == '.html':
            content = content.replace('href="/"', 'href="' + BASE + '"')
            content = content.replace('<head>', '<head><script src="' + BASE + 'pages-runtime.js"></script>', 1)
        target.write_text(content, encoding='utf-8', newline='')
    else:
        shutil.copyfile(source, target)
(ROOT / '.nojekyll').touch()
print('GitHub Pages export complete: ' + BASE)
