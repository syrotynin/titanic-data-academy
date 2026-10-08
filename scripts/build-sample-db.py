"""Build the fictional practice ledger from its committed CSV source."""
import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COLUMNS = ['passenger_id', 'name', 'age', 'passenger_class', 'embarked_port', 'ticket_fare']


def build(destination):
    with (ROOT / 'public/data/fictional-passengers.csv').open(newline='') as source:
        rows = list(csv.DictReader(source))
    destination = Path(destination)
    destination.unlink(missing_ok=True)
    with sqlite3.connect(destination) as db:
        db.execute('CREATE TABLE passengers (passenger_id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, passenger_class INTEGER NOT NULL, embarked_port TEXT NOT NULL, ticket_fare REAL NOT NULL)')
        db.executemany('INSERT INTO passengers VALUES (?, ?, ?, ?, ?, ?)', [
            (int(r['passenger_id']), r['name'], int(r['age']), int(r['passenger_class']), r['embarked_port'], float(r['ticket_fare'])) for r in rows
        ])
    return rows


if __name__ == '__main__':
    build(ROOT / 'public/data/titanic-ch01.sqlite')
