import smtplib
from email.message import EmailMessage
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from app.config import Settings


class MailService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def send_password_reset(self, email: str, token: str) -> bool:
        if not self.settings.smtp_host:
            return False
        parsed = urlsplit(self.settings.password_reset_url)
        query = dict(parse_qsl(parsed.query))
        query["token"] = token
        reset_url = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))
        message = EmailMessage()
        message["From"] = self.settings.smtp_from
        message["To"] = email
        message["Subject"] = "Redefinição de senha — Octacore"
        message.set_content(f"Use este endereço para redefinir sua senha: {reset_url}\n\nSe você não solicitou a alteração, ignore esta mensagem.")
        smtp_class = smtplib.SMTP_SSL if self.settings.smtp_secure else smtplib.SMTP
        with smtp_class(self.settings.smtp_host, self.settings.smtp_port, timeout=15) as smtp:
            if not self.settings.smtp_secure:
                smtp.starttls()
            if self.settings.smtp_user and self.settings.smtp_password:
                smtp.login(self.settings.smtp_user, self.settings.smtp_password)
            smtp.send_message(message)
        return True

