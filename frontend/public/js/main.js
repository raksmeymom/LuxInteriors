// main.js — Cursor, nav scroll, mobile menu, scroll reveal

// Custom cursor
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
if (cursor && ring) {
  let mx = -100,
    my = -100,
    rx = -100,
    ry = -100;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";
  });
  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animRing);
  })();
  document
    .querySelectorAll("a,button,.cat-card,.product-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () =>
        document.body.classList.add("cursor-grow"),
      );
      el.addEventListener("mouseleave", () =>
        document.body.classList.remove("cursor-grow"),
      );
    });
}

// Nav scroll
const nav = document.getElementById("nav");
if (nav)
  window.addEventListener("scroll", () =>
    nav.classList.toggle("scrolled", scrollY > 50),
  );

// Hamburger
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
}
window.closeMobile = () => {
  hamburger?.classList.remove("open");
  mobileMenu?.classList.remove("open");
};

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Toast
window.showToast = (msg, gold = false) => {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "show" + (gold ? " gold-toast" : "");
  setTimeout(() => (t.className = ""), 3500);
};
