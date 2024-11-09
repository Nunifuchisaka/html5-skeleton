import Article_1 from './components/_Article_1.js';

gsap.registerPlugin(ScrollTrigger);

// 動画を自動ストリーミング再生
gsap.utils.toArray(".js_video_1").forEach((el) => {
  const ID = el.dataset.id;
  // console.log('ID', ID);
  if ( !ID ) return;
  const videoSrc = 'src/' + ID + '.m3u8';
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(el);
  } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
    el.src = videoSrc;
  }
});

// スクロールに応じて動画を拡大 1/2 外側
gsap.utils.toArray(".c_video_1__1").forEach((el) => {
  gsap.fromTo(el, {
    width: "280px",
    height: "280px",
  }, {
    width: "100vw",
    height: "100vh",
    ease: Power0.easeNone,
    scrollTrigger: {
      trigger: el,
      scrub: true,
      start: "center center",
    },
  });
});

// スクロールに応じて動画を拡大 2/2 内側
gsap.utils.toArray(".c_video_1__2").forEach((el) => {
  gsap.fromTo(el, {
    //scale: .65
    width: "400px",
    height: "400px",
  }, {
    //scale: 1,
    width: "100vw",
    height: "100vh",
    ease: Power0.easeNone,
    scrollTrigger: {
      trigger: el,
      scrub: true,
      start: "center center",
    },
  });
});

// 
let player,
    playerSet = false,
    isYoutube = false;

gsap.utils.toArray(".c_article_1").forEach((el) => {
  new Article_1({
    el: el
  });
});
