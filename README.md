# Meeting Management Dashboard

A modern, feature-rich web application for tracking and managing client meetings, built with FastAPI and vanilla JavaScript.

## Features

- ✅ **Client Grouping** - Organize meetings by client with collapsible sections
- ✅ **Sequential Numbering** - Auto-numbered updates per client (Update 1, Update 2, etc.)
- ✅ **Drag & Drop** - Reorder meetings within client groups
- ✅ **Inline Editing** - Click any field to edit in-place
- ✅ **Advanced Search** - Search across all meeting fields in real-time
- ✅ **Filters** - Filter by meeting status (has next meeting, actions taken, etc.)
- ✅ **Excel Import/Export** - Import from existing Excel files, export to formatted Excel
- ✅ **PDF Export** - Generate clean, professional PDF reports
- ✅ **Chronological Ordering** - Maintains original order from Excel imports
- ✅ **Responsive Design** - Clean, modern UI that works on all screen sizes

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Export**: ReportLab (PDF), XlsxWriter (Excel)
- **Data Processing**: Pandas

## Installation

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Akshit7103/Client_Tracker_Yugal.git
cd Client_Tracker_Yugal
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python main.py
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage

### Adding Meetings
1. Click the **"+ Add Meeting"** button
2. Fill in the client name and meeting details
3. Click **Save**

### Importing from Excel
1. Click the **"Import"** button
2. Select your Excel file (.xlsx or .xls)
3. Required columns: Client, People Connected, Actions, Next Meeting, Address, Actions Taken
4. All meetings will be imported with proper numbering

### Editing Meetings
- **Inline Edit**: Click on any field value to edit it directly
- **Modal Edit**: Click the edit (✏️) icon to open the full edit form

### Organizing Meetings
- **Collapse/Expand**: Click on client headers to show/hide meetings
- **Reorder**: Drag and drop meeting cards within the same client group
- **Delete**: Click the delete (🗑️) icon and confirm

### Searching & Filtering
- **Search**: Type in the search bar to filter across all fields
- **Advanced Filters**: Click "Advanced" to filter by status
- **Combined**: Search and filters work together

### Exporting Data
- **Excel Export**: Click "Excel" button to download formatted .xlsx file
- **PDF Export**: Click "PDF" button to download professional report
- Exports respect current search/filter settings

## Project Structure

```
meeting-dashboard/
├── main.py                 # FastAPI application and API endpoints
├── database.py             # SQLAlchemy models and database setup
├── import_data.py          # CLI script for importing Excel files
├── fix_update_numbers.py   # Script to fix update numbering
├── remove_meeting_date.py  # Migration script
├── requirements.txt        # Python dependencies
├── static/
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Styling
│   └── script.js          # Frontend JavaScript
└── meetings.db            # SQLite database (auto-generated)
```

## API Endpoints

### Meetings
- `GET /api/meetings` - Get all meetings
- `GET /api/meetings/{id}` - Get specific meeting
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `POST /api/meetings/reorder` - Reorder meetings

### Clients
- `GET /api/clients` - Get all client names

### Import/Export
- `POST /api/import-excel` - Import Excel file
- `POST /api/export/excel` - Export to Excel
- `POST /api/export/pdf` - Export to PDF

## Database Schema

```sql
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY,
    client VARCHAR NOT NULL,
    people_connected TEXT,
    actions TEXT,
    next_meeting VARCHAR,
    address TEXT,
    actions_taken TEXT,
    client_order INTEGER DEFAULT 0,
    global_order INTEGER DEFAULT 0,
    client_first_appearance INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Render.com
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Render will auto-detect settings from `render.yaml`
5. Deploy!

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku open
```

### Railway
1. Connect GitHub repository
2. Railway auto-detects FastAPI app
3. Deploy with one click

### Vercel (Serverless)
```bash
vercel deploy
```

## Scripts

### Fix Update Numbering
If update numbers are incorrect:
```bash
python fix_update_numbers.py
```

### Import Excel Data
Import from command line:
```bash
python import_data.py path/to/your/file.xlsx
```

## Configuration

The application uses SQLite by default. For production, you can configure PostgreSQL by modifying `database.py`:

```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meetings.db")
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Built with FastAPI
- Icons from SVG inline sources
- Design inspired by modern dashboard patterns

---

Made with ❤️ for efficient client meeting management
