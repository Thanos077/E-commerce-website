from fastapi import FastAPI, Header, HTTPException
from firebase_admin import credentials, auth, initialize_app
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


import firebase_admin
import json
import os

class QuantityUpdate(BaseModel):
    quantity: int

cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)

app=FastAPI()
FILE_NAME = "cart.json"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
class CartItem(BaseModel):
    id: int
    name: str
    price: float
    image: str
    quantity: int = 1

def load_file():
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as file:
            return json.load(file)

    return []

def save_data(data):
    with open(FILE_NAME, "w") as file:
        json.dump(data, file, indent=4)    


@app.post("/item")
def add_item(
    product: CartItem,
    authorization: str = Header(None)
):

    # 1. Check Authorization header
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )

    # 2. Get token from "Bearer TOKEN"
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    # 3. Verify Firebase token
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )

    # 4. Read cart.json
    products = load_file()

    # 5. Check whether this user already has this product
    for item in products:

        if item["uid"] == uid and item["id"] == product.id:

            # Product already exists
            item["quantity"] += 1

            save_data(products)

            return {
                "message": "Product quantity increased",
                "product": item
            }

    # 6. Product doesn't exist → create new item
    product_data = {
        "uid": uid,
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "image": product.image,
        "quantity": 1
    }

    products.append(product_data)

    # 7. Save
    save_data(products)

    return {
        "message": "Product added",
        "product": product_data
    }
@app.get("/items")
def get_items(authorization: str = Header(None)):

    # 1. Check Authorization header
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )

    # 2. Extract Firebase token
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    # 3. Verify Firebase token
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )

    # 4. Load all products
    products = load_file()

    # 5. Return only this user's products
    user_products = [
        item for item in products
        if item["uid"] == uid
    ]

    return user_products
@app.delete("/item/{product_id}")
def remove_item(
    product_id: int,
    authorization: str = Header(None)
):

    # 1. Check Authorization header
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token missing"
        )

    # 2. Extract Firebase token
    try:
        parts = authorization.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise ValueError("Invalid authorization format")

        token = parts[1]

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    # 3. Verify Firebase token
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )

    # 4. Load products
    products = load_file()

    # 5. Find this user's product
    user_item_exists = any(
        item["uid"] == uid and item["id"] == product_id
        for item in products
    )

    if not user_item_exists:
        raise HTTPException(
            status_code=404,
            detail="Product not found in your cart"
        )

    # 6. Remove only this user's product
    updated_products = [
        item for item in products
        if not (
            item["uid"] == uid
            and item["id"] == product_id
        )
    ]

    # 7. Save updated cart
    save_data(updated_products)

    return {
        "message": "Product removed successfully",
        "product_id": product_id
    }

@app.put("/item/{product_id}/quantity")
async def update_quantity(
    product_id: int,
    data: QuantityUpdate,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")

    try:
        token = authorization.split(" ")[1]
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]

        with open(FILE_NAME, "r") as file:
            cart = json.load(file)

        found = False
        updated_cart = []

        for item in cart:

            if item["uid"] == uid and item["id"] == product_id:

                found = True

                if data.quantity > 0:
                    item["quantity"] = data.quantity
                    updated_cart.append(item)

                # Quantity 0 means remove the product

            else:
                updated_cart.append(item)

        if not found:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        with open(FILE_NAME, "w") as file:
            json.dump(updated_cart, file, indent=4)

        return {"message": "Cart quantity updated"}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))