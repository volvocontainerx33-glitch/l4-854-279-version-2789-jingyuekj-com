(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let index = 0;
  let timer = null;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  if (slides.length) {
    showSlide(0);
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      });
    });
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const clearButton = document.querySelector('[data-filter-clear]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function filterCards() {
    if (!filterInput) {
      return;
    }
    const query = filterInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      const matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      filterCards();
      filterInput.focus();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    const button = document.querySelector('[data-player-button]');
    let hls = null;
    let ready = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add('hidden');
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
