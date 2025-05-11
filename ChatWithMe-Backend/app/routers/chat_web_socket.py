import json
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, Depends
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models import Messages, User
from app.auth_jwt import get_db
from app.routers.chat_db_service import *
from typing import List

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

router = APIRouter()

active_connections = {}

# ... Extract username from JWT ... 
async def get_username_from_jwt(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token.get("current_user")
    except JWTError as e:
        print("Error get_username_from_jwt: ", e)
        return None


# ... WebSocket endpoint for private chat ...
@router.websocket("/ws/chat")
async def websocket_enpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    print("================WebSocket connection attempted==========")

    # Accepting websocket connection
    await websocket.accept()
    
    init_msg = await websocket.receive_text()
    init_data = json.loads(init_msg)

    token = init_data.get("token")
    receiver_username = init_data.get("receiver_username")
    
    if not token or not receiver_username:
        await websocket.close(code=1008)
        print("Missing token or receiver_username in query params.")
        return

    username = await get_username_from_jwt(token)
    print("Current WS user:", username)
    if not username:
        await websocket.close(code=1008)
        return

    # adding to active connection..
    active_connections[username] = websocket
    print("active_connections=====> ", active_connections)
    
    # to send undelivered message to the user when they reconnect
    """
    user = get_user_by_username(db, username)
    if user:
        print("User---", user.id)
        undelivered_messages = get_undelivered_messages(db, receiver_id=user.id)
        print("== undelivered_messages ==", undelivered_messages)
        for msg in undelivered_messages:
            sender_user = get_user_by_id(db, msg.sender_id)
            print("sender_user: ", sender_user)
            receiver_user = msg.receiver.username
            print("receiver_user", receiver_user)
            
            if receiver_user in active_connections:
                print("active....")
                await active_connections[receiver_user].send_text(
                    json.dumps({
                        "type": "chat",
                        "message" : {
                            "nonce" : msg.nonce_enc,
                            "box" : msg.message_enc
                        },
                        "sender" : sender_user.username
                    })
                )
                
                msg.is_message_delivered = True
            else:
                msg.is_message_delivered = False

        db.commit()
        print("committ..t.t.t")"""

    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            encrypted_msg = data.get("message")
            
            # Getting sender id from DB
            sender = get_user_by_username(db, username)
            if not sender:
                await websocket.send_text(f"{sender} not found.")
                return

            # Getting receiver from DB
            receiver = get_user_by_username(db, receiver_username)
            if not receiver:
                await websocket.send_text(f"{receiver_username} not found.")
                return

            # Store message in DB
            print(f"sender - {sender.username}, receiver - {receiver.username}")
            save_chat_messages_to_db(
                    db, sender_id=sender.id, receiver_id=receiver.id, 
                    nonce_enc=encrypted_msg.get("nonce"), message_enc=encrypted_msg.get("box"), 
                    is_message_delivered=receiver_username in active_connections
                )

            # Send message to receiver if they're connected
            if receiver_username in active_connections:
                print("here---")
                await active_connections[receiver_username].send_text(
                    json.dumps(
                        {
                            "type": "chat",
                            "message": encrypted_msg,
                            "sender": username
                        }
                    )
                )

    except WebSocketDisconnect as e:
        print("Error websocket_endpoint:", e)
        if username in active_connections:
            del active_connections[username]
        await websocket.close()

