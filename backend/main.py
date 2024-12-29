from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import csv
from pathlib import Path
import logging
# import account

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Selection(BaseModel):
    x: float
    y: float
    width: float
    height: float
    transcription: Optional[str] = ""
    confidence: Optional[str] = ""
    user: str
    image_name: str
    image_url: str
    timestamp: str

class ImageSelections(BaseModel):
    image_id: str
    image_name: str
    selections: List[Selection]

class Image(BaseModel):
    image_id: str
    image_url: str

# Create data directory if it doesn't exist
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

@app.get("/whiteboards")
async def get_images():
    # logger.debug('debug message')
    try:
        with open('./whiteboards.csv', 'r') as file:
            rows = csv.reader(file)
            next(rows, None)
            whiteboards = []
            for row in rows:
              whiteboards.append(Image(image_id=row[0], image_url=row[1]))
            return {"whiteboards": whiteboards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_selections_file(image_id: str) -> Path:
    return DATA_DIR / f"selections_{image_id}.json"

@app.get("/user/{user_id}/image/{image_id}/selections")
async def get_selections(user_id: str, image_id: str):
    file_path = get_selections_file(image_id)
    if not file_path.exists():
        return {"selections": []}
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            # logger.debug(data)
            # data = [item for item in data if item["user"] == user_id]
            # logger.debug(data)
        return {"selections": {image_id: data}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-selections/")
async def save_selections(data: ImageSelections):
    file_path = get_selections_file(data.image_id)
    
    try:
        # Convert selections to list of dicts
        selections_data = [
            {
                "x": selection.x,
                "y": selection.y,
                "width": selection.width,
                "height": selection.height,
                "transcription": selection.transcription,
                "user": selection.user,
                "confidence": selection.confidence,
                "image_name": selection.image_name,
                "image_url": selection.image_url,
                "timestamp": selection.timestamp,
            }
            for selection in data.selections
        ]
        
        # Save to file
        with open(file_path, "w") as f:
            json.dump(selections_data, f, indent=2)
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export")
async def prepare_export_data():
    data_dir = Path("data")
    if not data_dir.exists():
        raise HTTPException(status_code=404, detail="Data directory not found")
    
    all_data = []
    processed_files = []
    
    for json_file in data_dir.glob("*.json"):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            if isinstance(data, list):
                all_data.extend(data)
                processed_files.append(json_file.name)
            else:
                print(f"Warning: {json_file} does not contain a list of records, skipping")
                
        except json.JSONDecodeError:
            print(f"Error: {json_file} is not a valid JSON file")
        except Exception as e:
            print(f"Error processing {json_file}: {str(e)}")
    
    if not all_data:
        raise HTTPException(
            status_code=404,
            detail="No valid data found in JSON files"
        )
    
    return {
        "data": all_data,
        "processed_files": processed_files,
        "total_records": len(all_data)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)