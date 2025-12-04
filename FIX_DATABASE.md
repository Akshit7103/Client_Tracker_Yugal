# Fix Database Error

You're seeing this error because the database schema has been updated but your existing `meetings.db` file doesn't have the new columns.

## Quick Fix - Choose ONE option:

---

### Option 1: Run Migration Script (Keeps Existing Data)

Run this command in the `meeting-dashboard` folder:

```bash
python migrate_database.py
```

This will:
- Add the missing columns to your existing database
- Preserve all your existing data
- Update records with proper ordering

Then start the server:
```bash
python main.py
```

---

### Option 2: Fresh Start (Delete and Recreate)

1. **Delete the old database:**
```bash
del meetings.db
```
(Or manually delete the `meetings.db` file)

2. **Start the server:**
```bash
python main.py
```
(This will create a fresh database with the correct schema)

3. **Import your Excel file:**
```bash
python import_data.py ../Book1.xlsx
```
Or use the "Import Excel" button in the web interface

---

## Recommended: Option 1 (Migration Script)

The migration script is safer and preserves your data. Just run:

```bash
python migrate_database.py
```

Then you're ready to go!
