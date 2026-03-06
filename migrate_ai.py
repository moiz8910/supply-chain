import sqlite3

def apply_schema():
    conn = sqlite3.connect('data/supply_chain.db')
    cursor = conn.cursor()
    
    # Create exception_alternatives table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exception_alternatives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exception_id TEXT NOT NULL,
        alt_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cost_impact TEXT,
        kpi_impact TEXT,
        tradeoff TEXT,
        UNIQUE(exception_id, alt_id)
    )
    """)
    
    # Create tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exception_id TEXT NOT NULL,
        alternative_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()
    print("AI tracking tables successfully created in supply_chain.db")

if __name__ == '__main__':
    apply_schema()
