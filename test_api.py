import requests

try:
    url = "https://resturant-table-booking-project.vercel.app/api/auth/login"
    payload = {"email": "admin@restaurant.com", "password": "admin123"}
    resp = requests.post(url, json=payload)
    print("Status:", resp.status_code)
    print("Response:", resp.text)
except Exception as e:
    print("Error:", e)
