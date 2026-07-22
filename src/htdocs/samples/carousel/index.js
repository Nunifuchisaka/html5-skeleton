import $ from 'jquery';
import 'slick-carousel';

$(function(){

	$(".carousel_2").slick({
		dots: true,
		centerMode: true,
		infinite: true,
		centerPadding: 0,
		slidesToShow: 1,
	});

});
