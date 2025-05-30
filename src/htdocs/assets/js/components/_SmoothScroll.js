import $ from 'jquery';

export default class {
	
	#option;
	#$html;
	#SPEED_DEFAULT = 800; // 最初の速度
	#SPEED_REPEAT = 800; // 繰り返し時の速度

	constructor(opts) {
		this.#option = $.extend({
			target: '[data-smooth-scroll]',
			gnav: null,
		}, opts);

		this.#$html = $('html');

		$('a' + this.#option.target).on('click', this.#click);
		$(this.#option.target).find('a[href*="#"]').click(this.#click);
	}
	
	#scrollAnimate = ($this, positionStart, scrollSpeed) => {
		const self = this;
		this.#$html.animate({
			scrollTop: positionStart
		}, scrollSpeed, 'swing', function(){
			// スクロールアニメーション終了時に、目的地のY座標を取得
			const positionEnd = $this.offset().top;
			
			// 処理を繰り返すかの判定
			// 目的地のY座標が変わっていたらやり直し
			if(positionStart !== positionEnd) {
				self.#scrollAnimate($this, positionEnd, self.#SPEED_REPEAT);
			}
		});
	}
	
	#click = (e) => {
		const $me = $(e.currentTarget),
					href = $me.attr('href'),
					hash = this.#extractHash(href),
					$hash = $(hash);
		console.log('hash', hash);
		if ( $hash.length ) {
			e.preventDefault();
			if ( this.#option.gnav ) {
				this.#option.gnav.close();
			}
			const positionStart = $hash.offset().top;
			this.#scrollAnimate($hash, positionStart, this.#SPEED_DEFAULT);
		}
	}

	#extractHash(href) {
		const hash = href.match(/#(.*)/);
		return hash ? hash[0] : null;
	}
	
}