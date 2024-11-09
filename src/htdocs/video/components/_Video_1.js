import $ from 'jquery';

export default class {

	#$el;
	#$youtube;
	#$iframe;
	#player;

	constructor(option) {
		this.#$el = $(option.el);
		this.#$youtube = this.#$el.children("a");
		this.#$iframe = this.#$el.find("iframe");

		const youtubeID = this.#$youtube.attr("href").replace("https://youtu.be/", "");

		this.#setYoutube(youtubeID);
		this.#$el.find("a").click(this.#switch);
	}

	#switch = (event) => {
		event.preventDefault();
		console.group("switch video");
		const $me = $(event.currentTarget),
					youtubeID = $me.attr("href").replace("https://youtu.be/", "");
		console.log("youtubeID", youtubeID);
		// this.#$iframe.attr("src", "https://www.youtube.com/embed/" + youtubeID);
		this.#player.loadVideoById({
			videoId: youtubeID,
			// startSeconds: 0
		});
		console.groupEnd();
	}

	#setYoutube = (youtubeID) => {
		console.group("setYoutube");
		const videoID = this.#$youtube.attr("id");
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
				autoplay: 0,
			},
			events: {
				// onReady: this.#onPlayerReady,
			}
		});
		console.groupEnd();
	}

	#onPlayerReady(event) {
		event.target.playVideo();
	}

}