from pydantic import BaseModel

class UserCreation(BaseModel):
    username: str
    password: str

class JWTAccessToken(BaseModel):
    access_token: str
    token_type: str

class PublicKey(BaseModel):
    public_key: str