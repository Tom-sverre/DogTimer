from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Dog(Base):
    __tablename__ = "dogs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sessions = relationship("SleepSession", back_populates="dog", cascade="all, delete")
    feedings = relationship("Feeding", back_populates="dog", cascade="all, delete")
    vet_appointments = relationship("VetAppointment", back_populates="dog", cascade="all, delete")


class SleepSession(Base):
    __tablename__ = "sleep_sessions"
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    type = Column(String, nullable=False)  # "sleep" or "awake"
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dog = relationship("Dog", back_populates="sessions")


class Feeding(Base):
    __tablename__ = "feedings"
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    time = Column(DateTime(timezone=True), nullable=False)
    food_type = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dog = relationship("Dog", back_populates="feedings")


class VetAppointment(Base):
    __tablename__ = "vet_appointments"
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    vet_name = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dog = relationship("Dog", back_populates="vet_appointments")
