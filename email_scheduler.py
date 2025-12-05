"""
Email Scheduler for Meeting Reminders
Sends automated daily reminders at 8 AM IST for meetings within 7 days
"""

import schedule
import time
from datetime import datetime, timedelta
import pytz
from sqlalchemy.orm import Session
from database import get_db, Meeting
from email_service import EmailService
from email_config import (
    SENDGRID_API_KEY,
    FROM_EMAIL,
    DEFAULT_RECIPIENT_EMAIL,
    DEFAULT_RECIPIENT_NAME,
    REMINDER_DAYS_THRESHOLD,
    REMINDER_TIME_IST
)
import re


class MeetingReminderScheduler:
    """Scheduler for automated meeting reminder emails"""

    def __init__(self):
        """Initialize the scheduler with email service"""
        self.email_service = EmailService(
            api_key=SENDGRID_API_KEY,
            from_email=FROM_EMAIL
        )
        self.ist_timezone = pytz.timezone('Asia/Kolkata')

    def parse_next_meeting_date(self, next_meeting_str: str):
        """
        Parse the next meeting date from the string format
        Expected format: "Fri, Dec 6, 2024" or similar
        """
        if not next_meeting_str or next_meeting_str == '-':
            return None

        # Extract date pattern like "Fri, Dec 6, 2024"
        date_match = re.search(
            r'([A-Za-z]{3}),\s+([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})',
            next_meeting_str
        )

        if not date_match:
            return None

        try:
            # Parse the date
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            month_str = date_match.group(2)
            day = int(date_match.group(3))
            year = int(date_match.group(4))

            month = month_names.index(month_str) + 1

            return datetime(year, month, day)
        except (ValueError, IndexError):
            return None

    def calculate_days_until(self, meeting_date: datetime) -> int:
        """Calculate days until a meeting"""
        if not meeting_date:
            return None

        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        meeting_date = meeting_date.replace(hour=0, minute=0, second=0, microsecond=0)

        delta = meeting_date - today
        return delta.days

    def get_upcoming_meetings(self, db: Session) -> list:
        """
        Get all meetings within the next 7 days

        Returns:
            List of meeting dictionaries with parsed data
        """
        all_meetings = db.query(Meeting).all()
        upcoming_meetings = []

        today = datetime.now()

        for meeting in all_meetings:
            # Check next_meeting field
            if meeting.next_meeting:
                meeting_date = self.parse_next_meeting_date(meeting.next_meeting)
                if meeting_date:
                    days_until = self.calculate_days_until(meeting_date)

                    # Only include meetings within threshold and not past
                    if days_until is not None and 0 <= days_until <= REMINDER_DAYS_THRESHOLD:
                        upcoming_meetings.append({
                            'id': meeting.id,
                            'client': meeting.client,
                            'next_meeting': meeting.next_meeting,
                            'meeting_date': meeting_date,
                            'days_left': days_until,
                            'people_connected': meeting.people_connected or '-',
                            'actions': meeting.actions or '-',
                            'address': meeting.address or '-',
                            'actions_taken': meeting.actions_taken or '-'
                        })

        # Sort by days_left (most urgent first)
        upcoming_meetings.sort(key=lambda x: x['days_left'])

        return upcoming_meetings

    def send_daily_reminder(self):
        """Send daily meeting reminder email"""
        print("\n" + "=" * 60)
        print(f"Running Daily Meeting Reminder")
        print(f"Time: {datetime.now(self.ist_timezone).strftime('%Y-%m-%d %I:%M %p IST')}")
        print("=" * 60)

        try:
            # Get database session
            db = next(get_db())

            # Get upcoming meetings
            upcoming_meetings = self.get_upcoming_meetings(db)

            if not upcoming_meetings:
                print("INFO: No upcoming meetings in the next 7 days")
                print("No email sent.")
                return

            print(f"SUCCESS: Found {len(upcoming_meetings)} upcoming meeting(s)")

            # Send reminder email
            success = self.email_service.send_meeting_reminder_email(
                to_email=DEFAULT_RECIPIENT_EMAIL,
                meetings=upcoming_meetings,
                recipient_name=DEFAULT_RECIPIENT_NAME
            )

            if success:
                print(f"SUCCESS: Reminder email sent successfully to {DEFAULT_RECIPIENT_EMAIL}")

                # Log the meetings included
                print("\nMeetings included in reminder:")
                for meeting in upcoming_meetings:
                    print(f"  - {meeting['client']} - {meeting['next_meeting']} ({meeting['days_left']} days)")
            else:
                print("ERROR: Failed to send reminder email")

        except Exception as e:
            print(f"ERROR: Error sending daily reminder: {str(e)}")
        finally:
            db.close()

        print("=" * 60 + "\n")

    def start(self):
        """Start the scheduler"""
        print("\n" + "=" * 60)
        print("Meeting Reminder Scheduler Started")
        print("=" * 60)
        print(f"Reminder Time: {REMINDER_TIME_IST} IST (Daily)")
        print(f"Reminder Threshold: {REMINDER_DAYS_THRESHOLD} days")
        print(f"Recipient: {DEFAULT_RECIPIENT_EMAIL}")
        print("=" * 60 + "\n")

        # Schedule daily reminder at specified time IST
        schedule.every().day.at(REMINDER_TIME_IST).do(self.send_daily_reminder)

        print(f"SUCCESS: Scheduled daily reminder at {REMINDER_TIME_IST} IST")
        print("Press Ctrl+C to stop the scheduler\n")

        # Run the scheduler
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n\nScheduler stopped by user")


def test_reminder_now():
    """Test the reminder email immediately (for testing purposes)"""
    print("\nTesting Meeting Reminder Email")
    print("This will send a test email immediately\n")

    scheduler = MeetingReminderScheduler()
    scheduler.send_daily_reminder()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Run test immediately
        test_reminder_now()
    else:
        # Start the scheduler
        scheduler = MeetingReminderScheduler()
        scheduler.start()
