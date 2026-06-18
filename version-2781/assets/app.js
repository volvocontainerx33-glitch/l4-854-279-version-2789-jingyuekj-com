(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
        });
    }

    function initHeroSliders() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var previous = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            if (previous) {
                previous.addEventListener("click", function () {
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

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            show(0);
            start();
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-zone]").forEach(function (zone) {
            var input = zone.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(zone.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(zone.querySelectorAll(".filter-card"));
            var empty = zone.querySelector("[data-empty]");

            if (!input && !selects.length) {
                return;
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter-select"),
                        value: normalize(select.value)
                    };
                });
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchSelects = activeFilters.every(function (item) {
                        if (!item.value) {
                            return true;
                        }
                        return normalize(card.getAttribute("data-" + item.key)) === item.value;
                    });
                    var isVisible = matchKeyword && matchSelects;

                    card.style.display = isVisible ? "" : "none";

                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var cover = document.querySelector("[data-play-cover]");
        var prepared = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            prepared = true;
        }

        function play() {
            prepare();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var result = video.play();

            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
                return;
            }
            video.pause();
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (cover) {
                cover.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        initNavigation();
        initHeroSliders();
        initFilters();
    });
}());
