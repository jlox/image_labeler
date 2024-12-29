from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt

# app = FastAPI()
security = HTTPBearer()

# Configuration
SECRET_KEY = "your-secret-key"  # Change this to a secure secret key
ALGORITHM = "HS256"

# Simple in-memory user storage
active_users = set()

class LoginRequest(BaseModel):
    name: str

class LoginResponse(BaseModel):
    token: str
    message: str

class LogoutRequest(BaseModel):
    name: str

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if not request.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required"
        )
    
    # Add user to active users
    active_users.add(request.name)
    
    # Generate JWT token
    token = jwt.encode(
        {
            'user': request.name,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return LoginResponse(
        token=token,
        message=f"Welcome {request.name}!"
    )

@app.post("/api/logout")
async def logout(
    request: LogoutRequest,
    payload: dict = Depends(verify_token)
):
    if request.name in active_users:
        active_users.remove(request.name)
    
    return {"message": "Logged out successfully"}

@app.get("/api/check-auth")
async def check_auth(payload: dict = Depends(verify_token)):
    return {"authenticated": True}

# # For development
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)