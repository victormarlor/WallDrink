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
