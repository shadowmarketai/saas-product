"""Email service — sends via SMTP if configured, logs only if not."""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html: str) -> bool:
    """Send an HTML email. Returns True on success, False if SMTP is unconfigured or fails."""
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        logger.info("SMTP not configured — skipping email to %s: %s", to, subject)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"NexaStack <{settings.SMTP_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.sendmail(settings.SMTP_USER, to, msg.as_string())

        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as exc:
        logger.error("Email send failed to %s: %s", to, exc)
        return False


def send_verification_email(to: str, token: str, frontend_url: str) -> bool:
    """Send account verification email with a tokenised link."""
    url = f"{frontend_url}/verify-email?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
      <h1 style="color:#6366F1">Verify your NexaStack account</h1>
      <p>Click the button below to verify your email address:</p>
      <a href="{url}"
         style="display:inline-block;background:#6366F1;color:white;padding:14px 28px;
                border-radius:12px;text-decoration:none;font-weight:600;margin:20px 0">
        Verify Email
      </a>
      <p style="color:#6B7280;font-size:14px">Or copy this link: {url}</p>
      <p style="color:#9CA3AF;font-size:12px">This link expires in 24 hours.</p>
    </div>
    """
    return send_email(to, "Verify your NexaStack account", html)
