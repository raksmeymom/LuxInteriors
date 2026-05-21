# 🪑 LuxInteriors

Modern Home Furniture & Decor — full-stack website.

## Project Structure

```
luxinteriors/
├── backend/
│   ├── config/
│   │   └── db.js                  ← App config (port, env, DB URI)
│   ├── controllers/
│   │   ├── productController.js   ← Product logic
│   │   ├── contactController.js   ← Contact form logic
│   │   └── newsletterController.js← Newsletter logic
│   ├── middleware/
│   │   ├── logger.js              ← Request logger
│   │   └── errorHandler.js        ← Global error handler
│   ├── models/
│   │   ├── productModel.js        ← Product data / queries
│   │   └── contactModel.js        ← Contact & subscriber store
│   ├── routes/
│   │   ├── productRoutes.js       ← GET /api/products
│   │   ├── contactRoutes.js       ← POST /api/contact
│   │   └── newsletterRoutes.js    ← POST /api/newsletter
│   └── server.js                  ← Express entry point
│
├── frontend/
│   ├── pages/
│   │   ├── index.html             ← Home (hero + shop + contact)
│   │   ├── shop.html              ← Full shop page
│   │   ├── contact.html           ← Standalone contact page
│   │   └── about.html             ← About us page
│   └── public/
│       ├── css/
│       │   ├── style.css          ← Main styles & variables
│       │   ├── animations.css     ← Keyframes & reveal classes
│       │   └── responsive.css     ← Breakpoints
│       ├── js/
│       │   ├── main.js            ← Cursor, nav, reveal, toast
│       │   ├── products.js        ← Product grid & filtering
│       │   └── contact.js         ← Contact form & newsletter
│       └── images/                ← Static images folder
│
├── .env                           ← PORT=3000, NODE_ENV=development
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| GET    | /api/products            | All products (filter + sort)        |
| GET    | /api/products/:id        | Single product                      |
| GET    | /api/products/categories | All categories                      |
| POST   | /api/contact             | `{ name, email, subject, message }` |
| POST   | /api/newsletter          | `{ email }`                         |

## Setup

```bash
npm install
npm start        # → http://localhost:3000
npm run dev      # with auto-reload
```
