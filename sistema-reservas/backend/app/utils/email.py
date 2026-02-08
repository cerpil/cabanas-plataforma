from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM = os.getenv("MAIL_FROM", "reservas@cabanasnamata.com.br"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME = "Cabanas na Mata",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True,
    TEMPLATE_FOLDER = Path(__file__).parent.parent / 'templates',
)

fm = FastMail(conf)

async def enviar_voucher_email(email_to: str, reserva_data: dict):
    message = MessageSchema(
        subject=f"Seu Voucher de Reserva - Cabanas na Mata (Unidade {reserva_data['cabana_numero']})",
        recipients=[email_to],
        template_body=reserva_data,
        subtype=MessageType.html,
    )
    
    await fm.send_message(message, template_name="voucher.html")
