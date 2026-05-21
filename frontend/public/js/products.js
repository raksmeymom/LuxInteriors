// products.js — Product grid, filtering, sorting

let activeCategory = "All";
let activeSort = "";

async function loadProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.innerHTML = '<div class="loading-msg">Loading collection…</div>';

  const params = new URLSearchParams();
  if (activeCategory !== "All") params.set("category", activeCategory);
  if (activeSort) params.set("sort", activeSort);

  try {
    const res = await fetch("/api/products?" + params);
    const data = await res.json();
    const products = data.products || data.data || [];

    if (!products.length) {
      grid.innerHTML = '<div class="loading-msg">No products found.</div>';
      return;
    }

    grid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card reveal" data-id="${p.id}">
        <div class="product-img" style="position:relative;overflow:hidden;aspect-ratio:4/3;background:#1a1714">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ""}
          <img
            src="${p.img}"
            alt="${p.name}"
            style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease"
            onerror="this.style.opacity='.2'"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          />
        </div>
        <div class="product-body">
          <div class="product-cat">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.description || ""}</div>
          <div class="product-footer">
            <div class="product-price">$${parseFloat(p.price).toLocaleString()}</div>
            <div class="product-rating"><span>★</span> ${p.rating}</div>
          </div>
        </div>
        <button class="product-add" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}')">+</button>
      </div>
    `,
      )
      .join("");

    // Scroll reveal
    document.querySelectorAll(".product-card.reveal").forEach((el) => {
      new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) e.target.classList.add("in");
        },
        { threshold: 0.1 },
      ).observe(el);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML =
      '<div class="loading-msg" style="color:#e07070">Could not load products.</div>';
  }
}

// Add to cart (calls API if logged in, else prompts login)
async function addToCart(productId, productName) {
  const token = localStorage.getItem("lux_token");
  if (!token) {
    showToast("Please log in to add items to cart", false);
    setTimeout(() => (window.location.href = "/pages/login.html"), 1200);
    return;
  }
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const d = await res.json();
    showToast(
      d.success ? `✓ ${productName} added to cart` : d.message || "Error",
      d.success,
    );
  } catch {
    showToast("Could not add to cart", false);
  }
}

window.filterCat = (cat) => {
  activeCategory = cat;
  document
    .querySelectorAll(".filter-pill")
    .forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
  loadProducts();
};

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      loadProducts();
    });
  });

  const sortSel = document.getElementById("sort-select");
  if (sortSel)
    sortSel.addEventListener("change", (e) => {
      activeSort = e.target.value;
      loadProducts();
    });
});
