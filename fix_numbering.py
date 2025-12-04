"""
Script to fix the client_order numbering in existing database
"""
import sqlite3
import os

def fix_client_order():
    db_path = "meetings.db"

    if not os.path.exists(db_path):
        print("❌ No database found at meetings.db")
        return

    print("Fixing client_order numbering...")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get all meetings ordered by client_first_appearance and global_order
        cursor.execute("""
            SELECT id, client
            FROM meetings
            ORDER BY client_first_appearance, global_order
        """)

        meetings = cursor.fetchall()

        # Track order for each client
        client_order_map = {}

        for meeting_id, client in meetings:
            # Increment order for this client
            if client not in client_order_map:
                client_order_map[client] = 0

            client_order_map[client] += 1
            new_order = client_order_map[client]

            # Update the meeting with correct order
            cursor.execute(
                "UPDATE meetings SET client_order = ? WHERE id = ?",
                (new_order, meeting_id)
            )

        conn.commit()

        print(f"\n✅ Successfully updated {len(meetings)} meetings")
        print("\nUpdates per client:")
        for client, count in client_order_map.items():
            print(f"  - {client}: {count} updates")

        print("\n✅ Numbering fixed! Refresh your browser to see the changes.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("FIX CLIENT ORDER NUMBERING")
    print("=" * 60)
    print()
    fix_client_order()
