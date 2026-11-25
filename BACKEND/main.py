
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, auth
from pydantic import BaseModel, Field

import firebase_admin
import json
import os


# ==========================================
# 1. FIREBASE INITIALIZATION
# ==========================================

if os.environ.get("FIREBASE_SERVICE_ACCOUNT"):
    cred = credentials.Certificate(
        json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])
    )
else:
    cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


# ==========================================
# 2. FASTAPI APPLICATION
# ==========================================

app = FastAPI(title="ShopHub Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://e-commerce-website-08.netlify.app",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# 3. DATABASE FILES
# ==========================================

USER_FILE = "sign.json"
CART_FILE = "cart.json"


def load_file(filename):
    if os.path.exists(filename):
        with open(filename, "r") as file:
            return json.load(file)
    return []


def save_data(filename, data):
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


# ==========================================
# 4. FIREBASE TOKEN VERIFICATION
# ==========================================

def get_user_uid(authorization):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )

    parts = authorization.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    try:
        decoded_token = auth.verify_id_token(parts[1])
        return decoded_token["uid"]

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )


# ==========================================
# 5. PYDANTIC MODELS
# ==========================================

class User(BaseModel):
    name: str
    email: str
    age: int
    gender: str
    role: str = "user"


class CartItem(BaseModel):
    id: int
    name: str
    price: float
    image: str
    quantity: int = 1


class QuantityUpdate(BaseModel):
    quantity: int = Field(ge=0)


# ==========================================
# 6. USER REGISTRATION
# ==========================================

@app.post("/user")
def register_user(
    user: User,
    authorization: str = Header(...)
):

    firebase_uid = get_user_uid(authorization)

    users = load_file(USER_FILE)

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
        "role": user.role
    }

    users.append(new_user)

    save_data(USER_FILE, users)

    return {
        "status": "success",
        "message": "User registered successfully",
        "details": new_user
    }


# ==========================================
# 7. GET USER PROFILE
# ==========================================

@app.get("/user")
def get_current_user(
    authorization: str = Header(...)
):

    firebase_uid = get_user_uid(authorization)

    users = load_file(USER_FILE)

    for user in users:

        if user["id"] == firebase_uid:

            return {
                "status": "success",
                "details": user
            }

    raise HTTPException(
        status_code=404,
        detail="User not found"
    )


# ==========================================
# 8. ADD PRODUCT TO CART
# ==========================================

@app.post("/item")
def add_item(
    product: CartItem,
    authorization: str = Header(None)
):

    uid = get_user_uid(authorization)

    products = load_file(CART_FILE)

    for item in products:

        if item["uid"] == uid and item["id"] == product.id:

            item["quantity"] += 1

            save_data(CART_FILE, products)

            return {
                "message": "Product quantity increased",
                "product": item
            }

    product_data = {
        "uid": uid,
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "quantity": 1
    }

    products.append(product_data)

    save_data(CART_FILE, products)

    return {
        "message": "Product added",
        "product": product_data
    }


# ==========================================
# 9. GET USER CART
# ==========================================

@app.get("/items")
def get_items(
    authorization: str = Header(None)
):

    uid = get_user_uid(authorization)

    products = load_file(CART_FILE)

    user_products = [
        item for item in products
        if item["uid"] == uid
    ]

    return user_products


# ==========================================
# 10. REMOVE PRODUCT FROM CART
# ==========================================

@app.delete("/item/{product_id}")
def remove_item(
    product_id: int,
    authorization: str = Header(None)
):

    uid = get_user_uid(authorization)

    products = load_file(CART_FILE)

    user_item_exists = any(
        item["uid"] == uid and item["id"] == product_id
        for item in products
    )

    if not user_item_exists:
        raise HTTPException(
            status_code=404,
            detail="Product not found in your cart"
        )

    updated_products = [
        item for item in products
        if not (
            item["uid"] == uid
            and item["id"] == product_id
        )
    ]

    save_data(CART_FILE, updated_products)

    return {
        "message": "Product removed successfully",
        "product_id": product_id
    }


# ==========================================
# 11. UPDATE CART QUANTITY
# ==========================================

@app.put("/item/{product_id}/quantity")
def update_quantity(
    product_id: int,
    data: QuantityUpdate,
    authorization: str = Header(None)
):

    uid = get_user_uid(authorization)

    cart = load_file(CART_FILE)

    found = False
    updated_cart = []

    for item in cart:

        if item["uid"] == uid and item["id"] == product_id:

            found = True

            if data.quantity > 0:
                item["quantity"] = data.quantity
                updated_cart.append(item)

        else:
            updated_cart.append(item)

    if not found:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    save_data(CART_FILE, updated_cart)

    return {
        "message": "Cart quantity updated"
    }


# ==========================================
# 12. ROOT ROUTE
# ==========================================

@app.get("/")
def home():
    return {
        "message": "ShopHub Backend is running successfully!"
    }
