//import $ from 'jquery';

export default class {

  #$article;
  #$video_1;
  #$modal;
  #player;
  #playerSet = false;
  #isYoutube = false;

  constructor(opts) {
    console.group("Article_1");
    this.#$article = $(opts.el);
    this.#$video_1 = this.#$article.find(".c_video_1");
    console.log(this.#$video_1.find("a"));
    this.#$video_1.find("a").click("click", this.#click);

    // this.#$modal;
    console.groupEnd();
  }

  #click = (e) => {
    console.count("click");
    e.preventDefault();
    const $me = $(e.currentTarget),
          href = $me.attr("href"),
          $href = $(href),
          $video = $href.find(".c_video_2"),
          videoID = $video.children().attr("id"),
          youtubeID = $video.data("youtube");
  
    console.log(href);
    console.log($href);
    console.log($video);
    console.log(videoID);
    console.log(youtubeID);
  
    gsap.fromTo($href.get(0), {
      opacity: 0,
      onComplete: () => {
        $href.hide();
        // $href.style.display = 'none';
      }
    }, {
      opacity: 1,
      onComplete: () => {
        $href.show();
        // $href.style.display = 'block';
      }
    });
    
    this.#player = new YT.Player(videoID, {
      height: 1080,
      width: 1920,
      videoId: youtubeID,
      playerVars: {
        rel: 0,
        controls: 1,
        showinfo: 0,
        autoplay: 1,
      },
      events: {
        onReady: this.#onPlayerReady,
      }
    });
    this.#playerSet = true;
  }

  #onPlayerReady(event) {
    event.target.playVideo();
  }
}