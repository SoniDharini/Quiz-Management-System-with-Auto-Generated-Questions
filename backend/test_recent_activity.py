
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def get_token():
    """Gets an authentication token from token.txt."""
    try:
        with open("token.txt", "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        print("Error: token.txt not found. Please run test_auth.py first to generate a token.")
        return None

def get_recent_activity(token):
    """Gets recent activity for the user."""
    if not token:
        return

    headers = {
        "Authorization": f"Token {token}"
    }

    url = f"{BASE_URL}/user/activity/"
    try:
        response = requests.get(url, headers=headers, timeout=120)
        print(f"Status Code: {response.status_code}")
        try:
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while getting recent activity: {e}")

if __name__ == "__main__":
    token = get_token()
    get_recent_activity(token)
