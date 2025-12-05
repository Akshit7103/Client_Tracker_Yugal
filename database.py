from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./meetings.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    client = Column(String, index=True)
    people_connected = Column(Text)
    actions = Column(Text)
    next_meeting = Column(String)
    address = Column(Text)
    actions_taken = Column(Text)
    meeting_date = Column(Date, nullable=True)  # Date when the meeting took place
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    client_order = Column(Integer, default=0)  # Order within client group
    global_order = Column(Integer, default=0)  # Original chronological order from Excel
    client_first_appearance = Column(Integer, default=0)  # Track when client first appeared

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)
