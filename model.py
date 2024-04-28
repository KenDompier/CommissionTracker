from pydantic import BaseModel, Field


class Commission(BaseModel):
    _id: str
    mongodb_id: str = Field(alias="_id")
    title: str
    description: str
    status: str
    width: str
    color: str
    date: str


class CommissionRequest(BaseModel):
    title: str
    description: str
    status: str
    width: str
    color: str
    date: str


class User(BaseModel):
    username: str
    password: str