from pathlib import Path
import re, base64
root = Path(__file__).resolve().parent
dist = root / 'dist'
html = (dist / 'index.html').read_text(encoding='utf-8')
modules = []
for name in ['biology.js', 'scene.js', 'renderer.js', 'app.js']:
    code = (dist / name).read_text(encoding='utf-8')
    code = re.sub(r'^import[^\n]*\n', '', code, flags=re.M)
    code = re.sub(r'^export ', '', code, flags=re.M)
    modules.append('// ' + name + '\n' + code)
code = '\n'.join(modules)
html = html.replace('<link rel="stylesheet" href="./styles.css">', '<style>\n' + (dist / 'styles.css').read_text(encoding='utf-8') + '\n</style>')
icon = base64.b64encode((dist / 'icon.svg').read_bytes()).decode('ascii')
html = html.replace('href="./icon.svg"', 'href="data:image/svg+xml;base64,' + icon + '"')
html = html.replace('<script type="module" src="./app.js"></script>', '<script>\n' + code + '\n</script>')
(root / 'GeneLab.html').write_text(html, encoding='utf-8')
print('GeneLab.html selesai dibuat.')
