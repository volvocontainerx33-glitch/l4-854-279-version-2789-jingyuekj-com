(function () {
  function showMessage(player, text) {
    var message = player.querySelector('[data-player-message]');
    if (message) {
      message.textContent = text;
      message.classList.add('is-visible');
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');
    var source = player.getAttribute('data-src');
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showMessage(player, '视频加载遇到问题，请稍后重试');
          }
        });
        attached = true;
        return;
      }

      showMessage(player, '当前浏览器无法播放该视频');
    }

    function startPlayback() {
      attachSource();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
