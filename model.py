from pydantic import BaseModel


class Commission(BaseModel):
    id: int
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
