
from fastapi import FastAPI, Header, HTTPException
from firebase_admin import credentials, auth, initialize_app
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


import firebase_admin
import json
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "https://e-commerce-website-08.netlify.app",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE_NAME = "sign.json"


if os.environ.get("FIREBASE_SERVICE_ACCOUNT"):
    cred = credentials.Certificate(
        json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    )
else:
    cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

if not firebase_admin._apps:
    initialize_app(cred)

class User(BaseModel):
    name: str
    email: str
    age: int
    gender: str
    role:str="user"


def load_file():
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as file:
            return json.load(file)

    return []

def save_data(data):
    with open(FILE_NAME, "w") as file:
        json.dump(data, file, indent=4)



@app.post("/user")
def register_user(
    user: User,
    authorization: str = Header(...)
):


    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )

    # Get Firebase UID
    firebase_uid = decoded_token["uid"]

    users = load_file()


    for existing_user in users:

        if existing_user["id"] == firebase_uid:

            return {
                "status": "success",
                "message": "User already exists",
                "details": existing_user
            }


    new_user = {
        "id": firebase_uid,
        "name": user.name,
        "email": user.email,
        "age": user.age,
        "gender": user.gender,
        "role":user.role
    }

    users.append(new_user)

    save_data(users)

    return {
        "status": "success",
        "message": "User registered successfully",
        "details": new_user
    }
@app.get("/user")
def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )

    firebase_uid = decoded_token["uid"]

    users = load_file()

    for user in users:
        if user["id"] == firebase_uid:
            return {
                "status": "success",
                "details": user
            }

    raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )
