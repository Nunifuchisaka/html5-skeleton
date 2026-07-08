const accordionButtons = document.querySelectorAll(".m-accordion__button");

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panelId = button.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (!panel) {
      return;
    }

    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
  });
});

