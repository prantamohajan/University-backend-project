# Relic & Rule — Antique Catalog (HTML/CSS/Bootstrap + Node/Express)

React বাদ দিয়ে এখন frontend plain HTML+CSS+Bootstrap দিয়ে বানানো, backend আগের মতোই Node/Express (full CRUD)। নতুন যোগ হয়েছে: কার্ডে ক্লিক করলে প্রোডাক্টের details একটা মডালে দেখা যায়।

## চালানোর নিয়ম

### 1) Backend
```
cd backend
npm install
npm start
```
চলবে http://localhost:5000 এ।

### 2) Frontend
`frontend/index.html` ব্রাউজারে ডাবল ক্লিক করে খোলো। Backend আগে চালু থাকতে হবে।

## ফাইল কোথায়
- CRUD API: `backend/server.js`
- ডেটা: `backend/data/products.json`
- পেজ: `frontend/index.html`
- রং/ডিজাইন: `frontend/css/style.css`
- JS লজিক (fetch, add/edit/delete, detail view): `frontend/js/app.js`
