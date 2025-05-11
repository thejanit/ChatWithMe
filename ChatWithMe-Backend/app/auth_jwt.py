from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .db_connection import SessionaLocal
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # in minutes

pwd_context = CryptContext(schemes=["bcrypt"])

def get_db():
    db_session = SessionaLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def make_pwd_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_pwd, hashed_pwd):
    return pwd_context.verify(plain_pwd, hashed_pwd)

def create_jwt_access_token(data: dict, expires_delta: timedelta=None):
    encoded_data = data.copy()
    expiration_time = datetime.utcnow() + (expires_delta or timedelta(minutes=1))
    encoded_data.update({
        "expired" : int(expiration_time.timestamp())
    })
    print("encoded_data", encoded_data)
    return jwt.encode(encoded_data, SECRET_KEY, algorithm=ALGORITHM)

