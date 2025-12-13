import sqlite3

DB_PATH = "palettes.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_palette_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS color_palettes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            primary_color TEXT,
            secondary_color TEXT,
            accent_color TEXT,
            bg_color TEXT,
            usage_count INTEGER DEFAULT 1,
            UNIQUE(primary_color, secondary_color, accent_color, bg_color)
        )
    """)
    conn.commit()
    conn.close()
