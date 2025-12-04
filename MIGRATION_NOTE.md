# Database Migration Notice

## Important: Database Schema Update

The database schema has been updated to support chronological ordering from Excel files.

### New Fields Added:
- `global_order`: Tracks the original row order from Excel
- `client_first_appearance`: Tracks when each client first appeared in the chronological order

### What This Means:

If you had already created a `meetings.db` file from a previous version, you have two options:

#### Option 1: Delete and Recreate (Recommended)
1. Delete the existing `meetings.db` file
2. Start the server - it will create a new database with the updated schema
3. Re-import your Excel file

```bash
rm meetings.db  # or manually delete the file
python main.py
```

Then import via web interface or:
```bash
python import_data.py ../Book1.xlsx
```

#### Option 2: Manual Migration (Advanced)
If you want to keep existing data, you'll need to manually add the new columns using SQLite:

```sql
ALTER TABLE meetings ADD COLUMN global_order INTEGER DEFAULT 0;
ALTER TABLE meetings ADD COLUMN client_first_appearance INTEGER DEFAULT 0;

-- Then update the values appropriately
```

### Changes Summary:

1. **Chronological Order Preserved**: Data now displays in the same order as your Excel file, not alphabetically
2. **Client Grouping**: All meetings for the same client are grouped together
3. **All Columns Displayed**: All fields now show for every entry (displays "-" if empty)
4. **Smart Ordering**: New entries for existing clients appear within that client's group

### Testing:

After migration, verify that:
- Meetings display in chronological order by client
- All fields show for all entries
- New meetings added for existing clients appear in the correct group
