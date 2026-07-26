import os
import logging
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("auth.database")

# Get MONGO_URI, default to localhost if not found
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "pocketnews")

# Initialize client lazily or on import
try:
    logger.info(f"Connecting to MongoDB database: {DB_NAME}")
    # Use certifi to provide SSL/TLS root certificates
    client = MongoClient(
        MONGO_URI, 
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    db = client[DB_NAME]
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    db = None

def setup_db_indexes():
    """
    Sets up unique indexes on username and email fields in the users collection
    """
    if db is None:
        logger.error("Database connection not established. Cannot setup indexes.")
        return
        
    try:
        # Create unique index on username
        db.users.create_index("username", unique=True)
        # Create unique index on email
        db.users.create_index("email", unique=True)
        # Listening feedback is idempotent per user and client event.
        db.listening_events.create_index([("userId", 1), ("eventId", 1)], unique=True)
        db.listening_events.create_index([("userId", 1), ("createdAt", -1)])
        db.listening_events.create_index([("userId", 1), ("storyId", 1)])
        db.listening_events.create_index([("userId", 1), ("category", 1)])
        logger.info("Successfully configured unique indexes on 'users' collection.")
    except Exception as e:
        logger.error(f"Failed to create database indexes: {str(e)}")

