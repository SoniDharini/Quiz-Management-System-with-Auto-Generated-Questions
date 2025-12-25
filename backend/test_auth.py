import requests
import json
import uuid

BASE_URL = "http://127.0.0.1:8000/api"

def generate_unique_user():
    unique_id = str(uuid.uuid4()).split('-')[0]
    return {
        "username": f"testuser_{unique_id}",
        "email": f"testuser_{unique_id}@example.com",
        "password": "testpassword123",
        "password2": "testpassword123"
    }

def test_register():
    print("Testing user registration...")
    user_data = generate_unique_user()
    url = f"{BASE_URL}/auth/register/"
    
    try:
        response = requests.post(url, json=user_data)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("Registration successful!")
            print("Response:", json.dumps(response.json(), indent=2))
            return user_data
        else:
            print("Registration failed.")
            try:
                print("Error:", json.dumps(response.json(), indent=2))
            except json.JSONDecodeError:
                print("Error: Could not decode JSON from response.")
                print("Response Text:", response.text)
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def test_login(user_data):
    print("\nTesting user login...")
    if not user_data:
        print("Skipping login test because registration failed.")
        return

    url = f"{BASE_URL}/auth/login/"
    login_credentials = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    try:
        response = requests.post(url, json=login_credentials)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Login successful!")
            response_data = response.json()
            print("Response:", json.dumps(response_data, indent=2))
            with open("token.txt", "w") as f:
                f.write(response_data["token"])
        else:
            print("Login failed.")
            try:
                print("Error:", json.dumps(response.json(), indent=2))
            except json.JSONDecodeError:
                print("Error: Could not decode JSON from response.")
                print("Response Text:", response.text)
                
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    registered_user = test_register()
    if registered_user:
        test_login(registered_user)
