(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"], input[type="search"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length > 0) {
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    startTimer();
  }

  var listingInput = document.querySelector('[data-movie-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var activeChip = 'all';

  function applyListingFilter() {
    if (!cards.length) {
      return;
    }
    var query = listingInput ? listingInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var searchable = card.getAttribute('data-search') || '';
      var type = (card.getAttribute('data-type') || '').toLowerCase();
      var matchedText = !query || searchable.indexOf(query) !== -1;
      var matchedChip = activeChip === 'all' || type.indexOf(activeChip) !== -1 || searchable.indexOf(activeChip) !== -1;
      card.classList.toggle('is-hidden', !(matchedText && matchedChip));
    });
  }

  if (listingInput) {
    listingInput.addEventListener('input', applyListingFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = (chip.getAttribute('data-filter-chip') || 'all').toLowerCase();
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyListingFilter();
    });
  });

  var searchResults = document.getElementById('search-results');
  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var pageInput = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');
    if (pageInput) {
      pageInput.value = q;
    }

    function renderSearch(query) {
      var normalized = query.toLowerCase();
      if (!normalized) {
        searchResults.innerHTML = '';
        if (status) {
          status.textContent = '请输入关键词开始搜索。';
        }
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (status) {
        status.textContent = matched.length ? '已为你找到相关影片。' : '没有找到匹配影片。';
      }
      searchResults.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="./' + movie.url + '">',
          '<img src="./' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="score-pill">' + movie.rating + '</span>',
          '<span class="play-pill">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
          '<h3><a href="./' + movie.url + '">' + movie.title + '</a></h3>',
          '<p>' + movie.oneLine + '</p>',
          '<div class="card-tags"><span>' + movie.category + '</span><span>' + movie.genre + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    renderSearch(q);
    if (pageInput) {
      pageInput.addEventListener('input', function () {
        renderSearch(pageInput.value.trim());
      });
    }
  }
})();
