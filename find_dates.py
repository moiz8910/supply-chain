import sqlite3
c = sqlite3.connect('data/supply_chain.db').cursor()
for t in ['orders', 'shipments', 'production_runs', 'movements', 'production_plan']:
    print(f"--- {t} ---")
    for r in c.execute(f"PRAGMA table_info('{t}')").fetchall():
        if 'date' in r[1].lower() or 'time' in r[1].lower():
            print(r[1])
