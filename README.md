# Client Meeting Management Dashboard

A modern, feature-rich web application for tracking and managing client meetings with automated email reminders.

![Meeting Dashboard](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Akshit7103/Client_Tracker_Yugal.git
cd Client_Tracker_Yugal

# Install dependencies
pip install -r requirements.txt

# Run application
python main.py

# Open browser to http://localhost:8000
```

## ✨ Key Features

- **Client Management** - Organize meetings by client with auto-numbering
- **Calendar View** - Visual calendar with meeting scheduling
- **Drag & Drop** - Reorder meetings within client groups
- **Inline Editing** - Quick edits with click-to-edit fields
- **Bulk Operations** - Select and delete multiple meetings
- **Excel & PDF Export** - Professional reports and data export
- **Email Reminders** - Automated reminders for upcoming meetings (SendGrid)
- **Undo/Redo** - Full history tracking for all changes
- **Smart Search** - Real-time filtering across all fields
- **Meeting Dates** - Track update dates and next meeting countdowns

## 📚 Complete Documentation

**See [DOCUMENTATION.md](DOCUMENTATION.md) for:**
- Detailed usage guide
- Email integration setup
- API reference
- Deployment instructions
- Troubleshooting
- Configuration options

## 🌐 Deploy to Render

1. Push to GitHub
2. Create account at [render.com](https://render.com)
3. Create new Web Service
4. Connect this repository
5. Deploy automatically

**Configuration:**
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🛠️ Tech Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Email:** SendGrid API
- **Export:** ReportLab (PDF), XlsxWriter (Excel)

## 📧 Email Features

- Automated reminders for meetings within 7 days
- Beautiful HTML emails with color-coded urgency
- One-click testing from dashboard
- SendGrid integration (setup required)

See [DOCUMENTATION.md](DOCUMENTATION.md#email-integration) for setup.

## 📖 API Endpoints

- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `POST /api/meetings/bulk-delete` - Bulk delete
- `POST /api/export/excel` - Export to Excel
- `POST /api/export/pdf` - Export to PDF
- `POST /api/email/send-reminder` - Send email reminder

Full API docs: [DOCUMENTATION.md](DOCUMENTATION.md#api-reference)

## 🗂️ Project Structure

```
Client_Tracker_Yugal/
├── main.py              # FastAPI application
├── database.py          # Database models
├── email_service.py     # Email functionality
├── email_scheduler.py   # Email scheduling
├── static/              # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── DOCUMENTATION.md     # Complete documentation
```

## 🔒 Security Note

**Never commit sensitive files:**
- `email_config.py` contains API keys (already in .gitignore)
- Configure email settings separately for each deployment
- See documentation for email setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/Akshit7103/Client_Tracker_Yugal/issues)
- **Documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)

---

**Version:** 2.0.0
**Repository:** https://github.com/Akshit7103/Client_Tracker_Yugal

Made with ❤️ for efficient client meeting management
