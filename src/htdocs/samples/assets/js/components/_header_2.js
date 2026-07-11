const header_2 = document.querySelector(".header_2");

if (header_2) {
  const searchWrap = header_2.querySelector(".header_2__search");
  const searchIcon = header_2.querySelector(".header_2__search_icon");
  const searchInput = header_2.querySelector(".header_2__search_input");

  if (searchWrap && searchIcon) {
    const setOpen = (open) => {
      searchWrap.classList.toggle("is_open", open);
      searchIcon.setAttribute("aria-expanded", String(open));
      searchIcon.setAttribute("aria-label", open ? "検索を閉じる" : "検索を開く");
      if (open && searchInput) {
        searchInput.focus();
      }
    };

    searchIcon.addEventListener("click", () => {
      setOpen(!searchWrap.classList.contains("is_open"));
    });

    document.addEventListener("click", (event) => {
      if (searchWrap.classList.contains("is_open") && !searchWrap.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && searchWrap.classList.contains("is_open")) {
        setOpen(false);
        searchIcon.focus();
      }
    });
  }

  // テキストサイズ切替はボタンの押下状態(.is_on)の切り替えのみ。
  // 実際の文字サイズ変更ロジックはヘッダー単体のサンプルの対象外。
  const textSizeButtons = header_2.querySelectorAll(".header_2__textsize_btn");
  textSizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      textSizeButtons.forEach((b) => b.classList.remove("is_on"));
      textSizeButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.classList.add("is_on");
      button.setAttribute("aria-pressed", "true");
    });
  });
}
