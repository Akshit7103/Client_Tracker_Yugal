import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal, Meeting
import sys

def import_excel_data(excel_file_path):
    """Import data from Excel file into the database"""
    db = SessionLocal()

    try:
        # Read Excel file
        df = pd.read_excel(excel_file_path)
        print(f"Found {len(df)} rows in Excel file")

        imported = 0
        skipped = 0
        client_first_seen = {}  # Track when each client first appears
        client_order_counter = {}  # Track order count for each client during import

        for index, row in df.iterrows():
            # Get client name
            client_name = str(row.get('Client', '')).strip()

            if not client_name or client_name == 'nan':
                skipped += 1
                continue

            # Track chronological order (row index + 1 to start from 1)
            global_order = index + 1

            # Track when this client first appeared in the Excel
            if client_name not in client_first_seen:
                client_first_seen[client_name] = global_order

            # Track client order: check database for existing, then increment in memory
            if client_name not in client_order_counter:
                # First occurrence of this client in current import - check database
                max_order = db.query(Meeting).filter(
                    Meeting.client == client_name
                ).order_by(Meeting.client_order.desc()).first()
                client_order_counter[client_name] = 0 if not max_order else max_order.client_order

            # Increment order for this client
            client_order_counter[client_name] += 1
            new_order = client_order_counter[client_name]

            # Create meeting entry
            meeting = Meeting(
                client=client_name,
                people_connected=str(row.get('People Connected', '')) if pd.notna(row.get('People Connected')) else None,
                actions=str(row.get('Actions', '')) if pd.notna(row.get('Actions')) else None,
                next_meeting=str(row.get('Next Meeting', '')) if pd.notna(row.get('Next Meeting')) else None,
                address=str(row.get('Address', '')) if pd.notna(row.get('Address')) else None,
                actions_taken=str(row.get('Actions Taken', '')) if pd.notna(row.get('Actions Taken')) else None,
                client_order=new_order,
                global_order=global_order,
                client_first_appearance=client_first_seen[client_name]
            )

            db.add(meeting)
            imported += 1

            if imported % 10 == 0:
                print(f"Imported {imported} meetings...")

        db.commit()
        print(f"\n✅ Successfully imported {imported} meetings")
        if skipped > 0:
            print(f"⚠️  Skipped {skipped} rows (no client name)")

    except Exception as e:
        print(f"❌ Error importing data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_data.py <path_to_excel_file>")
        print("Example: python import_data.py ../Book1.xlsx")
        sys.exit(1)

    excel_file = sys.argv[1]
    import_excel_data(excel_file)
