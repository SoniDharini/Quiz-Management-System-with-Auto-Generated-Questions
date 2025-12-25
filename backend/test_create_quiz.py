import requests
import os

# API settings
BASE_URL = "http://127.0.0.1:8000/api"
with open("token.txt", "r") as f:
    TOKEN = f.read()

headers = {
    "Authorization": f"Token {TOKEN}"
}

# Test file path
file_path = os.path.join(os.path.dirname(__file__), "test_material.txt")

print("Testing Create Quiz API...")
print(f"File path: {file_path}")
print(f"File exists: {os.path.exists(file_path)}")

try:
    with open(file_path, 'rb') as f:
        files = {'file': ('test_material.txt', f, 'text/plain')}
        data = {
            'title': 'Python Basics Quiz',
            'num_questions': '5',
            'difficulty': 'medium'
        }
        
        print("\nSending request to /api/quiz/generate/file/...")
        response = requests.post(
            f"{BASE_URL}/quiz/generate/file/",
            headers=headers,
            files=files,
            data=data,
            timeout=60  # OpenAI can take time
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
except requests.exceptions.ConnectionError as e:
    print(f"\nConnection Error: {e}")
    print("Make sure the Django server is running!")
except Exception as e:
    print(f"\nError: {type(e).__name__}: {e}")
