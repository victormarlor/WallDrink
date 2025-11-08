# WallDrink

Web platform for buyers and sellers where the price of drinks and food can **fluctuate dynamically** based on demand and other factors.  
The goal is to give local venues (bars, restaurants, shops) tools to experiment with **dynamic pricing** while keeping a smooth experience for end users.

> Original project context: internal tool for managing prices of products in hospitality venues.

---

## ✨ Main Features (current state)

- 🔐 **Authentication & accounts**
  - User registration, login, password reset
  - Email-based account activation
  - JWT-based authentication (via `dj-rest-auth` + `djangorestframework-simplejwt`)

- 🏪 **Shops & products**
  - CRUD for shops and products
  - Product images and shop images
  - Basic seller vs buyer flows

- 📈 **Dynamic pricing logic (WIP)**
  - Structure prepared for storing prices, orders and time-based changes
  - The idea is to adjust prices based on demand / activity
  - Some parts are still in progress / experimental

- 🧾 **Orders**
  - Simple cart and order flow
  - Buyers can create orders for products from shops

- 🌐 **Frontend**
  - React + Vite SPA
  - Pages for home, login/register, dashboards, shop and product views

---

## 🧱 Tech Stack

**Backend**

- Python / Django
- Django REST Framework
- `dj-rest-auth` + `django-allauth`
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `Pillow` for image handling
- SQLite for local development

**Frontend**

- React + Vite
- Context API for cart and auth state
- CSS files per component/page

---

## 🗂️ Project structure (high level)

```text
backend/
  backend/          # Django project settings, URLs, ASGI/WGI
  api/              # Core app: models, serializers, views, urls, tokens
  media/            # Local media (ignored in git)
  manage.py

frontend/
  src/
    pages/          # Main screens (Home, Login, Dashboard, Products, etc.)
    components/     # Reusable UI components
    context/        # Cart and auth context
  public/
  vite.config.js
```

# 🚀 How to run it locally
## 1. Backend (Django API)

From the project root:
```text
cd backend

# (optional) Create & activate virtualenv
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a .env file inside backend/ (same folder as manage.py):

DJANGO_SECRET_KEY=change_me_dev_key
EMAIL_HOST_USER=dummy@example.com
EMAIL_HOST_PASSWORD=dummy_password


These values are only for local dev. In production, secrets must come from a secure environment.

Run migrations and start the dev server:
```
python manage.py migrate
python manage.py runserver
```

The API should be available at:
http://127.0.0.1:8000/

## 2. Frontend (React + Vite)

From the project root:
```
cd frontend
npm install
npm run dev
```

By default Vite will run on something like:
http://localhost:5173/

The frontend expects the backend at http://localhost:8000/.

## 🔐 Security notes

No real credentials are committed to this repository.

SECRET_KEY and email credentials are loaded from environment variables (see .env.example below).

backend/media/, venv/, node_modules/ and any SQLite DB are ignored via .gitignore.

This repo is intended to demonstrate:

Backend + frontend integration

REST API design

Dynamic pricing/domain modelling

## 🧪 Tests / status

Right now the main focus is on the core flows (auth, shops, products, orders).
Formal automated test coverage is minimal / WIP. If you fork this repo and want to extend it, a good first contribution would be:

Add unit tests around the pricing logic

Add integration tests for auth + orders

## 🗺️ Roadmap / TODO

Improve dynamic pricing algorithm and expose it clearly through the API

Add admin/UI tools for configuring pricing rules per shop/product

Add proper test suite (pytest or Django tests)

Docker setup for easier local spin-up

CI (GitHub Actions) to run tests and linting on PRs
