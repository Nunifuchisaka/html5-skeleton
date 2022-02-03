;(function($, window, document, undefined){
'use strict';
console.log('youtube.js');

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const players = {};
window.onYouTubeIframeAPIReady = function() {
  _.each(players, function(player){
    player.onYouTubeIframeAPIReady();
  });
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
  
  $(document).on('opened', '.remodal', function(){
    console.log('Modal is opened');
    const $youtube_1 = $('.youtube_1'),
          id = $youtube_1.attr('id');
    players[id].stop();
  });
  
});


function Youtube_A(opts){
  _.bindAll(this, 'onYouTubeIframeAPIReady', 'onPlayerReady');
  this.player;
  this.$el = $(opts.el);
  //this._id = this.$el.attr('id'),
  this.id = opts.id;
  this.videoId = this.$el.attr('data-video_id');
  console.log(this.id, this.videoId);
}

Youtube_A.prototype.onYouTubeIframeAPIReady = function(){
  this.player = new YT.Player(this.id, {
    height: '360',
    width: '640',
    videoId: this.videoId,
    events: {
      'onReady': this.onPlayerReady,
      //'onStateChange': this.onPlayerStateChange
    },
    playerVars: {
      'playsinline': 1,
    }
  });
}

Youtube_A.prototype.onPlayerReady = function(event){
  console.log('onPlayerReady');
  //event.target.mute();
  event.target.playVideo();
}

Youtube_A.prototype.stopVideo = function() {
  this.player.stopVideo();
}



})(jQuery, this, this.document);