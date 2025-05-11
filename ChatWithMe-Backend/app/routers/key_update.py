from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth_jwt import get_db
from app.utils.utils_func import get_current_user
from app.models import User
from app.schema import PublicKey

router = APIRouter()

@router.post("/update-public-key")
def update_public_key(pub_key: PublicKey, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    print("====Inside update publick key===")
    current_user.public_key = pub_key.public_key
    db.commit()
    return {
        "status" : "Success",
        "message" : "Public Key updated successfully"
    }


@router.get("/get-public-key/{username}")
def get_public_key(username: str, db: Session=Depends(get_db)):
    print("====Inside get_public_key===")
    user = db.query(User).filter(User.username==username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "status" : "Success",
        "message" : "User found successfully",
        "public_key" : user.public_key
    }
