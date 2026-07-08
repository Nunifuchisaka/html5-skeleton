const gnavHeader = document.querySelector(".js_header_1");

if (gnavHeader) {
  const trigger = gnavHeader.querySelector(".js_header_1_trigger");
  const gnavBody = gnavHeader.querySelector(".js_gnav_1");
  const megaItems = gnavHeader.querySelectorAll(".js_gnav_1_item_mega");
  const pcQuery = window.matchMedia("(min-width: 768px)");

  let closeTimer = null;
  let activeItem = null;

  const closeMega = (item) => {
    item.classList.remove("is_open");
    item.querySelector(".js_gnav_1_link").setAttribute("aria-expanded", "false");
    item.querySelector(".js_gnav_1_toggle").setAttribute("aria-expanded", "false");

    if (activeItem === item) {
      activeItem = null;
    }
  };

  const openMega = (item) => {
    if (activeItem && activeItem !== item) {
      closeMega(activeItem);
    }

    item.classList.add("is_open");
    item.querySelector(".js_gnav_1_link").setAttribute("aria-expanded", "true");
    item.querySelector(".js_gnav_1_toggle").setAttribute("aria-expanded", "true");
    activeItem = item;
  };

  const closeAllMega = () => {
    megaItems.forEach((item) => closeMega(item));
    activeItem = null;
  };

  const closeDrawer = () => {
    if (!trigger || !gnavBody) {
      return;
    }
    trigger.setAttribute("aria-expanded", "false");
    gnavBody.classList.remove("is_open");
  };

  const openDrawer = () => {
    if (!trigger || !gnavBody) {
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    gnavBody.classList.add("is_open");
  };

  if (trigger && gnavBody) {
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  megaItems.forEach((item) => {
    const toggle = item.querySelector(".js_gnav_1_toggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        const isOpen = item.classList.contains("is_open");

        closeAllMega();

        if (!isOpen) {
          openMega(item);
        }
      });
    }

    item.addEventListener("mouseenter", () => {
      if (!pcQuery.matches) {
        return;
      }

      clearTimeout(closeTimer);
      openMega(item);
    });

    item.addEventListener("mouseleave", () => {
      if (!pcQuery.matches) {
        return;
      }

      closeTimer = setTimeout(() => {
        closeMega(item);
      }, 300);
    });

    item.addEventListener("focusin", () => {
      if (!pcQuery.matches) {
        return;
      }

      clearTimeout(closeTimer);
      openMega(item);
    });

    item.addEventListener("focusout", (event) => {
      if (!pcQuery.matches) {
        return;
      }

      if (item.contains(event.relatedTarget)) {
        return;
      }

      closeMega(item);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeAllMega();
    closeDrawer();
  });

  pcQuery.addEventListener("change", () => {
    closeAllMega();
    closeDrawer();
  });
}
