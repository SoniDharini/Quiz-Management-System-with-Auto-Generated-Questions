import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def get_token():
    """Gets an authentication token."""
    login_credentials = {
        "username": "testuser_1879523597",
        "password": "testpassword123"
    }
    url = f"{BASE_URL}/auth/login/"
    try:
        response = requests.post(url, json=login_credentials, timeout=120)
        if response.status_code == 200:
            return response.json().get("token")
        else:
            print(f"Failed to get token. Status code: {response.status_code}")
            print(response.text)
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while trying to get the token: {e}")
        return None

def generate_quiz(token):
    """Generates a quiz with 100 questions."""
    if not token:
        return

    headers = {
        "Authorization": f"Token {token}"
    }
    data = {
        "subject_id": 33,
        "difficulty": "medium",
        "num_questions": 100
    }
    url = f"{BASE_URL}/quiz/generate/"
    try:
        response = requests.post(url, headers=headers, json=data, timeout=120)
        print(f"Status Code: {response.status_code}")
        try:
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while generating the quiz: {e}")

if __name__ == "__main__":
    token = get_token()
    generate_quiz(token)
