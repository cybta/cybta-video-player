function csVideo(containerId, videoSrc) {
  const VideoContainer = document.getElementById(containerId);
  VideoContainer.classList.add("videoContainer");

  let activeElement,
    seekAmount = 20;

  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";
  cssLink.href = "./assets/css/style.css";
  document.body.appendChild(cssLink);

  VideoContainer.innerHTML = `
    <video class="videoplayer" id="videoPlayer">
      <source src="${videoSrc}" />
    </video>
    <div class="videoControls" id="videoControls">
      <div id="barTimeHolder" class="barTimeHolder">
        <div id="progressBar" class="progressBar" tab-index="0">
          <div id="currentTimePLay" class="currentTimePLay"></div>
        </div> 
        <div id="videoTimeDisplay" class="videoTimeDisplay"></div>
      </div>
      <div class="btns-controlls">
        <button id="seekPrev-btn" class="seekPrev-btn player-btn" title="prev"></button>
        <button id="playPause-btn" class="playPause-btn player-btn" title='play'></button>
        <button id="seekNext-btn" class="seekNext-btn player-btn" title="next"></button>
        <div class="settings" id="settings">
          <input type="range" id="volume-bar" title="volume" min="0" max="1" step="0.1" value="1">
          <button id='btnMute' class='mute' title='mute'>Mute</button>	
        </div>
      </div>
    </div>
  `;

  const videoPlayer = document.getElementById("videoPlayer");
  const videoTimeDisplay = document.getElementById("videoTimeDisplay");
  const btnPlayPause = document.getElementById("playPause-btn");
  const btnMute = document.getElementById("btnMute");
  const progressBar = document.getElementById("progressBar");
  const volumeBar = document.getElementById("volume-bar");
  const currentTimePLay = document.getElementById("currentTimePLay");
  const seekNext = document.getElementById("seekNext-btn");
  const seekPrev = document.getElementById("seekPrev-btn");
  const videoControls = document.getElementById("videoControls");

  const focusEl = (elID) => {
    activeElement = elID;
    const element = document.getElementById(elID);
    const allFocused = document.querySelectorAll(".focus");

    for (let i = 0; i < allFocused.length; i++) {
      allFocused[i].classList.remove("focus");
      allFocused[i].blur();
    }

    element.classList.add("focus");
    element.focus();
  };

  focusEl("progressBar");

  const convertIntToTime = (element) => {
    const videoDuration = videoPlayer.duration;
    const displayTime = videoDuration - element;

    const getMinutes = displayTime * (1 / 60);
    const minutes = Math.floor(getMinutes);
    let seconds = 0;

    if (getMinutes > minutes) {
      seconds = Math.round((getMinutes - minutes) * 60);
    }

    const fixTime = (elm) => {
      if (elm < 10) {
        return "0" + elm;
      } else {
        return elm;
      }
    };

    return `${fixTime(minutes)}:${fixTime(seconds)}`;
  };

  let timeToPlay;

  progressBar.addEventListener("mousemove", getMousePosition);

  const updateTimePlay = (el) => {
    const videoDuration = videoPlayer.duration;
    const fillBarWdth = progressBar.offsetWidth;
    timeToPlay = getMousePosition(el);
    const timePerc = (timeToPlay * 100) / fillBarWdth;
    const getVal = (timeToPlay * videoDuration) / fillBarWdth;

    videoPlayer.currentTime = getVal;

    const speed = 500;

    currentTimePLay.style.transition = speed + "ms";
    currentTimePLay.style.width = timePerc + "%";

    videoTimeDisplay.innerHTML = convertIntToTime(videoPlayer.currentTime);

    setTimeout(() => {
      currentTimePLay.style.transition = "0s";
    }, speed);
  };

  progressBar.addEventListener("mousedown", (e) => {
    updateTimePlay(e);
  });

  let displayvideoTime;

  const updateVideoTime = () => {
    if (videoPlayer.currentTime < videoPlayer.duration) {
      videoTimeDisplay.innerHTML = convertIntToTime(videoPlayer.currentTime);
      const timePerc = (videoPlayer.currentTime * 100) / videoPlayer.duration;

      if (
        videoPlayer.currentTime > 0 ||
        videoPlayer.currentTime !== videoPlayer.duration
      ) {
        progressBar.classList.add("showBar");
      } else {
        progressBar.classList.remove("showBar");
      }

      const speed = 500;

      currentTimePLay.style.transition = speed + "ms";
      currentTimePLay.style.width = timePerc + "%";
      setTimeout(() => {
        currentTimePLay.style.transition = "0s";
      }, speed);
    } else {
      clearInterval(displayvideoTime);
    }
  };

  function getMousePosition(e) {
    // Get the target
    const target = e.target;

    // Get the bounding rectangle of target
    const rect = target.getBoundingClientRect();

    // Mouse position
    const x = e.clientX - rect.left;

    return x;
  }

  videoPlayer.addEventListener("loadeddata", (e) => {
    if (videoPlayer.readyState >= 3) {
      videoTimeDisplay.innerHTML = convertIntToTime(videoPlayer.currentTime);
    }
  });

  // Update the video volume
  volumeBar.addEventListener("change", function (evt) {
    videoPlayer.volume = evt.target.value;
  });

  // Add a listener for the timeupdate event so we can update the progress bar
  // videoPlayer.addEventListener("timeupdate", updateProgressBar, false);

  // Add a listener for the play and pause events so the buttons state can be updated
  videoPlayer.addEventListener(
    "play",
    function () {
      // Change the button to be a pause button
      changeButtonType(btnPlayPause, "pause");
      displayvideoTime = setInterval(updateVideoTime, 1000);
    },
    false
  );

  videoPlayer.addEventListener(
    "pause",
    function () {
      // Change the button to be a play button
      changeButtonType(btnPlayPause, "play");
      clearInterval(displayvideoTime);
    },
    false
  );

  videoPlayer.addEventListener(
    "volumechange",
    function (e) {
      // Update the button to be mute/unmute
      if (videoPlayer.muted) changeButtonType(btnMute, "unmute");
      else changeButtonType(btnMute, "mute");
    },
    false
  );

  videoPlayer.addEventListener(
    "ended",
    function () {
      this.pause();
      resetPlayer();
      stopVideo();
    },
    false
  );

  progressBar.addEventListener("click", updateTimePlay);

  const playPauseVideo = () => {
    if (videoPlayer.paused || videoPlayer.ended) {
      // Change the button to a pause button
      changeButtonType(btnPlayPause, "pause");
      videoPlayer.play();
    } else {
      // Change the button to a play button
      changeButtonType(btnPlayPause, "play");
      videoPlayer.pause();
    }
  };

  // Stop the current media from playing, and return it to the start position
  const stopVideo = () => {
    videoPlayer.pause();
    if (videoPlayer.currentTime) videoPlayer.currentTime = 0;

    currentTimePLay.style.width = 0 + "%";
    videoTimeDisplay.innerHTML = convertIntToTime(videoPlayer.currentTime);
  };

  // Toggles the media player's mute and unmute status
  const muteVolume = () => {
    if (videoPlayer.muted) {
      // Change the button to a mute button
      changeButtonType(btnMute, "mute");
      videoPlayer.muted = false;
    } else {
      // Change the button to an unmute button
      changeButtonType(btnMute, "unmute");
      videoPlayer.muted = true;
    }
  };

  // Replays the media currently loaded in the player
  const replayVideo = () => {
    resetPlayer();
    videoPlayer.play();
  };

  // Updates a button's title, innerHTML and CSS class
  const changeButtonType = (btn, value) => {
    btn.title = value;
    btn.className = `playPause-btn player-btn ${value}`;
  };

  const resetPlayer = () => {
    progressBar.value = 0;
    // Move the media back to the start
    videoPlayer.currentTime = 0;
    // Set the play/pause button to 'play'
    changeButtonType(btnPlayPause, "play");
    progressBar.classList.remove("showBar");
  };

  const seekVideo = (direction) => {
    switch (direction) {
      case "next":
        videoPlayer.currentTime = videoPlayer.currentTime + seekAmount;
        break;
      case "prev":
        videoPlayer.currentTime = videoPlayer.currentTime - seekAmount;
        break;
    }

    updateVideoTime();
  };

  btnPlayPause.addEventListener("click", playPauseVideo);
  btnMute.addEventListener("click", muteVolume);
  seekNext.addEventListener("click", () => seekVideo("next"));
  seekPrev.addEventListener("click", () => seekVideo("prev"));

  var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onclick = resetTimer;
    document.onkeydown = resetTimer;

    function hideControls() {
      videoControls.classList.add("hide-controls");
    }

    function resetTimer() {
      videoControls.classList.remove("hide-controls");
      clearTimeout(time);
      time = setTimeout(hideControls, 3000);
    }
  };
  inactivityTime();

  document.addEventListener("keydown", keyEventPressed);

  function keyEventPressed(e) {
    switch (e.keyCode) {
      case 40:
        handleKeyDown();
        break;

      case 38:
        handleKeyUp();
        break;

      case 37:
        handleKeyLeft();
        break;

      case 39:
        handleKeyRight();
        break;

      case 13:
        handleKeyEnter();
        break;

      case 32:
        handleKeySpace();
        break;

      default:
        console.log(e.keyCode);
    }
  }

  const handleKeyDown = () => {
    switch (activeElement) {
      case "progressBar":
        focusEl("playPause-btn");
        break;
    }
  };

  const handleKeyUp = () => {
    switch (activeElement) {
      case "playPause-btn":
      case "seekPrev-btn":
      case "seekNext-btn":
        focusEl("progressBar");
        break;
    }
  };

  const handleKeyLeft = () => {
    switch (activeElement) {
      case "playPause-btn":
        focusEl("seekPrev-btn");
        break;

      case "seekNext-btn":
        focusEl("playPause-btn");
        break;

      case "progressBar":
        seekVideo("prev");
        break;
    }
  };

  const handleKeyRight = () => {
    switch (activeElement) {
      case "playPause-btn":
        focusEl("seekNext-btn");
        break;

      case "seekPrev-btn":
        focusEl("playPause-btn");
        break;

      case "progressBar":
        seekVideo("next");
        break;
    }
  };

  const handleKeyEnter = () => {
    switch (activeElement) {
      case "seekNext-btn":
        seekVideo("next");
        break;

      case "seekPrev-btn":
        seekVideo("prev");
        break;

      case "progressBar":
        playPauseVideo();
        break;
    }
  };

  const handleKeySpace = () => {
    if (activeElement !== "playPause-btn") {
      playPauseVideo();
    }
  };
}

export default csVideo;
