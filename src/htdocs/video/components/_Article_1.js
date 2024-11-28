//import $ from 'jquery';

export default class {

	#$article;
	#observer;
	#$video_1;
	#$video;
	#$modal;
	#$youtube;
	#player;
	#playerSet = false;
	#isYoutube = false;

	constructor(opts) {
		console.group("Article_1");
		const self = this;
		this.#$article = $(opts.el);
		this.#$video_1 = this.#$article.find(".c_video_1");
		this.#$video = this.#$video_1.find("video");
		// console.log(this.#$video);
		// console.log(this.#$video_1.find("a"));

		this.#$video_1.find("a").click("click", this.#click);

		this.#$modal = this.#$article.find(".c_section_1");
		this.#$modal.click(this.#close);

		this.#$youtube = this.#$modal.find(".c_video_2");

		//observer1を作成
		this.#observer = new IntersectionObserver(function(entries){
			for(let i = 0; i < entries.length; i++) {
				if( entries[i].isIntersecting ){
					// $(entries[i].target).addClass('is_animation');
					self.#in();
				} else {
					self.#out();
				}
			}
		}, {
			threshold: 0
		}).observe(this.#$article.get(0));

		console.groupEnd();
	}

	#in() {
		console.count("in");
		this.#$video.get(0).play();
	}

	#out() {
		console.count("out");
		this.#close();
		this.#$video.get(0).pause();
	}

	#close = (event) => {
		if(event) event.preventDefault();
		// const $me = $(event.currentTarget);
		// console.count("#close");
		if (this.#player) {
			this.#player.pauseVideo();
		}
		this.#$video.get(0).play();
		// this.#playerSet = false;
		this.#$modal.hide();
	}

	#click = (event) => {
		// console.count("click");
		event.preventDefault();
		
		gsap.fromTo(this.#$youtube.get(0), {
			opacity: 0,
			// onComplete: this.#close
		}, {
			opacity: 1,
			onComplete: this.#open
		});

		this.#$video.get(0).pause();
	}

	#open = () => {
		this.#$modal.show();
		// $href.style.display = 'block';
		if (this.#player) {
			this.#playYoutube();
		} else {
			this.#setYoutube();
		}
	}

	#onPlayerReady(event) {
		event.target.playVideo();
	}

	#playYoutube = () => {
		this.#player.playVideo();
	}

	#setYoutube = () => {
		console.group("setYoutube");
		const videoID = this.#$youtube.children().attr("id"),
					youtubeID = this.#$youtube.data("youtube");
		console.log(videoID);
		console.log(youtubeID);
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
		// this.#playerSet = true;
		console.groupEnd();
	}
}