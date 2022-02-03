;(function($, window, document, undefined){
'use strict';
console.log('youtube.js');

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const players = {};
window.onYouTubeIframeAPIReady = function() {
  //console.log('window.onYouTubeIframeAPIReady');
  
  setTimeout(function(){
    _.each(players, function(player){
      player.onYouTubeIframeAPIReady();
    });
  }, 1000);
}

$(function(){
  
  $('.youtube_1').each(function(){
    const $el = $(this),
          id = $el.attr('id');
    console.log('id', id);
    players[id] = new Youtube_A({
      el: this,
      id: id
    });
    /*
    players.push(
      new Youtube_A({
        el: this
      })
    );
    */
  });
  
  console.log(players);
  
/*
  $(document).on('opened', '.remodal', function(){
    console.log('Modal is opened');
    const $youtube_1 = $('.youtube_1'),
          id = $youtube_1.attr('id');
    players[id].stop();
  });
*/
  
/*
  $(document).on('click', 'data-remodal-target', function(){
    players['youtube2'].player.playVideo();
  });
*/
  /*
  $('.play_youtube').click(function(){
    players['youtube2'].player.playVideo();
  });
  */
  
  $(document).on('opened', '.remodal.is_youtube', function(event){
    console.group('Youtube Modal is opened');
    const $me = $(this),
          $youtube = $me.find('.youtube_1'),
          id = $youtube.attr('id');
    console.log('id', id);
    if( id ){
      setTimeout(function(){
      players[id].play();
    }, 1000);
      
    }
    //players['youtube2'].player.playVideo();
    console.groupEnd();
  });
  
  $(document).on('closing', '.remodal.is_youtube', function(event){
    console.group('Youtube Modal is closing');
    const $me = $(this),
          $iframe = $me.find('iframe'),
          id = $iframe.attr('id');
    console.log('id', id);
    if( id ){
      players[id].pause();
    }
    //players['youtube2'].player.pauseVideo();
    console.groupEnd();
  });
  
});


function Youtube_A(opts){
  _.bindAll(this, 'onYouTubeIframeAPIReady', 'play', 'pause');
  this.player;
  this.$el = $(opts.el);
  //this._id = this.$el.attr('id'),
  this.id = opts.id;
  this.videoId = this.$el.attr('data-video_id');
  console.log(this.id, this.videoId);
}

Youtube_A.prototype.onYouTubeIframeAPIReady = function(){
  console.log('onYouTubeIframeAPIReady');
  this.player = new YT.Player(this.id, {
    height: '360',
    width: '640',
    videoId: this.videoId,
    events: {
      //'onReady': this.onPlayerReady,
    },
    playerVars: {
      playsinline: 1
    }
  });
}

Youtube_A.prototype.onPlayerReady = function(event){
  //event.target.mute();
  event.target.playVideo();
}

Youtube_A.prototype.play = function(){
  if( this.player ){
    this.player.playVideo();
  } else {
    this.onYouTubeIframeAPIReady();
  }
}

Youtube_A.prototype.pause = function(){
  this.player.pauseVideo();
}


})(jQuery, this, this.document);