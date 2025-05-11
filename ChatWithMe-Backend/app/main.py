from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from app import schema
from app.auth_jwt import *
from app.models import User, Messages
from app.db_connection import *
from app.routers import chat_web_socket, key_update

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(key_update.router)
app.include_router(chat_web_socket.router)

# ... Configurations ... Start
ALLOWED_ORIGINS = ["https://chatwithme-frontend.onrender.com"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins = ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ... Configurations ... End


# ... Main Functionality ...
@app.get("/")
def main():
    return {
        "Welcome !! Ready to Chat with me..."
    }


@app.post("/register")
def user_register(user: schema.UserCreation, db: Session=Depends(get_db)):
    new_user = User(username=user.username, password=make_pwd_hash(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status_code" : 200,
        "message" : f"{user.username.title()} has been created successfully."
    }


@app.post("/login", response_model=schema.JWTAccessToken)
def user_login(user: schema.UserCreation, db: Session=Depends(get_db)):
    existing_user = db.query(User).filter(User.username==user.username).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail=f"{user.username.title()} is an invalid user. Please try with correct credentials.")
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail=f"Incorrect Password!!!. Please try with correct credentials.")
    
    access_token = create_jwt_access_token({
        "current_user" : existing_user.username
    })
    
    return {
        "status_code" : 200,
        "token_type" : "Bearer",
        "access_token" : access_token
    }


print(app.routes)