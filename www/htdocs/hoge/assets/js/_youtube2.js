;(function($, window, document, undefined){
'use strict';
//console.log('youtube.js');

$(function(){
  
  const players = {};
  
  $('.video_1').each(function(){
    const $el = $(this),
          $iframe = $el.find('iframe'),
          id = $iframe.attr('id');
    console.log('id', id);
    if( id ){
      players[id] = new Youtube_A({
        el: this,
        id: id
      });
    }
  });
  
  $(document).on('opened', '.remodal.is_youtube', function(event){
    console.group('Youtube Modal is opened');
    const $me = $(this),
          $iframe = $me.find('iframe'),
          id = $iframe.attr('id');
    console.log('id', id);
    if( id ){
      players[id].control('playVideo');
    }
    console.groupEnd();
  });
  
  $(document).on('closing', '.remodal.is_youtube', function(event){
    console.group('Youtube Modal is closing');
    const $me = $(this),
          $iframe = $me.find('iframe'),
          id = $iframe.attr('id');
    console.log('id', id);
    if( id ){
      players[id].control('pauseVideo');
    }
    console.groupEnd();
  });
  
});


function Youtube_A(opts){
  _.bindAll(this, 'control');
  this.targetWindow = document.getElementById(opts.id).contentWindow;
}

Youtube_A.prototype.control = function(action,arg=null){
  this.targetWindow.postMessage('{"event":"command", "func":"'+action+'", "args":'+arg+'}', '*');
};


})(jQuery, this, this.document);