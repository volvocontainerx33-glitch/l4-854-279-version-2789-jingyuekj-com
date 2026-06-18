(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initFilters() {
    var lists = document.querySelectorAll("[data-movie-list]");
    if (!lists.length) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector('[data-filter-select="type"]');
    var yearSelect = document.querySelector('[data-filter-select="year"]');
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var text = normalize(input ? input.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      var yearValue = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;
      lists.forEach(function (list) {
        Array.prototype.forEach.call(list.children, function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var typeMatch = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
          var yearMatch = !yearValue || normalize(card.getAttribute("data-year")).indexOf(yearValue) !== -1;
          var textMatch = !text || haystack.indexOf(text) !== -1;
          var show = typeMatch && yearMatch && textMatch;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
      });
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    apply();
  }

  function initStartLinks() {
    var links = document.querySelectorAll("[data-start-player]");
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var button = document.querySelector(".player-cover-button");
        if (button) {
          button.click();
        }
        var section = document.querySelector(".player-section");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  window.initMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
      return;
    }
    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector(".player-cover-button") : null;
    var hlsInstance = null;

    function attach() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      attach();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(function () {
    initMenu();
    initFilters();
    initStartLinks();
  });
})();
