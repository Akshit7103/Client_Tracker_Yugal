# Client Meeting Management Dashboard

A modern, feature-rich web application for tracking and managing client meetings, built with FastAPI and vanilla JavaScript.

![Meeting Dashboard](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

## Features

- **Client Grouping** - Organize meetings by client with collapsible sections
- **Sequential Numbering** - Auto-numbered updates per client (Update 1, Update 2, etc.)
- **Drag & Drop** - Reorder meetings within client groups
- **Inline Editing** - Click any field to edit in-place
- **Advanced Search** - Search across all meeting fields in real-time
- **Smart Filters** - Filter by meeting status and attributes
- **Excel Import/Export** - Import from existing Excel files, export to formatted Excel
- **PDF Export** - Generate clean, professional PDF reports
- **Chronological Ordering** - Maintains original order from Excel imports
- **Auto-Initialization** - Automatically loads initial data from Book1.xlsx on first deployment
- **Responsive Design** - Clean, modern UI that works on all screen sizes

## Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- Pandas for data processing

**Frontend:**
- Vanilla JavaScript
- HTML5 & CSS3
- Modern drag-and-drop API

**Export:**
- ReportLab (PDF generation)
- XlsxWriter (Excel export)

## Quick Start

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Local Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Akshit7103/Client_Tracker_Yugal.git
cd Client_Tracker_Yugal
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the application:**
```bash
python main.py
```

4. **Open your browser:**
```
http://localhost:8000
```

The application will automatically initialize with data from `Book1.xlsx` on first run.

## Deployment to Render (Recommended)

### Why Render?
- Free tier available
- Automatic SSL certificates
- Easy deployment from GitHub
- Persistent storage

### Deployment Steps:

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect repository: `Akshit7103/Client_Tracker_Yugal`
   - Configure:
     - **Name:** client-tracker (or your choice)
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan:** Free

4. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your app will be live at: `https://client-tracker-xxxx.onrender.com`

5. **Verify:**
   - Open the URL - you should see the dashboard with initial data loaded from Book1.xlsx

### Important Notes:
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- Database initializes automatically on first deployment
- Data persists across deployments

## Usage Guide

### Adding Meetings
1. Click **"+ Add Meeting"** button
2. Fill in client name and meeting details
3. Click **Save**

### Importing from Excel
1. Click the **"Import"** button
2. Select your Excel file (.xlsx or .xls)
3. **Required columns:** Client, People Connected, Actions, Next Meeting, Address, Actions Taken
4. All meetings will be imported with proper numbering

### Editing Meetings
- **Inline Edit:** Click on any field value to edit directly
- **Modal Edit:** Click the edit (✏️) icon for full edit form
- Changes save automatically

### Organizing Meetings
- **Collapse/Expand:** Click client headers to show/hide meetings
- **Reorder:** Drag and drop meeting cards within the same client
- **Delete:** Click delete (🗑️) icon and confirm

### Searching & Filtering
- **Search:** Type in search bar to filter across all fields
- **Advanced Filters:** Click "Advanced" to filter by status
- **Combined:** Search and filters work together

### Exporting Data
- **Excel Export:** Click "Excel" button to download formatted .xlsx
- **PDF Export:** Click "PDF" button to download professional report
- Exports respect current search/filter settings

## Project Structure

```
Client_Tracker_Yugal/
├── main.py                # FastAPI application & API endpoints
├── database.py            # SQLAlchemy models & database setup
├── init_data.py           # Auto-initialization script
├── import_data.py         # CLI script for importing Excel
├── Book1.xlsx             # Initial data file
├── requirements.txt       # Python dependencies
├── Procfile               # Deployment configuration
├── render.yaml            # Render configuration
├── runtime.txt            # Python version specification
├── .gitignore             # Git ignore rules
├── static/
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Styling
│   └── script.js          # Frontend JavaScript
└── meetings.db            # SQLite database (auto-generated)
```

## API Endpoints

### Meetings
- `GET /api/meetings` - Get all meetings (with optional client filter)
- `GET /api/meetings/{id}` - Get specific meeting
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `POST /api/meetings/reorder` - Reorder meetings within client

### Clients
- `GET /api/clients` - Get all unique client names

### Import/Export
- `POST /api/import-excel` - Import Excel file
- `POST /api/export/excel` - Export selected meetings to Excel
- `POST /api/export/pdf` - Export selected meetings to PDF

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

## CLI Commands

### Import Excel Data
```bash
python import_data.py path/to/your/file.xlsx
```

### Initialize Database Manually
```bash
python init_data.py
```

## Configuration

### Database
The application uses SQLite by default. For production with PostgreSQL:

1. Update `database.py`:
```python
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meetings.db")
engine = create_engine(DATABASE_URL)
```

2. Add to `requirements.txt`:
```
psycopg2-binary==2.9.9
```

3. Set `DATABASE_URL` environment variable on Render

### Environment Variables
- `PORT` - Port to run on (auto-set by platform)
- `DATABASE_URL` - Database connection string (optional)
- `PYTHON_VERSION` - Set to 3.11.0 in `runtime.txt`

## Development

### Running Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Access at http://localhost:8000
```

### Running with Uvicorn directly
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Troubleshooting

### No data showing after deployment
- Check Render logs for initialization messages
- Verify Book1.xlsx is present in repository
- Ensure init_data.py runs successfully on startup

### Build fails on Render
- Verify `runtime.txt` specifies correct Python version
- Check all dependencies in `requirements.txt`
- Review build logs for specific errors

### Database not persisting
- Render free tier includes persistent disk storage
- SQLite database file persists across deployments
- Consider PostgreSQL for production scaling

### Import fails
- Verify Excel file has required columns
- Check column names match exactly
- Ensure file is .xlsx or .xls format

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Security

- Add authentication for production use
- Use environment variables for sensitive data
- Enable CORS properly if serving external clients
- Consider rate limiting for public deployments

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/Akshit7103/Client_Tracker_Yugal/issues)
- Check existing issues for solutions

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- PDF generation with [ReportLab](https://www.reportlab.com/)
- Excel handling with [Pandas](https://pandas.pydata.org/) and [XlsxWriter](https://xlsxwriter.readthedocs.io/)
- Icons from SVG inline sources

---

**Repository:** [https://github.com/Akshit7103/Client_Tracker_Yugal](https://github.com/Akshit7103/Client_Tracker_Yugal)

Made with ❤️ for efficient client meeting management
