"""
Migration script to remove meeting_date column from database
"""
import sqlite3
import os

def remove_meeting_date_column():
    db_path = "meetings.db"

    if not os.path.exists(db_path):
        print("✅ No existing database found. A new one will be created when you start the server.")
        return

    print(f"Found existing database: {db_path}")
    print("Removing meeting_date column...")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if column exists
        cursor.execute("PRAGMA table_info(meetings)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'meeting_date' not in columns:
            print("⚠️  'meeting_date' column doesn't exist. Nothing to do.")
            conn.close()
            return

        print(f"Current columns: {columns}")

        # SQLite doesn't support DROP COLUMN directly for old versions
        # We need to create a new table without the column

        print("\nCreating new table without meeting_date...")

        # Create new table
        cursor.execute("""
            CREATE TABLE meetings_new (
                id INTEGER PRIMARY KEY,
                client VARCHAR,
                people_connected TEXT,
                actions TEXT,
                next_meeting VARCHAR,
                address TEXT,
                actions_taken TEXT,
                created_at DATETIME,
                updated_at DATETIME,
                client_order INTEGER DEFAULT 0,
                global_order INTEGER DEFAULT 0,
                client_first_appearance INTEGER DEFAULT 0
            )
        """)

        # Copy data
        print("Copying data to new table...")
        cursor.execute("""
            INSERT INTO meetings_new
            (id, client, people_connected, actions, next_meeting, address, actions_taken,
             created_at, updated_at, client_order, global_order, client_first_appearance)
            SELECT id, client, people_connected, actions, next_meeting, address, actions_taken,
                   created_at, updated_at, client_order, global_order, client_first_appearance
            FROM meetings
        """)

        # Drop old table
        print("Dropping old table...")
        cursor.execute("DROP TABLE meetings")

        # Rename new table
        print("Renaming new table...")
        cursor.execute("ALTER TABLE meetings_new RENAME TO meetings")

        conn.commit()
        print("\n✅ Successfully removed meeting_date column!")
        print("You can now start the server: python main.py")

    except sqlite3.Error as e:
        print(f"❌ Error during migration: {e}")
        print("\nIf migration fails, you can:")
        print("  1. Delete meetings.db and reimport your data")
        print("  2. Run: python main.py (creates fresh database)")
        print("  3. Import Excel: python import_data.py ../Book1.xlsx")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("REMOVE MEETING_DATE COLUMN")
    print("=" * 60)
    print()
    remove_meeting_date_column()
