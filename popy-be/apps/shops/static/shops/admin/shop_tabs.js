(function () {
  function initShopAdminTabs() {
    const root = document.getElementById("shop-admin-tabs");
    if (!root) return;

    const nav = root.querySelector(".shop-admin-tab-nav");
    const panels = root.querySelectorAll("[data-tab-panel]");
    if (!nav || !panels.length) return;

    panels.forEach((panel, index) => {
      const heading = panel.querySelector("h2, h3");
      const label = heading ? heading.textContent.trim() : `Tab ${index + 1}`;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "shop-admin-tab" + (index === 0 ? " is-active" : "");
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.setAttribute("aria-controls", `shop-tab-panel-${index}`);
      button.id = `shop-tab-${index}`;
      button.textContent = label;
      nav.appendChild(button);

      panel.id = `shop-tab-panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = index !== 0;

      button.addEventListener("click", () => {
        nav.querySelectorAll(".shop-admin-tab").forEach((tab) => {
          tab.classList.remove("is-active");
          tab.setAttribute("aria-selected", "false");
        });
        panels.forEach((item) => {
          item.hidden = true;
        });

        button.classList.add("is-active");
        button.setAttribute("aria-selected", "true");
        panel.hidden = false;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShopAdminTabs);
  } else {
    initShopAdminTabs();
  }
})();
