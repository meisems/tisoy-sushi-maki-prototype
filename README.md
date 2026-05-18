# Tisoy Sushi Maki - Online Ordering System

A beautiful, responsive, and fully functional online food ordering website for **Tisoy Sushi Maki** — built with pure HTML, CSS, and JavaScript.

![Preview](https://via.placeholder.com/800x400?text=Tisoy+Sushi+Maki+Preview) <!-- Replace with actual screenshot later -->

## ✨ Features

- **Modern & Responsive Design** – Optimized for desktop and mobile
- **Interactive Menu** with categories (Best Sellers, Maki, Nigiri, Sets, etc.)
- **Real-time Shopping Cart** with quantity controls
- **Multiple Order Types**: Delivery, Pick-up, Dine-in
- **Fixed Delivery Fee** (₱60)
- **Checkout Form** with customer details
- **Direct Order to Facebook Messenger** – Orders are automatically sent to the business Facebook Page
- **WhatsApp Backup** option
- **Success Confirmation** modal
- **Toast Notifications**
- **Mobile-friendly** floating cart

## 🚀 Live Demo

[View Live Demo](https://tisoy-sushi-maki.onrender.com) <!-- Add your hosted link here -->

## 📸 Screenshots

*(Add screenshots here later)*

## 🛠️ Technologies Used

- HTML5
- CSS3 (Custom modern design with CSS variables)
- Vanilla JavaScript
- Fully responsive (Mobile-first)

## 📁 Project Structure

```bash
online-delivering-platform/
├── index.html ← Pure HTML markup only (no CSS/JS inline)
├── css/
│ └── styles.css ← All styles (variables, layout, responsive)
└── js/
    ├── data.js ← Menu categories & all menu items
    ├── store.js ← Store hours, open/closed status, overlay logic
    ├── cart.js ← Cart state, add/remove/qty, cart rendering
    ├── checkout.js ← Checkout form, payment, order placement
    ├── admin.js ← Owner panel (open/close toggle, custom message)
    └── app.js ← App init, nav builders, UI helpers (modals, toast, drawer)
```

## 🎯 How to Use

1. **Download** or clone the repository
2. Open `tisoytest.html` in any web browser
3. Customize menu items, prices, and content easily in the `<script>` section
4. Update your Facebook Page ID in the `placeOrder()` function (already set to your page)
5. Host it on **GitHub Pages**, Netlify, Vercel, or any web host

## 🔧 Customization

### Easy to Edit:
- Menu items and prices (in the `menu` object)
- Business name, contact numbers, address
- Delivery fee (currently ₱60)
- Facebook Page ID
- Promo banner text

## 📞 Contact Information

- **Phone**: 0995 450 8647
- **WhatsApp**: +63 991 675 8883
- **Facebook**: [Tisoy Sushi Maki](https://www.facebook.com/profile.php?id=61556171585372)
- **Email**: bayanileonilo@gmail.com
- **Location**: Cityhomes Resortville, Dasmariñas, Cavite

## 📄 License

This project is open-source and free to use for personal or commercial purposes.

---

**Made with ❤️ for Tisoy Sushi Maki**
