export default function(option) {
	
	option = $.extend({
		target: '[data-smooth-scroll]'
	}, option);
	
	const SPEED_DEFAULT = 800, // 最初の速度
				SPEED_REPEAT = 800; // 繰り返し時の速度
	
	const getTargetPositionY = function($this){
		// 移動先を取得
		const href = $this.attr('href');
		const target = $(href == '#' || href == '' ? 'html' : href);
		
		// 移動先のY座標を返却
		return target.offset().top;
	}
	
	const scrollAnimate = function($this, positionStart, scrollSpeed){
		COMMON.$html.animate({ scrollTop: positionStart }, scrollSpeed, 'swing', function(){
			// スクロールアニメーション終了時に、目的地のY座標を取得
			const positionEnd = getTargetPositionY($this);
			
			// 処理を繰り返すかの判定
			// 目的地のY座標が変わっていたらやり直し
			if(positionStart !== positionEnd) {
				scrollAnimate($this, positionEnd, SPEED_REPEAT);
			}
		});
	}
	
	function click(e){
		e.preventDefault();
		const positionStart = getTargetPositionY($(this));
		scrollAnimate($(this), positionStart, SPEED_DEFAULT);
	};
	
	//console.log("$('a' + option.target)", $('a' + option.target));
	
	$('a' + option.target).on('click', click);
	$(option.target).find('a[href^="#"]').click(click);
	
}