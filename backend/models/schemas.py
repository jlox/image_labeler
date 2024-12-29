from pydantic import BaseModel
from typing import List

class Selection(BaseModel):
    x: float
    y: float
    width: float
    height: float

class ImageSelections(BaseModel):
    image_id: str
    selections: List[Selection]

class Image(BaseModel):
    image_id: str
    image_url: str