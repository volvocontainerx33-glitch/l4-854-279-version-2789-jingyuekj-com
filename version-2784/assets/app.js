(function () {
  function toggleMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('.menu-toggle');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = header.classList.toggle('menu-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.getElementById('heroSlider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var input = document.getElementById('pageSearch');
    var category = document.getElementById('categoryFilter');
    var year = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    if (!cards.length) {
      return;
    }
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function matchYear(card, value) {
      if (!value) {
        return true;
      }
      var cardYear = card.getAttribute('data-year') || '';
      var yearNumber = parseInt(cardYear, 10);
      if (value === 'classic') {
        return Number.isFinite(yearNumber) ? yearNumber <= 2021 : false;
      }
      return cardYear.indexOf(value) !== -1;
    }
    function apply() {
      var q = normalize(input ? input.value : '');
      var c = category ? category.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCategory = card.getAttribute('data-category') || '';
        var ok = (!q || text.indexOf(q) !== -1) && (!c || cardCategory === c) && matchYear(card, y);
        card.classList.toggle('is-filtered-out', !ok);
      });
    }
    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  }

  window.initPlayer = function (src) {
    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('.play-overlay');
    var hlsInstance = null;
    if (!video || !src) {
      return;
    }
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = src;
    }
    function start() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    setupHero();
    setupFilters();
  });
})();
