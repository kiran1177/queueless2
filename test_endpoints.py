import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_login(phone, password, role):
    req = urllib.request.Request(f"{BASE_URL}/auth/login", method="POST")
    req.add_header('Content-Type', 'application/json')
    data = json.dumps({"phone": phone, "password": password, "role": role}).encode('utf-8')
    try:
        with urllib.request.urlopen(req, data=data) as response:
            print(response.status, response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(e.code, e.read().decode('utf-8'))

print("1. Testing Admin Login")
test_login("9876543210", "demo123", "admin")

print("\n2. Testing Citizen Login")
test_login("9876543210", "demo123", "citizen")

print("\n3. Testing Staff Login (invalid)")
test_login("9876543210", "demo123", "staff")
