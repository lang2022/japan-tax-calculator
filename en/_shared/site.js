(function () {
  const path = location.pathname.replace(/\/+$/, "/");
  document.querySelectorAll("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;
    const h = new URL(href, location.origin).pathname.replace(/\/+$/, "/");
    if (h === path) a.classList.add("active");
  });
})();
