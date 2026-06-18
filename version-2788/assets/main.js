(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var menuButton = document.querySelector(".menu-toggle");
        if (header && menuButton) {
            menuButton.addEventListener("click", function () {
                header.classList.toggle("nav-open");
            });
        }

        document.querySelectorAll(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || input.value.trim() === "") {
                    event.preventDefault();
                }
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }
            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    play();
                });
            });
            if (slides.length > 1) {
                play();
            }
        }

        var filterRoot = document.querySelector("[data-filter-root]");
        if (filterRoot) {
            var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
            var typeSelect = filterRoot.querySelector("[data-filter-type]");
            var yearSelect = filterRoot.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".filter-card"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (keywordInput && query) {
                keywordInput.value = query;
            }
            function filterCards() {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var matchKeyword = keyword === "" || haystack.indexOf(keyword) !== -1;
                    var matchType = typeValue === "" || (card.getAttribute("data-type") || "") === typeValue;
                    var matchYear = yearValue === "" || (card.getAttribute("data-year") || "") === yearValue;
                    card.classList.toggle("hidden-by-filter", !(matchKeyword && matchType && matchYear));
                });
            }
            [keywordInput, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filterCards);
                    control.addEventListener("change", filterCards);
                }
            });
            filterCards();
        }
    });
}());
