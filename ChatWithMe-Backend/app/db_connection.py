import os
import urllib.parse
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT")
DB_HOST = os.getenv("DB_HOST")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")

ENCODED_DB_PWD = urllib.parse.quote_plus(DB_PASSWORD)

db_url = f"postgresql://{DB_USERNAME}:{ENCODED_DB_PWD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(db_url)
SessionaLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()