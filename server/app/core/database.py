from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


engine = None
SessionLocal = None