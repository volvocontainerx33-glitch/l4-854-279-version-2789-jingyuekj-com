(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function getCardText(card) {
    return [
      card.dataset.title,
      card.dataset.categoryName,
      card.dataset.year,
      card.dataset.type,
      card.dataset.region,
      card.dataset.tags,
      card.textContent
    ].join(" ").toLowerCase();
  }

  function setupFilterPanel() {
    var grid = document.querySelector("[data-filter-grid]");
    var input = document.querySelector("[data-filter-input]");
    var category = document.querySelector("[data-filter-category]");
    var sort = document.querySelector("[data-sort-select]");
    var count = document.querySelector("[data-result-count]");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    cards.forEach(function (card, index) {
      card.dataset.defaultIndex = index;
      card.dataset.searchText = getCardText(card);
    });

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedCategory = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || card.dataset.searchText.indexOf(keyword) !== -1;
        var matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
        var show = matchesKeyword && matchesCategory;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });

      if (sort) {
        var mode = sort.value;
        var sortedCards = cards.slice().sort(function (a, b) {
          if (mode === "views") {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (mode === "likes") {
            return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
          }
          if (mode === "year") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          return Number(a.dataset.defaultIndex || 0) - Number(b.dataset.defaultIndex || 0);
        });
        sortedCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (count) {
        count.textContent = "显示 " + visible + " 部影片";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (category) {
      category.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card grid\">",
      "  <a class=\"poster-wrap\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + " 封面\" loading=\"lazy\">",
      "    <span class=\"play-pill\" aria-hidden=\"true\">▶</span>",
      "    <span class=\"year-pill\">" + escapeHtml(movie.year) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"card-meta\"><a href=\"" + movie.categoryUrl + "\">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.description) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-site-search-input]");
    var clear = document.querySelector("[data-site-search-clear]");
    var results = document.querySelector("[data-site-search-results]");
    var count = document.querySelector("[data-site-search-count]");
    var data = window.MOVIE_SEARCH_INDEX || [];

    if (!input || !results || !count) {
      return;
    }

    function render() {
      var keyword = normalize(input.value);
      if (!keyword) {
        results.innerHTML = "";
        count.textContent = "请输入关键词开始搜索。";
        return;
      }

      var found = data.filter(function (movie) {
        return normalize([
          movie.title,
          movie.description,
          movie.categoryName,
          movie.year,
          movie.region,
          movie.type,
          (movie.tags || []).join(" ")
        ].join(" ")).indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = found.map(createSearchCard).join("\n");
      count.textContent = found.length ? "找到 " + found.length + " 个相关结果" : "没有找到相关影片，请尝试其他关键词。";
    }

    input.addEventListener("input", render);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        input.focus();
        render();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupFilterPanel();
    setupSearchPage();
  });
})();
