from sqlalchemy.orm import Session
from app.models import User, Messages

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def save_chat_messages_to_db(db: Session, sender_id: int, receiver_id: int, nonce_enc: str, message_enc: str, is_message_delivered: bool):
    message = Messages(sender_id=sender_id, receiver_id=receiver_id, nonce_enc=nonce_enc, message_enc=message_enc, is_message_delivered=is_message_delivered)
    db.add(message)
    db.commit()
    return message

def get_undelivered_messages(db: Session, receiver_id: int):
    undelivered_message = db.query(Messages).filter(Messages.receiver_id==receiver_id, Messages.is_message_delivered==False).order_by(Messages.timestamp.asc()).all()
    return undelivered_message

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()