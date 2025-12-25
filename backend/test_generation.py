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

def generate_quiz(token):
    """Generates a quiz with 5 questions."""
    if not token:
        return

    headers = {
        "Authorization": f"Token {token}"
    }

    # Get a valid subject ID
    subject_id = None
    try:
        response = requests.get(f"{BASE_URL}/subjects/", headers=headers, timeout=10)
        if response.status_code == 200:
            subjects = response.json()
            if subjects:
                subject_id = subjects[0]['id']  # Take the first subject
                print(f"Using subject ID: {subject_id} ({subjects[0]['name']})")
            else:
                print("No subjects found. Please populate data.")
                return
        else:
            print(f"Failed to fetch subjects. Status code: {response.status_code}")
            print(response.text)
            return
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching subjects: {e}")
        return

    data = {
        "subject_id": subject_id,
        "difficulty": "medium",
        "num_questions": 5
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
