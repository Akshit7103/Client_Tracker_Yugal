"""
Email Configuration
Uses environment variables for production, local values for development
"""

import os

# Try to import local config first (for development)
# This file should contain your actual API keys
try:
    from email_config_local import *
    print("SUCCESS: Using local email configuration")
except ImportError:
    # Fall back to environment variables (for production)
    print("INFO: Using environment variables for email configuration")

    # SendGrid Configuration
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
