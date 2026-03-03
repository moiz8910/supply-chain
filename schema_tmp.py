import sqlite3
c = sqlite3.connect('data/supply_chain.db').cursor()
for row in c.execute("PRAGMA table_info('shipments')").fetchall():
    print(row[1])
