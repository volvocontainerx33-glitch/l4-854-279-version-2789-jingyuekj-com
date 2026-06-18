
(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
    }

    function setupFilters() {
        var input = document.querySelector("[data-search-input]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var reset = document.querySelector("[data-filter-reset]");
        if (!cards.length || (!input && !selects.length)) {
            return;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function getData(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category"),
                card.getAttribute("data-genre")
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input ? normalize(input.value) : "";
            var active = {};
            selects.forEach(function (select) {
                active[select.getAttribute("data-filter-select")] = normalize(select.value);
            });
            cards.forEach(function (card) {
                var haystack = getData(card);
                var match = !query || haystack.indexOf(query) !== -1;
                Object.keys(active).forEach(function (key) {
                    if (active[key]) {
                        var value = normalize(card.getAttribute("data-" + key));
                        match = match && value.indexOf(active[key]) !== -1;
                    }
                });
                card.classList.toggle("is-hidden", !match);
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                selects.forEach(function (select) {
                    select.value = "";
                });
                apply();
            });
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
