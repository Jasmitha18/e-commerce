// --- Load or initialize cart ---
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- Save cart to localStorage ---
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// --- Update cart count in header ---
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  const counter = document.getElementById("cart-total");
  if (counter) counter.textContent = total;
}

// --- Add to Cart ---
function addToCart(product) {
  if (!product.name || !product.price || isNaN(product.price)) {
    alert("Product data is invalid. Please try again.");
    return;
  }

  let existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  saveCart();
  updateCartCount();
}


// --- Remove item from Cart ---
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
  updateCartCount();
  renderCartItems();
}

// --- Update Quantity ---
function updateCartItem(name) {
  const input = document.getElementById(`qty-${name}`);
  const newQty = parseInt(input?.value);
  if (newQty >= 1) {
    const item = cart.find(p => p.name === name);
    if (item) item.quantity = newQty;
    saveCart();
    updateCartCount();
    renderCartItems();
  }
}

// --- Render Cart Items ---
function renderCartItems() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const cartList = document.getElementById('cart-items');
  let total = 0;
  cartList.innerHTML = '';

  cartItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('cart-item');

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    li.innerHTML = `
      <div class="cart-left">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <strong>${item.name}</strong>
          <p>Price: ₹${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
      </div>
      <div class="cart-right">
        <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" />
        <button onclick="removeItem(${index})">Delete</button>
      </div>
    `;
    cartList.appendChild(li);
  });
  

  document.getElementById('cart-total-price').textContent = total.toFixed(2);
  document.getElementById('summary-subtotal').textContent = total.toFixed(2);
  document.getElementById('summary-tax').textContent = (total * 0.1).toFixed(2);
  document.getElementById('summary-shipping').textContent = "0";
  document.getElementById('summary-total').textContent = (total * 1.1).toFixed(2);
}


// --- Get product data from DOM ---
function getProductData(button) {
  const card = button.closest(".product-card");

  const name = card.querySelector("h3")?.textContent.trim() || "Unnamed Product";
  const image = card.querySelector("img")?.src || "images/default.jpg";

  let price = 0;
  const discountedEl = card.querySelector(".discounted-price");
  const originalEl = card.querySelector(".original-price");

  if (discountedEl && discountedEl.textContent.includes("₹")) {
    price = parseFloat(discountedEl.textContent.replace(/[₹,]/g, "").trim());
  } else if (originalEl) {
    price = parseFloat(originalEl.textContent.replace(/[₹,]/g, "").trim());
  }

  const quantity = parseInt(card.querySelector("select")?.value || "1");

  return { name, image, price, quantity };
}



// --- Handle Add to Cart Button ---
function handleAddToCart(button) {
  const product = getProductData(button);
  addToCart(product);
  showPopup(`${product.name} added to cart`);
}

// --- Show popup alert ---
function showPopup(message = '✅ Item added to cart!') {
  const popup = document.getElementById('cart-popup');
  if (!popup) return;
  popup.textContent = message;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 2500);
}

// --- Header blur on scroll ---
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (header) {
    header.style.backdropFilter = window.scrollY > 10 ? "blur(8px)" : "none";
    header.style.backgroundColor = window.scrollY > 10 ? "rgba(164, 173, 243, 0.9)" : "";
  }
});

// --- Apply Coupon ---
let couponApplied = false;
function applyCoupon() {
  const code = document.getElementById("coupon-code")?.value.trim();
  const message = document.getElementById("coupon-message");
  const subtotal = parseFloat(document.getElementById("summary-subtotal")?.textContent) || 0;

  if (code === "SHOP10" && !couponApplied) {
    const discount = subtotal * 0.10;
    const tax = (subtotal - discount) * 0.10;
    const shipping = parseFloat(document.getElementById("summary-shipping")?.textContent) || 0;
    const total = subtotal - discount + tax + shipping;

    document.getElementById("summary-tax").textContent = tax.toFixed(2);
    document.getElementById("summary-total").textContent = total.toFixed(2);
    message.textContent = "Coupon applied! You saved 10%";
    couponApplied = true;
  } else if (couponApplied) {
    message.textContent = "Coupon already applied.";
  } else {
    message.textContent = "Invalid coupon code.";
    message.style.color = "red";
  }
}

// --- Place order form validation ---
function placeOrder() {
  const name = document.querySelector('input[placeholder="Full Name"]')?.value;
  const email = document.querySelector('input[placeholder="Email"]')?.value;
  const address = document.querySelector('input[placeholder="Address"]')?.value;

  if (!name || !email || !address) {
    alert("Please fill out the required shipping information.");
    return;
  }

  alert("Order placed successfully!");
  
  // 🧹 Clear cart
  localStorage.removeItem('cart');
  cart = [];
  updateCartCount();
  renderCartItems();
}


// --- Make functions global for HTML calls ---
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItem = updateCartItem;
window.renderCartItems = renderCartItems;
window.updateCartCount = updateCartCount;
window.handleAddToCart = handleAddToCart;
window.applyCoupon = applyCoupon;
window.placeOrder = placeOrder;
