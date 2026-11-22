# ShopHub – E-Commerce Website

## About the Project

ShopHub is a web-based e-commerce application developed to provide users with a simple and convenient online shopping experience. Users can explore different product categories, view products, add items to their shopping cart, and manage their shopping activities.

The project uses frontend technologies along with Python FastAPI and Firebase for backend services and authentication.

## Features

- User registration and login
- Firebase authentication
- Product categories:
  - Electronics
  - Fashion
  - Home & Kitchen
  - Sports
  - Books
  - Beauty
- Product display with images and prices
- Add to Cart functionality
- Buy Now functionality
- Shopping cart management
- Increase and decrease product quantities
- User profile management

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- Firebase Admin SDK

### Database and Authentication
- Firebase Authentication
- JSON-based data storage (current development version)

## Project Structure

```text
ShopHub/
│
├── FRONTEND/
│   ├── INDEX/
│   ├── HOME_PAGE/
│   ├── ELECTRONICS/
│   ├── FASHION/
│   ├── HOME&KITCHEN/
│   ├── SPORTS/
│   ├── BOOKS/
│   ├── BEAUTY/
│   ├── CART/
│   └── PROFILE/
│
├── BACKEND/
│   ├── cart.py
│   ├── sign.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Thanos077/E-commerce-website.git
```

### 2. Navigate to the Project Folder

```bash
cd E-commerce-website
```

### 3. Install Backend Dependencies

```bash
cd BACKEND
pip install -r requirements.txt
```

### 4. Run the Backend

Run the cart API:

```bash
uvicorn cart:app --reload --port 8000
```

Run the user API in a separate terminal:

```bash
uvicorn sign:app --reload --port 8001
```

### 5. Run the Frontend

Open the frontend login page using VS Code Live Server.

## Future Enhancements

- Online payment integration
- Order history and tracking
- Product search and filtering
- Admin product management
- Database migration to a production database

## Author

**Thanos077**

GitHub: https://github.com/Thanos077

## License

This project is developed for educational and learning purposes.
