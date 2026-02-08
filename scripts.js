const API_URL = 'https://trekos-backend.onrender.com/api';

// LOGIN
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', data.isAdmin);
        localStorage.setItem('userId', data.userId);
        alert("Амжилттай нэвтэрлээ!");

        if (data.isAdmin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        document.getElementById('login-error').textContent = data;
      }
    } catch (err) {
      document.getElementById('login-error').textContent = 'Сервертэй холбогдож чадсангүй';
    }
  });
}

// REGISTER
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        alert("Амжилттай бүртгэгдлээ! Одоо нэвтрэнэ үү.");
        window.location.href = 'login.html';
      } else {
        document.getElementById('register-error').textContent = data;
      }
    } catch (err) {
      document.getElementById('register-error').textContent = 'Сервертэй холбогдож чадсангүй';
    }
  });
}

// 🧾 Admin хэсэг

const token = localStorage.getItem('token');
const isAdmin = localStorage.getItem('isAdmin') === 'true';

// ❌ Admin биш бол хуудаснаас хөөнө
if (window.location.pathname.includes('admin.html') && !isAdmin) {
  alert('Та админ эрхгүй байна');
  window.location.href = 'login.html';
}

// ✅ Admin - Бараа нэмэх форм
const addForm = document.getElementById('add-product-form');
if (addForm) {
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = Number(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, image })
      });

      if (res.ok) {
        alert('Амжилттай нэмлээ!');
        addForm.reset();
        fetchProducts();
      } else {
        alert('Алдаа гарлаа.');
      }
    } catch (err) {
      alert('Сервертэй холбогдож чадсангүй.');
    }
  });
}

// 🧾 Одоо байгаа бүтээгдэхүүнүүдийг авч харуулах
const productList = document.getElementById('product-list');
async function fetchProducts() {
  if (!productList) return;
  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();
  productList.innerHTML = '';
  products.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${p.image}" width="50" />
      <strong>${p.name}</strong> - ${p.price}₮
      <button onclick="deleteProduct('${p._id}')">Устгах</button>
    `;
    productList.appendChild(li);
  });
}

async function deleteProduct(id) {
  const ok = confirm('Та энэ барааг устгахдаа итгэлтэй байна уу?');
  if (!ok) return;

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      alert('Устгагдлаа');
      fetchProducts();
    }
  } catch (err) {
    alert('Алдаа гарлаа.');
  }
}

if (productList) {
  fetchProducts();
}

// 🛒 Сагсанд захиалга илгээх
function submitOrder() {
  if (cart.length === 0) {
    alert("Сагс хоосон байна!");
    return;
  }

  const userId = localStorage.getItem('userId') || 'guest';

  fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      cart,
      total: totalPrice
    })
  })
    .then(res => res.json())
    .then(data => {
      alert("Захиалга амжилттай илгээгдлээ!");
      cart = [];
      totalPrice = 0;
      updateCartUI();
    })
    .catch(() => {
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    });
}
