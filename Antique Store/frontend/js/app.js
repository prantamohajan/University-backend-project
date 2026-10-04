const API = "http://localhost:5000/api/products";
let products = [];
let activeCategory = "All";
let productModal, detailModal;

document.addEventListener("DOMContentLoaded", () => {
  productModal = new bootstrap.Modal(document.getElementById("productModal"));
  detailModal = new bootstrap.Modal(document.getElementById("detailModal"));
  document.querySelectorAll("#viewTabs .tab-link").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view, btn));
  });
  document.getElementById("searchInput").addEventListener("input", renderShop);
  loadProducts();
});

function switchView(view, btn) {
  document.querySelectorAll("#viewTabs .tab-link").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("shopView").classList.toggle("d-none", view !== "shop");
  document.getElementById("manageView").classList.toggle("d-none", view !== "manage");
  if (view === "manage") renderManageTable();
}

async function loadProducts() {
  setStatus("loading", "Loading the catalog...");
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Server responded with an error");
    products = await res.json();
    document.getElementById("heroCount").textContent = products.length;
    setStatus(null);
    renderCategoryChips();
    renderShop();
    renderManageTable();
  } catch (err) {
    document.getElementById("heroCount").textContent = "—";
    setStatus(
      "error",
      'Could not reach the backend at <code>' + API + '</code>. Make sure <code>npm start</code> is running inside the <code>backend</code> folder, then <button class="btn btn-sm btn-rule" onclick="loadProducts()">Retry</button>'
    );
  }
}

function setStatus(type, html) {
  const el = document.getElementById("shopStatus");
  const grid = document.getElementById("productGrid");
  if (!type) {
    el.classList.add("d-none");
    grid.classList.remove("d-none");
    return;
  }
  el.className = "shop-status" + (type === "error" ? " error" : "");
  el.innerHTML = html;
  grid.classList.add("d-none");
}

function renderCategoryChips() {
  const wrap = document.getElementById("categoryChips");
  const cats = ["All", ...new Set(products.map(p => p.category))];
  wrap.innerHTML = cats.map(c =>
    `<button class="chip-btn ${c === activeCategory ? "active" : ""}" onclick="setCategory('${c}')">${c}</button>`
  ).join("");
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategoryChips();
  renderShop();
}

function renderShop() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const grid = document.getElementById("productGrid");
  const filtered = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
  );
  grid.innerHTML = filtered.map((p, i) => `
    <div class="col-sm-6 col-lg-4">
      <div class="product-card" onclick="openDetail('${p.id}')">
        <img src="${p.image || "https://via.placeholder.com/400x300?text=Antique"}" alt="${p.name}">
        <div class="pc-body">
          <span class="acc">No. ${String(i + 1).padStart(3, "0")}</span>
          <h3>${p.name}</h3>
          <div class="meta">${p.category} &middot; ${p.era || "Unknown era"}</div>
          <div class="footer-row">
            <span class="price">$${Number(p.price).toFixed(0)}</span>
            <span class="stock ${p.stock === 0 ? "out" : ""}">${p.stock === 0 ? "Sold" : p.stock + " in stock"}</span>
          </div>
        </div>
      </div>
    </div>
  `).join("") || `<p class="text-muted">No pieces match that search.</p>`;
}

function openDetail(id) {
  const p = products.find(x => x.id === id);
  document.getElementById("detailBody").innerHTML = `
    <img src="${p.image || "https://via.placeholder.com/700x400?text=Antique"}" alt="${p.name}">
    <span class="acc">${p.category} &middot; ${p.era || "Unknown era"}</span>
    <h2>${p.name}</h2>
    <p>${p.description || "No description provided."}</p>
    <div class="price-row">
      <span class="price">$${Number(p.price).toFixed(0)}</span>
      <span class="stock ${p.stock === 0 ? "out" : ""}">${p.stock === 0 ? "Sold" : p.stock + " in stock"}</span>
    </div>
  `;
  detailModal.show();
}

function renderManageTable() {
  const tbody = document.getElementById("manageBody");
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img class="thumb" src="${p.image}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.era || "—"}</td>
      <td>$${Number(p.price).toFixed(0)}</td>
      <td>${p.stock}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-dark me-1" data-bs-toggle="modal" data-bs-target="#productModal" onclick="openEditForm('${p.id}')">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p.id}')">Remove</button>
      </td>
    </tr>
  `).join("");
}

function openCreateForm() {
  document.getElementById("modalTitle").textContent = "Add a piece";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formError").textContent = "";
}

function openEditForm(id) {
  const p = products.find(x => x.id === id);
  document.getElementById("modalTitle").textContent = "Edit piece";
  document.getElementById("productId").value = p.id;
  document.getElementById("fName").value = p.name;
  document.getElementById("fCategory").value = p.category;
  document.getElementById("fEra").value = p.era || "";
  document.getElementById("fPrice").value = p.price;
  document.getElementById("fStock").value = p.stock;
  document.getElementById("fImage").value = p.image;
  document.getElementById("fDescription").value = p.description;
  document.getElementById("formError").textContent = "";
}

async function saveProduct() {
  const id = document.getElementById("productId").value;
  const body = {
    name: document.getElementById("fName").value,
    category: document.getElementById("fCategory").value,
    era: document.getElementById("fEra").value,
    price: document.getElementById("fPrice").value,
    stock: document.getElementById("fStock").value || 0,
    image: document.getElementById("fImage").value,
    description: document.getElementById("fDescription").value,
  };
  if (!body.name || !body.category || !body.price) {
    document.getElementById("formError").textContent = "Name, category and price are required.";
    return;
  }
  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Save failed");
    productModal.hide();
    showToast(id ? "Piece updated" : "Piece added");
    await loadProducts();
  } catch (err) {
    document.getElementById("formError").textContent = err.message;
  }
}

async function deleteProduct(id) {
  if (!confirm("Remove this piece from the collection?")) return;
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    showToast("Piece removed");
    await loadProducts();
  } catch (err) {
    showToast("Could not remove piece");
  }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2200);
}
