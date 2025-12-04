"""
Database migration script to add new columns for chronological ordering
"""
import sqlite3
import os

def migrate_database():
    db_path = "meetings.db"

    if not os.path.exists(db_path):
        print("✅ No existing database found. A new one will be created when you start the server.")
        return

    print(f"Found existing database: {db_path}")
    print("Adding missing columns...")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if columns already exist
        cursor.execute("PRAGMA table_info(meetings)")
        columns = [column[1] for column in cursor.fetchall()]

        print(f"Existing columns: {columns}")

        # Add global_order column if it doesn't exist
        if 'global_order' not in columns:
            print("Adding 'global_order' column...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN global_order INTEGER DEFAULT 0")
            print("✅ Added 'global_order' column")
        else:
            print("⚠️  'global_order' column already exists")

        # Add client_first_appearance column if it doesn't exist
        if 'client_first_appearance' not in columns:
            print("Adding 'client_first_appearance' column...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN client_first_appearance INTEGER DEFAULT 0")
            print("✅ Added 'client_first_appearance' column")
        else:
            print("⚠️  'client_first_appearance' column already exists")

        # Update existing data with proper ordering
        print("\nUpdating existing records with proper ordering...")

        # Get all meetings ordered by id (which should be chronological)
        cursor.execute("SELECT id, client FROM meetings ORDER BY id")
        meetings = cursor.fetchall()

        client_first_seen = {}

        for index, (meeting_id, client) in enumerate(meetings):
            global_order = index + 1

            # Track when this client first appeared
            if client not in client_first_seen:
                client_first_seen[client] = global_order

            client_first_appearance = client_first_seen[client]

            cursor.execute(
                "UPDATE meetings SET global_order = ?, client_first_appearance = ? WHERE id = ?",
                (global_order, client_first_appearance, meeting_id)
            )

        conn.commit()
        print(f"✅ Updated {len(meetings)} records with chronological ordering")

        print("\n✅ Migration completed successfully!")
        print("You can now start the server: python main.py")

    except sqlite3.Error as e:
        print(f"❌ Error during migration: {e}")
        print("\nIf migration fails, you can delete the database and reimport:")
        print("  1. Delete meetings.db")
        print("  2. Run: python main.py")
        print("  3. Import your Excel file")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE MIGRATION SCRIPT")
    print("=" * 60)
    print()
    migrate_database()
