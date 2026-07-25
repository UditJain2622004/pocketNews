from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict

class UserSignup(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    topics: List[str] = []
    subtopics: List[str] = []
    language: str = "English"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    topics: List[str]
    subtopics: List[str]
    language: str

class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    topics: List[str]
    subtopics: List[str]
    language: str

class SuggestionResponse(BaseModel):
    suggestions: Dict[str, List[str]]

class ProfileUpdateRequest(BaseModel):
    topics: List[str] = []
    subtopics: List[str] = []
    language: str = "English"


