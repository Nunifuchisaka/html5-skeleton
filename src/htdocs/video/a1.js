gsap.registerPlugin(ScrollTrigger);

// 演出対象となる要素を取得
gsap.utils.toArray(".c_video_1 > div").forEach((el) => {
  gsap.fromTo(el, {
    width: "280px",//'0vw',
    height: "280px",//'0vh',
  }, {
    width: '100vw',
    height: '100vh',
    //scale: .5,
    ease: Power0.easeNone,
    scrollTrigger: {
      trigger: el,
      scrub: true,
      start: "center center",
    },
  });

});

gsap.utils.toArray(".c_video_1 > div > div").forEach((el) => {
  gsap.fromTo(el, {
    //scale: .65
    width: "400px",//'0vw',
    height: "400px",//'0vh',
  }, {
    //scale: 1,
    width: '100vw',
    height: '100vh',
    ease: Power0.easeNone,
    scrollTrigger: {
      trigger: el,
      scrub: true,
      start: "center center",
    },
  });
});

//
gsap.utils.toArray(".js_video_1").forEach((el) => {
  const ID = el.dataset.id;
  console.log('ID', ID);
  if ( !ID ) return;
  const videoSrc = 'src/' + ID + '.m3u8';
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(el);
  } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  }
});
