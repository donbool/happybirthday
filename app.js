(() => {
  const stage = document.getElementById("stage");
  const headline = document.getElementById("headline");
  const dancer = document.getElementById("dancer");
  const prompt = document.getElementById("prompt");
  const confettiLayer = document.getElementById("confetti-layer");
  const danceGifSrc = "./assets/dance.gif";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const poses = {
    center: "./assets/centerfacing.png",
    cycle: [
      "./assets/rightfacing.png",
      "./assets/leftfacing.png",
      "./assets/babyfreeze.png",
      "./assets/jump.png"
    ]
  };

  let phase = "idle";
  let poseIndex = 0;
  let danceTapCount = 0;
  let completedPoseLoops = 0;
  let hasSwitchedToGif = false;
  let lastTapAt = 0;

  preloadImages([poses.center, ...poses.cycle, danceGifSrc, "./assets/stage-bg.svg"]);

  function preloadImages(srcList) {
    srcList.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  function onTap() {
    const now = Date.now();
    if (now - lastTapAt < 90) {
      return;
    }
    lastTapAt = now;

    if (phase === "idle") {
      phase = "title";
      headline.classList.add("is-visible");
      headline.classList.remove("is-gone");
      prompt.textContent = "tap again";
      launchConfetti(18, true);
      runTitleConfettiShower();
      stagePulse();
      return;
    }

    if (phase === "title") {
      phase = "dance";
      dancer.hidden = false;
      dancer.classList.add("is-active");
      dancer.classList.remove("is-gif");
      dancer.src = poses.center;
      popDancer();
      prompt.classList.add("is-hidden");
      headline.classList.add("is-gone");
      launchConfetti(24, false);
      stagePulse();
      return;
    }

    danceTapCount += 1;
    if (!hasSwitchedToGif) {
      const nextPose = poses.cycle[poseIndex % poses.cycle.length];
      poseIndex += 1;

      if (poseIndex % poses.cycle.length === 0) {
        completedPoseLoops += 1;
      }

      dancer.src = nextPose;

      if (completedPoseLoops >= 2) {
        hasSwitchedToGif = true;
        dancer.src = danceGifSrc;
        dancer.classList.add("is-gif");
      }
    }

    popDancer();

    if (danceTapCount % 3 === 0) {
      launchConfetti(12, false);
      stagePulse();
    }
  }

  function popDancer() {
    if (reduceMotion) {
      return;
    }

    dancer.classList.remove("pose-pop");
    // Force reflow so repeated taps retrigger the same animation.
    void dancer.offsetWidth;
    dancer.classList.add("pose-pop");
  }

  function stagePulse() {
    if (reduceMotion) {
      return;
    }

    stage.classList.remove("pulse");
    void stage.offsetWidth;
    stage.classList.add("pulse");

    window.setTimeout(() => {
      stage.classList.remove("pulse");
    }, 360);
  }

  function runTitleConfettiShower() {
    if (reduceMotion) {
      return;
    }

    let bursts = 0;

    function emitBurst() {
      if (phase !== "title" || bursts >= 7) {
        return;
      }
      bursts += 1;
      launchConfetti(10, true);
      window.setTimeout(emitBurst, 220);
    }

    emitBurst();
  }

  function launchConfetti(count, spreadWide) {
    if (reduceMotion) {
      return;
    }

    const colors = ["#ff5f95", "#55ddff", "#ffe266", "#7effa4", "#ffffff"];

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      const size = 5 + Math.random() * 5;
      const drift = spreadWide
        ? `${Math.round(-22 + Math.random() * 44)}vw`
        : `${Math.round(-45 + Math.random() * 90)}vw`;
      const duration = `${900 + Math.random() * 520}ms`;
      const rotation = `${Math.round(160 + Math.random() * 460)}deg`;
      const startX = spreadWide
        ? `${8 + Math.random() * 84}%`
        : `${45 + Math.random() * 10}%`;

      piece.className = "confetti";
      piece.style.setProperty("--size", `${size}px`);
      piece.style.setProperty("--drift", drift);
      piece.style.setProperty("--dur", duration);
      piece.style.setProperty("--rot", rotation);
      piece.style.setProperty("--start-x", startX);
      piece.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);

      piece.addEventListener("animationend", () => {
        piece.remove();
      }, { once: true });

      confettiLayer.appendChild(piece);
    }
  }

  if (window.PointerEvent) {
    stage.addEventListener("pointerup", onTap, { passive: true });
  } else {
    stage.addEventListener("click", onTap, { passive: true });
  }
})();
