"""
Email Configuration
Store your SendGrid credentials here (DO NOT commit to public repositories)
Uses environment variables when available (for production deployment)
"""

import os

# SendGrid Configuration
# Set SENDGRID_API_KEY environment variable in production
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", None)

# Email Settings
FROM_EMAIL = os.getenv("FROM_EMAIL", "akshit.mahajan713@gmail.com")
FROM_NAME = os.getenv("FROM_NAME", "Meeting Management Dashboard")

# Default Recipient (for testing and notifications)
DEFAULT_RECIPIENT_EMAIL = os.getenv("DEFAULT_RECIPIENT_EMAIL", "akshit.mahajan0703@gmail.com")
DEFAULT_RECIPIENT_NAME = os.getenv("DEFAULT_RECIPIENT_NAME", "Akshit")

# Email Reminder Settings
REMINDER_DAYS_THRESHOLD = int(os.getenv("REMINDER_DAYS_THRESHOLD", "7"))
REMINDER_TIME_IST = os.getenv("REMINDER_TIME_IST", "08:00")

# Email Templates
EMAIL_SUBJECT_TEMPLATE = "Meeting Reminders - {date}"
