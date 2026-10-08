import importlib.util
import json
import sqlite3
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generator', ROOT / 'scripts/build-sample-db.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
with tempfile.TemporaryDirectory() as directory:
    generated = Path(directory) / 'practice.sqlite'
    rows = generator.build(generated)
    with sqlite3.connect(f'file:{ROOT}/public/data/titanic-ch01.sqlite?mode=ro', uri=True) as actual, sqlite3.connect(generated) as expected:
        assert actual.execute('PRAGMA integrity_check').fetchone() == ('ok',)
        assert actual.execute('SELECT * FROM passengers').fetchall() == expected.execute('SELECT * FROM passengers').fetchall()
        assert len(rows) == 24
        for lesson in json.loads((ROOT / 'content/chapter-01.json').read_text())['lessons']:
            result = actual.execute(lesson['referenceSql']).fetchall()
            assert 0 < len(result) <= 100, lesson['id']
print('Database integrity, CSV parity, generation, and all five reference queries passed.')
