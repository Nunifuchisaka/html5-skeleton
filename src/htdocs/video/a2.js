import Video_1 from './components/_Video_1';

$(function(){

	$(".c_video_1").each(function(){
		new Video_1({
			el: this
		});
	});

});