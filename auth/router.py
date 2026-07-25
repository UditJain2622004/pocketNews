import os
import hashlib
import logging
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, HTTPException, Depends, Header, status
from bson import ObjectId
from dotenv import load_dotenv

from auth.database import db
from auth.schemas import UserSignup, UserLogin, TokenResponse, UserProfileResponse, SuggestionResponse

load_dotenv()
logger = logging.getLogger("auth.router")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-pocket-news-key-1823908")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Predefined Suggested Interests
SUGGESTED_INTERESTS = {
    "Technology": ["Artificial Intelligence", "Web Development", "Mobile Applications", "Cybersecurity", "Blockchain"],
    "Sports": ["Cricket", "Football", "Basketball", "Tennis", "Athletics"],
    "Business": ["Finance", "Stocks", "Real Estate", "Startups", "Cryptocurrency"],
    "Entertainment": ["Movies", "Music", "Gaming", "Celebrity News", "Television"],
    "Science": ["Space Exploration", "Physics", "Biology", "Environment", "Medicine"],
    "Lifestyle": ["Health & Fitness", "Travel", "Food & Cooking", "Fashion", "DIY"]
}

# Cryptography Helpers
def hash_password(password: str) -> tuple:
    salt = os.urandom(16).hex()
    pwdhash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return pwdhash, salt

def verify_password(password: str, pwdhash: str, salt: str) -> bool:
    new_hash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    ).hex()
    return new_hash == pwdhash

# JWT Helpers
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Routes
@router.get("/suggestions", response_model=SuggestionResponse)
def get_suggestions():
    """
    Returns a predefined list of suggested topics and their corresponding subtopics.
    """
    return {"suggestions": SUGGESTED_INTERESTS}

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignup):
    """
    Registers a new user, hashes their password, and saves their interest profile.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection is unavailable.")

    # Check username unique
    if db.users.find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check email unique
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    pwd_hash, salt = hash_password(user_data.password)

    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": pwd_hash,
        "salt": salt,
        "topics": user_data.topics,
        "subtopics": user_data.subtopics,
        "language": user_data.language,
        "created_at": datetime.utcnow()
    }

    try:
        db.users.insert_one(user_doc)
        return {"message": "User registered successfully"}
    except Exception as e:
        logger.error(f"Error inserting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register user")

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    """
    Authenticates a user and returns a JWT access token.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection is unavailable.")

    # Find user by username or email
    user = db.users.find_one({
        "$or": [
            {"username": login_data.username_or_email},
            {"email": login_data.username_or_email}
        ]
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Verify password
    if not verify_password(login_data.password, user["password_hash"], user["salt"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Issue access token
    token = create_access_token({"user_id": str(user["_id"]), "username": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserProfileResponse)
def get_me(user_id: str = Depends(get_current_user_id)):
    """
    Retrieves the currently authenticated user's profile and interests.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection is unavailable.")

    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid User ID structure")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "topics": user.get("topics", []),
        "subtopics": user.get("subtopics", []),
        "language": user.get("language", "english")
    }
