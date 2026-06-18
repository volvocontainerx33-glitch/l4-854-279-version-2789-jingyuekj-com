
(function () {
    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-overlay");
        var message = document.getElementById("player-message");
        var hlsInstance = null;
        var attached = false;

        if (!video || !overlay || !videoUrl) {
            return;
        }

        function showMessage() {
            if (message) {
                message.hidden = false;
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage();
                    }
                });
                return;
            }
            video.src = videoUrl;
        }

        function start() {
            attach();
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("error", showMessage);
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
