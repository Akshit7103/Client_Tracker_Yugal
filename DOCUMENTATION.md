# Client Meeting Management Dashboard - Complete Documentation

A modern, feature-rich web application for tracking and managing client meetings with automated email reminders.

![Meeting Dashboard](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Deployment](#deployment)
5. [Usage Guide](#usage-guide)
6. [Email Integration](#email-integration)
7. [Bulk Operations](#bulk-operations)
8. [Calendar View](#calendar-view)
9. [API Reference](#api-reference)
10. [Project Structure](#project-structure)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## Features

### Core Features
- **Client Grouping** - Organize meetings by client with collapsible sections
- **Sequential Numbering** - Auto-numbered updates per client (Update 1, Update 2, etc.)
- **Drag & Drop** - Reorder meetings within client groups
- **Inline Editing** - Click any field to edit in-place
- **Advanced Search** - Search across all meeting fields in real-time
- **Smart Filters** - Filter by meeting status and attributes
- **Calendar View** - Visual calendar showing all scheduled meetings
- **Meeting Date Tracking** - Track when each update was recorded
- **Next Meeting Dates** - Schedule and track upcoming meetings with countdown badges

### Data Management
- **Excel Import/Export** - Import from existing Excel files, export to formatted Excel
- **PDF Export** - Generate clean, professional PDF reports
- **Bulk Delete** - Select and delete multiple meetings at once
- **Undo/Redo** - Revert changes with full history tracking
- **Chronological Ordering** - Maintains original order from Excel imports
- **Auto-Initialization** - Automatically loads initial data from Book1.xlsx on first deployment

### Email Features
- **Automated Reminders** - Send email reminders for upcoming meetings
- **7-Day Window** - Includes meetings scheduled within next 7 days
- **Beautiful HTML Emails** - Professional, color-coded email templates
- **Test Functionality** - One-click email testing from dashboard
- **SendGrid Integration** - Reliable email delivery via SendGrid API

### UI/UX
- **Responsive Design** - Clean, modern UI that works on all screen sizes
- **Real-time Updates** - Instant feedback for all actions
- **Toast Notifications** - Non-intrusive success/error messages
- **Date Pickers** - Easy date selection for meetings
- **Custom Dropdowns** - Client selection with search functionality

---

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy ORM** - Database operations
- **SQLite Database** - Lightweight, file-based storage
- **Pandas** - Data processing and Excel handling
- **SendGrid** - Email delivery service
- **Schedule** - Task scheduling for automated emails

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 & CSS3** - Modern web standards
- **Drag-and-Drop API** - Native browser functionality

### Export & Reporting
- **ReportLab** - PDF generation
- **XlsxWriter** - Excel export with formatting

---

## Quick Start

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)
- SendGrid account (for email features, optional)

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

---

## Deployment

### Deploy to Render (Recommended)

#### Why Render?
- Free tier available
- Automatic SSL certificates
- Easy deployment from GitHub
- Persistent storage

#### Steps:

1. **Push to GitHub:**
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

#### Important Notes:
- Free tier sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- Database initializes automatically on first deployment
- Data persists across deployments

---

## Usage Guide

### Adding Meetings

1. Click **"+ Add Meeting"** button
2. Fill in client name (searchable dropdown with existing clients)
3. Add meeting details:
   - People Connected
   - Actions
   - Next Meeting
   - Address
   - Actions Taken
4. Click **Save**

### Setting Meeting Dates

**Update Header Date:**
- Click calendar icon (📅) in the update header
- Select date when this update was recorded
- Appears as badge in header

**Next Meeting Date:**
- Click calendar icon in "Next Meeting" field
- Select future meeting date
- Shows countdown badge (Today, Tomorrow, X days)
- Color-coded: Red (today), Yellow (1-3 days), Green (4-7 days)

### Importing from Excel

1. Click **"Import"** button (in export dropdown)
2. Select your Excel file (.xlsx or .xls)
3. **Required columns:**
   - Client
   - People Connected
   - Actions
   - Next Meeting
   - Address
   - Actions Taken
4. All meetings will be imported with proper numbering

### Editing Meetings

**Inline Edit:**
- Click on any field value to edit directly
- Make changes in the textarea
- Click "Save" to confirm or "Cancel" to discard

**Modal Edit:**
- Click the edit (✏️) icon for full edit form
- Modify any fields
- Save changes

**Date Editing:**
- Click calendar icons to set/change dates
- Use "Clear Date" button to remove dates

### Organizing Meetings

**Collapse/Expand:**
- Click client headers to show/hide meetings
- Useful for focusing on specific clients

**Reorder:**
- Drag and drop meeting cards using the handle (⋮⋮)
- Only works within same client group
- Order updates automatically

**Delete:**
- Click delete (🗑️) icon
- Confirm deletion in dialog

### Searching & Filtering

**Search:**
- Type in search bar to filter across all fields
- Searches: client, people, actions, address, next meeting, actions taken
- Real-time filtering as you type

**Advanced Filters:**
- Click "Filter" button to show options
- Filter by:
  - Has Next Meeting
  - No Next Meeting
  - Has Actions Taken
  - No Actions Taken
- Combine with search for precise results

### Bulk Operations

**Enable Bulk Selection:**
1. Click **"Select"** button
2. Checkboxes appear on all meeting cards
3. Select meetings you want to delete
4. Click **"Delete Selected"** in the action bar
5. Confirm bulk deletion

**Clear Selection:**
- Click "Clear Selection" to uncheck all
- Or click "Select" again to exit bulk mode

### Calendar View

**Open Calendar:**
- Click **"Calendar View"** button
- Shows monthly calendar with all meetings

**Navigate:**
- Use ◀ ▶ arrows to change months
- Click "Today" to jump to current month

**View Meetings:**
- Days with meetings show count badge
- Click any day to see meeting details
- Click meeting to jump to it in main view

### Exporting Data

**Excel Export:**
1. Click "Export" dropdown
2. Select "Excel"
3. Downloads formatted .xlsx file
4. Includes all visible meetings (respects filters)

**PDF Export:**
1. Click "Export" dropdown
2. Select "PDF"
3. Downloads professional report
4. Grouped by client with formatted details

### Undo/Redo

**Undo Changes:**
- Click undo button (↶) or press Ctrl+Z
- Reverts last action
- Works for: create, update, delete

**Redo Changes:**
- Click redo button (↷) or press Ctrl+Y
- Re-applies undone action
- History maintained for up to 50 actions

---

## Email Integration

### Setup (One-Time)

1. **Create SendGrid Account:**
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Free tier: 100 emails/day

2. **Create API Key:**
   - Go to Settings → API Keys
   - Create new key with "Mail Send" permission
   - Copy the full API key (starts with `SG.`)

3. **Verify Sender Email:**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Enter your email and verify it

4. **Configure Application:**
   - Create `email_config.py` (if not exists)
   - Add your credentials:
   ```python
   SENDGRID_API_KEY = "your-api-key-here"
   FROM_EMAIL = "your-verified-email@example.com"
   DEFAULT_RECIPIENT_EMAIL = "recipient@example.com"
   DEFAULT_RECIPIENT_NAME = "Your Name"
   ```

### Using Email Features

**Test Email:**
- Click **"Test Email"** button in header
- Sends immediate test with upcoming meetings (next 7 days)
- Check inbox for results

**Email Content:**
- Includes all meetings with next meeting date in 0-7 days
- Grouped by client
- Color-coded urgency badges
- Shows: date, people, actions, address

**Automated Scheduling:**
- Can be set up to run daily at 8 AM IST
- Requires scheduler script running continuously
- See email_scheduler.py for details

---

## Bulk Operations

### Bulk Delete Feature

**Purpose:**
Delete multiple meetings at once instead of one-by-one.

**How to Use:**

1. **Enable Selection Mode:**
   - Click "Select" button in filters section
   - Checkboxes appear on all meeting cards
   - Button turns blue when active

2. **Select Meetings:**
   - Click checkboxes to select meetings
   - Selected cards highlighted in blue
   - Count shows in action bar

3. **Delete Selected:**
   - Click "Delete Selected" button
   - Confirm in dialog
   - All selected meetings deleted

4. **Exit Mode:**
   - Click "Select" button again
   - Or click "Clear Selection"

**Keyboard Shortcut:**
- Press `Ctrl+B` (or `Cmd+B` on Mac) to toggle bulk mode

**Safety:**
- Confirmation dialog shows count
- Cannot be undone after confirmation
- Consider backing up data first

---

## Calendar View

### Features

**Monthly View:**
- Shows all meetings with dates
- Color-coded days with meetings
- Meeting count badges

**Navigation:**
- Previous/Next month arrows
- "Today" button to jump to current month
- Month and year display

**Day Details:**
- Click any day to see all meetings
- Shows meeting preview
- Click meeting to jump to main view

**Meeting Types:**
- Meetings from "Meeting Date" field
- Meetings from "Next Meeting" field
- Deduplicates overlapping dates

---

## API Reference

### Meetings API

**Get All Meetings**
```
GET /api/meetings
Query: ?client=ClientName (optional)
Response: List of meeting objects
```

**Get Single Meeting**
```
GET /api/meetings/{id}
Response: Meeting object
```

**Create Meeting**
```
POST /api/meetings
Body: {
  client: string,
  people_connected: string,
  actions: string,
  next_meeting: string,
  address: string,
  actions_taken: string,
  meeting_date: date (optional)
}
Response: Created meeting object
```

**Update Meeting**
```
PUT /api/meetings/{id}
Body: Meeting fields to update
Response: Updated meeting object
```

**Delete Meeting**
```
DELETE /api/meetings/{id}
Response: {message: "Meeting deleted successfully"}
```

**Bulk Delete**
```
POST /api/meetings/bulk-delete
Body: {meeting_ids: [1, 2, 3]}
Response: {message: "...", deleted_count: 3}
```

**Reorder Meetings**
```
POST /api/meetings/reorder
Body: {dragged_id: 1, target_id: 2}
Response: {message: "Reordered successfully"}
```

### Clients API

**Get All Clients**
```
GET /api/clients
Response: [{name: "Client Name"}, ...]
```

### Export API

**Export to Excel**
```
POST /api/export/excel
Body: {meeting_ids: [1, 2, 3]}
Response: Excel file download
```

**Export to PDF**
```
POST /api/export/pdf
Body: {meeting_ids: [1, 2, 3]}
Response: PDF file download
```

### Email API

**Send Reminder Email**
```
POST /api/email/send-reminder
Response: {
  success: boolean,
  message: string,
  count: number,
  meetings: [...]
}
```

**Get Upcoming Meetings**
```
GET /api/email/upcoming-meetings
Response: {
  count: number,
  meetings: [...]
}
```

---

## Project Structure

```
Client_Tracker_Yugal/
├── main.py                    # FastAPI application & routes
├── database.py                # SQLAlchemy models & DB setup
├── init_data.py               # Auto-initialization script
├── email_service.py           # Email service with SendGrid
├── email_scheduler.py         # Email scheduling logic
├── email_config.py           # Email configuration (not in git)
├── Book1.xlsx                 # Initial data file
├── Insurance_MoM.xlsx         # Sample data file
├── requirements.txt           # Python dependencies
├── Procfile                   # Deployment config
├── render.yaml                # Render deployment config
├── runtime.txt                # Python version
├── .gitignore                 # Git ignore rules
├── static/
│   ├── index.html            # Main HTML page
│   ├── styles.css            # All styling
│   └── script.js             # Frontend JavaScript
├── meetings.db                # SQLite database (auto-generated)
└── DOCUMENTATION.md           # This file
```

---

## Configuration

### Database

**SQLite (Default):**
- File-based, no setup required
- Located at `./meetings.db`
- Persists across restarts

**PostgreSQL (Production):**
```python
# In database.py
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meetings.db")
engine = create_engine(DATABASE_URL)
```

Add to requirements.txt:
```
psycopg2-binary==2.9.9
```

Set DATABASE_URL environment variable.

### Email Configuration

**Create `email_config.py`:**
```python
# SendGrid Configuration
SENDGRID_API_KEY = "SG.xxxx"
FROM_EMAIL = "verified@email.com"
FROM_NAME = "Meeting Management Dashboard"

# Recipients
DEFAULT_RECIPIENT_EMAIL = "recipient@email.com"
DEFAULT_RECIPIENT_NAME = "Name"

# Settings
REMINDER_DAYS_THRESHOLD = 7
REMINDER_TIME_IST = "08:00"
```

**Security:**
- File is in .gitignore
- Never commit API keys
- Use environment variables in production

### Environment Variables

- `PORT` - Server port (auto-set by hosting platform)
- `DATABASE_URL` - Database connection (optional)
- `PYTHON_VERSION` - Python version (set in runtime.txt)

---

## Troubleshooting

### Database Issues

**No data showing:**
- Check if meetings.db exists
- Verify Book1.xlsx is in root directory
- Check server logs for initialization errors
- Try: `python init_data.py` manually

**Data not persisting:**
- Ensure write permissions for meetings.db
- Check disk space
- Verify SQLite installation

### Import/Export Issues

**Excel import fails:**
- Verify file is .xlsx or .xls format
- Check required columns exist
- Ensure column names match exactly
- Try with sample Insurance_MoM.xlsx

**Export downloads empty file:**
- Check if meetings are selected/filtered
- Verify no JavaScript errors in console
- Try exporting all meetings first

### Email Issues

**401 Unauthorized:**
- API key is invalid or expired
- Create new API key in SendGrid
- Update email_config.py
- Verify key has "Mail Send" permission

**403 Forbidden:**
- Sender email not verified
- Go to SendGrid → Sender Authentication
- Verify your sender email
- Check email matches FROM_EMAIL in config

**Emails not received:**
- Check spam/junk folder
- Verify recipient email is correct
- Check SendGrid Activity Feed
- Ensure not over free tier limit (100/day)

### UI Issues

**Checkboxes not showing:**
- Hard refresh (Ctrl+F5)
- Clear browser cache
- Check browser console for errors

**Drag and drop not working:**
- Only works within same client
- Check browser supports drag API
- Try different browser

**Calendar not loading:**
- Check if meetings have valid dates
- Format should be: "Fri, Dec 6, 2024"
- Verify no JavaScript errors

### Deployment Issues

**Build fails on Render:**
- Check runtime.txt has correct Python version
- Verify requirements.txt includes all dependencies
- Review build logs for specific errors

**App crashes on startup:**
- Check environment variables are set
- Verify startup command is correct
- Review application logs
- Check database initialization

### Performance Issues

**Slow loading:**
- Too many meetings (consider pagination)
- Large Excel file imports
- Network latency
- Free tier server sleeping

**Search lagging:**
- Browser performance
- Too many simultaneous filters
- Try clearing old data

---

## Best Practices

### Data Management
- Regular backups of meetings.db
- Export to Excel periodically
- Use bulk delete carefully
- Test imports with small files first

### Email Usage
- Test before automating
- Monitor SendGrid quota
- Keep sender email verified
- Don't spam recipients

### Security
- Never commit email_config.py
- Use environment variables in production
- Add authentication for public deployments
- Enable CORS properly
- Consider rate limiting

### Maintenance
- Update dependencies regularly
- Monitor error logs
- Clean up old test data
- Backup before major changes

---

## Support & Contributing

**Issues & Questions:**
- GitHub Issues: [https://github.com/Akshit7103/Client_Tracker_Yugal/issues](https://github.com/Akshit7103/Client_Tracker_Yugal/issues)
- Check existing issues first
- Provide detailed error messages
- Include steps to reproduce

**Contributing:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- PDF generation: [ReportLab](https://www.reportlab.com/)
- Excel handling: [Pandas](https://pandas.pydata.org/) & [XlsxWriter](https://xlsxwriter.readthedocs.io/)
- Email delivery: [SendGrid](https://sendgrid.com/)
- Icons: SVG inline sources

---

**Repository:** [https://github.com/Akshit7103/Client_Tracker_Yugal](https://github.com/Akshit7103/Client_Tracker_Yugal)

**Version:** 2.0.0

**Last Updated:** December 2025

Made with ❤️ for efficient client meeting management
