"""
Initialize database with data from Book1.xlsx on first deployment
This script runs automatically when the app starts for the first time
"""
import os
from sqlalchemy.orm import Session
from database import SessionLocal, Meeting, engine, Base
import pandas as pd

def init_database():
    """Initialize database with data from Excel file if database is empty"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if database already has data
        existing_count = db.query(Meeting).count()
        if existing_count > 0:
            print(f"Database already initialized with {existing_count} meetings")
            return

        # Check if Book1.xlsx exists
        excel_file = "Book1.xlsx"
        if not os.path.exists(excel_file):
            print(f"Warning: {excel_file} not found. Starting with empty database.")
            return

        print(f"Initializing database from {excel_file}...")

        # Read Excel file
        df = pd.read_excel(excel_file)
        print(f"Found {len(df)} rows in Excel file")

        imported = 0
        client_first_seen = {}
        client_order_counter = {}

        for index, row in df.iterrows():
            # Get client name
            client_name = str(row.get('Client', '')).strip()

            if not client_name or client_name == 'nan':
                continue

            # Track chronological order
            global_order = index + 1

            # Track when this client first appeared
            if client_name not in client_first_seen:
                client_first_seen[client_name] = global_order

            # Track client order
            if client_name not in client_order_counter:
                client_order_counter[client_name] = 0

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

        db.commit()
        print(f"✅ Successfully initialized database with {imported} meetings")

    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
