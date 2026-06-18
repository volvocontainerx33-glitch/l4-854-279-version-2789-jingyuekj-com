(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    setSlide(index);
    start();
  });

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var target = document.getElementById(id);
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      if (target) {
        target.scrollBy({ left: direction * 420, behavior: 'smooth' });
      }
    });
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function fillYearOptions() {
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    if (!selects.length) {
      return;
    }
    var years = Array.prototype.slice.call(document.querySelectorAll('[data-card]')).map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean).filter(function (value, index, array) {
      return array.indexOf(value) === index;
    }).sort(function (a, b) {
      return Number(b) - Number(a);
    });
    selects.forEach(function (select) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      });
    });
  }

  function applyQueryFromUrl() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }
  }

  function filterCards() {
    var input = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var query = normalize(input && input.value);
    var year = normalize(yearSelect && yearSelect.value);
    var category = normalize(categorySelect && categorySelect.value);

    document.querySelectorAll('[data-card]').forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre')
      ].join(' '));
      var ok = true;
      if (query && haystack.indexOf(query) === -1) {
        ok = false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        ok = false;
      }
      if (category && normalize(card.getAttribute('data-category')) !== category) {
        ok = false;
      }
      card.classList.toggle('is-hidden', !ok);
    });
  }

  fillYearOptions();
  applyQueryFromUrl();
  document.querySelectorAll('[data-filter-input], [data-filter-year], [data-filter-category]').forEach(function (control) {
    control.addEventListener('input', filterCards);
    control.addEventListener('change', filterCards);
  });
  filterCards();
})();
