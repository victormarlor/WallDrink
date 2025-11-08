# backend/api/migrate_emails.py
from django.contrib.auth import get_user_model
from api.fields import hash_email
from cryptography.fernet import Fernet
import base64
from django.conf import settings

User = get_user_model()

def run():
    SECRET_KEY = settings.SECRET_KEY.encode()
    FERNET_KEY = base64.urlsafe_b64encode(SECRET_KEY[:32])
    fernet = Fernet(FERNET_KEY)

    users = User.objects.all()

    for user in users:
        try:
            # Verifica si ya está encriptado
            fernet.decrypt(user.email.encode())
            print(f"✔ Ya encriptado: {user.username}")
        except:
            old_email = user.email
            user.email = fernet.encrypt(old_email.encode()).decode()
            user.email_hash = hash_email(old_email)
            user.save()
            print(f"🔐 Encriptado: {user.username} ({old_email})")
