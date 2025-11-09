# 🍹 WallDrink

**WallDrink** is a full-stack web platform that enables **dynamic pricing for food and beverage venues** — bars, restaurants, and shops can adjust product prices in real time based on demand and sales patterns.  

The goal is to bring **flexible, data-driven pricing** to the hospitality sector while maintaining a clean and user-friendly experience for buyers and sellers.

> 🧠 Originally developed during an **internship project**, later refactored and published as an open-source learning reference.

---

## 🚀 Features

### 🔐 Authentication & Accounts
- User registration, login, logout, and password reset  
- Email-based account activation  
- JWT authentication using `dj-rest-auth` + `djangorestframework-simplejwt`

### 🏪 Shops & Products
- Create and manage shops and their products  
- Upload product and shop images  
- Role-based flows for **sellers** and **buyers**

### 💸 Dynamic Pricing (in progress)
- Backend structure ready for price tracking and adjustment  
- Concept: automatic price fluctuation based on order volume and time  
- Prototype logic for real-time updates (to be expanded)

### 🧾 Orders & Cart
- Basic shopping cart and order creation  
- Simple order history and order-item tracking  

### 🌐 Frontend
- **React + Vite** single-page app  
- Clean, component-based design  
- Responsive layout for desktop and mobile

---

## 🧱 Tech Stack

| Layer | Technologies |
|:------|:--------------|
| **Backend** | Django 4 · Django REST Framework · dj-rest-auth · allauth · simplejwt · cors-headers · Pillow |
| **Frontend** | React 18 · Vite 5 · Context API · Fetch API |
| **Database** | SQLite (for local development) |
| **Dev Tools** | Git · npm · pip · venv |

---

## 🗂️ Project Structure

```text
backend/
  backend/      # Django project settings, URLs, ASGI/WGI
  api/          # Core app: models, serializers, views, urls, tokens
  media/        # Local media files (ignored in git)
  manage.py

frontend/
  src/
    pages/      # Main views (Home, Login, Dashboard, Products, etc.)
    components/ # Reusable UI components
    context/    # Cart & auth state
  public/
  vite.config.js
```

---

## 🧩 Getting Started

### ▶️ Backend (Django API)

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file inside `/backend`:

```env
DJANGO_SECRET_KEY=change_me_dev_key
EMAIL_HOST_USER=dummy@example.com
EMAIL_HOST_PASSWORD=dummy_password
```

Then run:

```bash
python manage.py migrate
python manage.py runserver
```

Backend API → http://127.0.0.1:8000/

---

### ▶️ Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend App → http://localhost:5173/  
The frontend expects the backend running at `http://localhost:8000/`.

---

## 🔐 Security Notes

- No real credentials are stored in this repository.  
- All secrets are loaded from environment variables (`.env`).  
- Sensitive folders (`media/`, `venv/`, `node_modules/`, databases) are safely ignored via `.gitignore`.

---

## 🧪 Development Status

Currently focused on:
- Core flows (authentication, shop/product CRUD, order flow)
- Integration between backend and frontend

Next steps:
- 🧠 Improve dynamic-pricing algorithm  
- 🧩 Implement admin tools for pricing rules  
- 🧰 Add full unit + integration test coverage  
- 🐳 Optional Docker setup for quick local spin-up  
- ⚙️ Continuous Integration with GitHub Actions

---

## 💡 What I Learned

Developing **WallDrink** strengthened my experience with:
- Building **REST APIs** using Django REST Framework  
- Managing secure authentication with JWT and session-based logic  
- Integrating **React + Django** into a cohesive full-stack workflow  
- Structuring code for scalability and clean separation of concerns  

---

## 📸 Preview
<p align="center">
  <img src="frontend/src/assets/IsologoWallDrink.png" width="120" alt="WallDrink logo" />
</p>

---

## 🧑‍💻 Author

**Víctor Marlor**  
Full-stack Developer · Django · React · Python · JavaScript  
[GitHub @victormarlor](https://github.com/victormarlor)

---

## ⚖️ License

Released under the **MIT License** – you’re free to use, modify, and learn from this code for non-commercial and educational purposes.
