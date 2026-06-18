(function () {
    function setupPlayer() {
        var video = document.getElementById("moviePlayer");
        var mask = document.getElementById("playMask");
        var button = document.getElementById("playButton");
        if (!video || typeof streamUrl !== "string" || streamUrl.length === 0) {
            return;
        }
        var loaded = false;
        var hls = null;
        function tryPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        function loadStream() {
            if (loaded) {
                tryPlay();
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.load();
                tryPlay();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    tryPlay();
                });
                return;
            }
            video.src = streamUrl;
            video.load();
            tryPlay();
        }
        function start(event) {
            if (event) {
                event.preventDefault();
            }
            if (mask) {
                mask.classList.add("is-hidden");
            }
            loadStream();
        }
        if (mask) {
            mask.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
    if (document.readyState !== "loading") {
        setupPlayer();
    } else {
        document.addEventListener("DOMContentLoaded", setupPlayer);
    }
}());
