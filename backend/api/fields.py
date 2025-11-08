# backend/api/fields.py
import base64
import hashlib
from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet

# Clave secreta para Fernet (reversible y segura)
SECRET_KEY = settings.SECRET_KEY.encode()
FERNET_KEY = base64.urlsafe_b64encode(SECRET_KEY[:32])
fernet = Fernet(FERNET_KEY)

def hash_email(value):
    """Devuelve un hash SHA256 del email en minúsculas para búsquedas seguras"""
    return hashlib.sha256(value.lower().encode()).hexdigest()

class EncryptedEmailField(models.EmailField):
    """Campo Email encriptado reversible usando Fernet"""
    def get_prep_value(self, value):
        if value:
            return fernet.encrypt(value.encode()).decode()
        return value

    def from_db_value(self, value, expression, connection):
        if value:
            try:
                return fernet.decrypt(value.encode()).decode()
            except Exception:
                return value
        return value

    def to_python(self, value):
        if value and isinstance(value, str):
            try:
                return fernet.decrypt(value.encode()).decode()
            except Exception:
                return value
        return value
