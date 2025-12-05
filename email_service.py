"""
SendGrid Email Service Module
Standalone module for sending emails using SendGrid API
"""

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from datetime import datetime, timedelta
from typing import List, Dict, Optional


class EmailService:
    """Email service using SendGrid"""

    def __init__(self, api_key: str, from_email: str):
        """
        Initialize the email service

        Args:
            api_key: SendGrid API key
            from_email: Sender email address (must be verified in SendGrid)
        """
        self.api_key = api_key
        self.from_email = from_email
        self.client = SendGridAPIClient(api_key)

    def send_simple_email(
        self,
        to_email: str,
        subject: str,
        content: str,
        content_type: str = "text/plain"
    ) -> bool:
        """
        Send a simple email

        Args:
            to_email: Recipient email address
            subject: Email subject
            content: Email content
            content_type: Content type (text/plain or text/html)

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                plain_text_content=content if content_type == "text/plain" else None,
                html_content=content if content_type == "text/html" else None
            )

            response = self.client.send(message)

            if response.status_code in [200, 201, 202]:
                print(f"SUCCESS: Email sent successfully to {to_email}")
                print(f"  Status Code: {response.status_code}")
                return True
            else:
                print(f"ERROR: Failed to send email. Status Code: {response.status_code}")
                return False

        except Exception as e:
            print(f"ERROR: Error sending email: {str(e)}")
            return False

    def send_meeting_reminder_email(
        self,
        to_email: str,
        meetings: List[Dict],
        recipient_name: str = "User"
    ) -> bool:
        """
        Send meeting reminder email with upcoming meetings

        Args:
            to_email: Recipient email address
            meetings: List of meeting dictionaries
            recipient_name: Name of the recipient

        Returns:
            bool: True if email sent successfully
        """
        subject = f"Meeting Reminders - {datetime.now().strftime('%B %d, %Y')}"

        # Generate HTML email content
        html_content = self._generate_meeting_reminder_html(meetings, recipient_name)

        return self.send_simple_email(
            to_email=to_email,
            subject=subject,
            content=html_content,
            content_type="text/html"
        )

    def _generate_meeting_reminder_html(
        self,
        meetings: List[Dict],
        recipient_name: str
    ) -> str:
        """Generate HTML content for meeting reminder email"""

        # Group meetings by client
        clients = {}
        for meeting in meetings:
            client = meeting.get('client', 'Unknown')
            if client not in clients:
                clients[client] = []
            clients[client].append(meeting)

        # Build HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 0 0 10px 10px;
                }}
                .greeting {{
                    font-size: 16px;
                    margin-bottom: 20px;
                }}
                .meeting-group {{
                    margin-bottom: 25px;
                    padding: 20px;
                    background: #f9fafb;
                    border-left: 4px solid #667eea;
                    border-radius: 5px;
                }}
                .client-name {{
                    font-size: 18px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 15px;
                }}
                .meeting-item {{
                    margin-bottom: 15px;
                    padding: 15px;
                    background: white;
                    border-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }}
                .meeting-date {{
                    font-weight: bold;
                    color: #059669;
                    font-size: 14px;
                    margin-bottom: 8px;
                }}
                .meeting-date.urgent {{
                    color: #dc2626;
                }}
                .meeting-date.soon {{
                    color: #f59e0b;
                }}
                .meeting-detail {{
                    margin: 5px 0;
                    font-size: 14px;
                }}
                .label {{
                    font-weight: 600;
                    color: #6b7280;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    color: #6b7280;
                    font-size: 12px;
                }}
                .days-badge {{
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-left: 8px;
                }}
                .days-badge.today {{
                    background: #fee2e2;
                    color: #dc2626;
                }}
                .days-badge.soon {{
                    background: #fef3c7;
                    color: #f59e0b;
                }}
                .days-badge.upcoming {{
                    background: #d1fae5;
                    color: #059669;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📅 Upcoming Meeting Reminders</h1>
            </div>
            <div class="content">
                <div class="greeting">
                    Hello {recipient_name},
                </div>
                <p>You have <strong>{len(meetings)}</strong> meeting(s) scheduled in the next 7 days:</p>
        """

        # Add meetings grouped by client
        for client, client_meetings in clients.items():
            html += f"""
                <div class="meeting-group">
                    <div class="client-name">🏢 {client}</div>
            """

            for meeting in client_meetings:
                next_meeting = meeting.get('next_meeting', '')
                days_left = meeting.get('days_left', None)

                # Determine urgency class
                urgency_class = "upcoming"
                badge_text = f"{days_left} days"
                if days_left == 0:
                    urgency_class = "today"
                    badge_text = "Today"
                elif days_left == 1:
                    urgency_class = "soon"
                    badge_text = "Tomorrow"
                elif days_left <= 3:
                    urgency_class = "soon"

                html += f"""
                    <div class="meeting-item">
                        <div class="meeting-date {urgency_class}">
                            📆 {next_meeting}
                            <span class="days-badge {urgency_class}">{badge_text}</span>
                        </div>
                """

                if meeting.get('people_connected'):
                    html += f"""
                        <div class="meeting-detail">
                            <span class="label">👥 People:</span> {meeting['people_connected']}
                        </div>
                    """

                if meeting.get('actions'):
                    html += f"""
                        <div class="meeting-detail">
                            <span class="label">📋 Actions:</span> {meeting['actions']}
                        </div>
                    """

                if meeting.get('address'):
                    html += f"""
                        <div class="meeting-detail">
                            <span class="label">📍 Address:</span> {meeting['address']}
                        </div>
                    """

                html += """
                    </div>
                """

            html += """
                </div>
            """

        html += f"""
                <div class="footer">
                    <p>This is an automated reminder from your Meeting Management Dashboard</p>
                    <p>Sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p IST')}</p>
                </div>
            </div>
        </body>
        </html>
        """

        return html


# Test function
def test_email_service():
    """Test the email service with sample data"""

    print("=" * 60)
    print("SendGrid Email Service Test")
    print("=" * 60)
    print()

    # Get API key and emails from user input
    api_key = input("Enter your SendGrid API Key: ").strip()
    from_email = input("Enter your verified sender email: ").strip()
    to_email = input("Enter recipient email (for testing): ").strip()
    recipient_name = input("Enter recipient name: ").strip() or "User"

    print()
    print("Initializing email service...")
    email_service = EmailService(api_key=api_key, from_email=from_email)

    # Test 1: Simple plain text email
    print("\n" + "-" * 60)
    print("Test 1: Sending simple plain text email...")
    print("-" * 60)

    success = email_service.send_simple_email(
        to_email=to_email,
        subject="Test Email from Meeting Management Dashboard",
        content="This is a test email to verify SendGrid integration is working correctly!"
    )

    if success:
        print("✓ Plain text email test passed!")
    else:
        print("✗ Plain text email test failed!")
        return

    # Test 2: Meeting reminder email with sample data
    print("\n" + "-" * 60)
    print("Test 2: Sending meeting reminder email...")
    print("-" * 60)

    sample_meetings = [
        {
            'client': 'Sunlife',
            'next_meeting': 'Mon, Dec 9, 2025',
            'days_left': 0,
            'people_connected': 'Ram Balkrishna, CAE\nLaura Money, Global CIO',
            'actions': 'Discuss compliance timeline and key focus points',
            'address': 'Toronto Office'
        },
        {
            'client': 'Sunlife',
            'next_meeting': 'Wed, Dec 11, 2025',
            'days_left': 2,
            'people_connected': 'Vikas Arora, Director Compliance',
            'actions': 'Present Success Story for FCC',
            'address': 'Virtual Meeting'
        },
        {
            'client': 'TechCorp',
            'next_meeting': 'Fri, Dec 13, 2025',
            'days_left': 4,
            'people_connected': 'John Smith, CEO',
            'actions': 'Quarterly review and planning',
            'address': 'New York Office'
        }
    ]

    success = email_service.send_meeting_reminder_email(
        to_email=to_email,
        meetings=sample_meetings,
        recipient_name=recipient_name
    )

    if success:
        print("✓ Meeting reminder email test passed!")
    else:
        print("✗ Meeting reminder email test failed!")
        return

    print("\n" + "=" * 60)
    print("All tests completed! Check your inbox.")
    print("=" * 60)


if __name__ == "__main__":
    test_email_service()
