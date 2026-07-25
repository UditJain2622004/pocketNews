import os
import sys
from fastapi.testclient import TestClient

# Ensure the parent directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from auth.database import db

client = TestClient(app)

def run_tests():
    print("=== POCKETNEWS AUTHENTICATION TEST FLOW ===")
    
    if db is None:
        print("ERROR: MongoDB connection could not be established. Make sure MongoDB is running.")
        return

    # Clean up existing test user if any
    test_username = "testuser123"
    test_email = "testuser123@example.com"
    db.users.delete_one({"username": test_username})
    db.users.delete_one({"email": test_email})
    print("1. Cleaned up any old test users.")

    # Test Suggestions
    print("\n2. Testing GET /auth/suggestions...")
    response = client.get("/auth/suggestions")
    assert response.status_code == 200, f"Failed suggestions: {response.text}"
    suggestions = response.json().get("suggestions", {})
    print("Suggestions retrieved successfully. Topics available:")
    for topic, subs in list(suggestions.items())[:3]:
        print(f" - {topic}: {', '.join(subs[:2])}...")

    # Test Signup
    print("\n3. Testing POST /auth/signup...")
    signup_payload = {
        "username": test_username,
        "email": test_email,
        "password": "supersecurepassword123",
        "topics": ["Technology", "Science", "Custom Manual Topic"],
        "subtopics": ["Artificial Intelligence", "Space Exploration", "My Custom Subtopic"]
    }
    response = client.post("/auth/signup", json=signup_payload)
    assert response.status_code == 201, f"Signup failed: {response.text}"
    print("Signup succeeded:", response.json())

    # Test Login
    print("\n4. Testing POST /auth/login...")
    login_payload = {
        "username_or_email": test_username,
        "password": "supersecurepassword123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200, f"Login failed: {response.text}"
    token_data = response.json()
    assert "access_token" in token_data, "Access token not in response"
    print("Login succeeded! Token type:", token_data["token_type"])
    token = token_data["access_token"]

    # Test Get Profile (/auth/me)
    print("\n5. Testing GET /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200, f"Profile check failed: {response.text}"
    profile = response.json()
    print("Profile retrieved successfully:")
    print(" - Username:", profile["username"])
    print(" - Email:", profile["email"])
    print(" - Selected Topics:", profile["topics"])
    print(" - Selected Subtopics:", profile["subtopics"])

    # Clean up test user
    db.users.delete_one({"username": test_username})
    print("\n6. Cleaned up test user successfully.")
    print("\n=== ALL TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\nTEST ASSERTION FAILED: {str(e)}")
    except Exception as e:
        print(f"\nTEST ERROR OCCURRED: {str(e)}")
