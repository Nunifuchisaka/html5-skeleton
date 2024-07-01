import $ from 'jquery';
import 'magnific-popup';
// import 'slick-carousel';
import Carousel_1 from './components/_Carousel_1.js';
import locationHash from './components/_locationHash.js';

console.count('common.js');

window.COMMON = new Object();

$(function(){
	
	COMMON.$window = $(window);
	COMMON.$document = $(document);
	COMMON.$html_body = $('html, body');
	COMMON.$html = $('html');
	COMMON.$body = $('body');
	
	//console.log( window );
	
	$('.carousel_1').each(function(){
		new Carousel_1({
			el: this
		});
	});
	
//	 ignite();
//	 placeholder();
	
	locationHash();
	
});

//ゼロパディング
COMMON.zeroPadding = function(num, len){
	return ( Array(len).join('0') + num ).slice( -len );
}
