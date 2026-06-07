import sqlite3
import json
import bcrypt
import requests

def test_login():
    res = requests.post("http://localhost:8000/api/v1/auth/login", json={
        "email": "candidate@talentai.com",
        "password": "password123"
    })
    print(res.status_code)
    print(res.json())

if __name__ == "__main__":
    test_login()
