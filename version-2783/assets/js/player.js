(function () {
  function setStatus(player, message) {
    var status = player.querySelector("[data-player-status]");
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo(video, player) {
    var promise = video.play();
    if (promise && typeof promise.then === "function") {
      promise.then(function () {
        player.classList.add("is-playing");
        setStatus(player, "正在播放");
      }).catch(function () {
        setStatus(player, "浏览器阻止了自动播放，请再次点击视频播放。 ");
      });
    } else {
      player.classList.add("is-playing");
      setStatus(player, "正在播放");
    }
  }

  function attachHls(video, src, player) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", function () {
        playVideo(video, player);
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video, player);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(player, "播放源加载失败，请稍后重试。");
        }
      });
      player._hls = hls;
      return;
    }

    setStatus(player, "当前浏览器不支持 m3u8 播放。建议使用 Safari、Chrome 或 Edge。 ");
  }

  function setupPlayer(player) {
    var button = player.querySelector("[data-player-start]");
    var video = player.querySelector("video");
    var src = player.dataset.src;

    if (!button || !video || !src) {
      return;
    }

    button.addEventListener("click", function () {
      setStatus(player, "正在加载播放源...");
      if (!video.dataset.ready) {
        video.dataset.ready = "1";
        attachHls(video, src, player);
      } else {
        playVideo(video, player);
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        setStatus(player, "已暂停，点击视频或控制条可继续播放。 ");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(setupPlayer);
  });
})();
