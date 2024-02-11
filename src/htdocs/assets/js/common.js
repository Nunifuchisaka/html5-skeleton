import carousel from './components/_carousel.js';
import locationHash from './components/_locationHash.js';

window.COMMON = new Object();

$(function(){
  
  COMMON.$window = $(window);
  COMMON.$document = $(document);
  COMMON.$html_body = $('html, body');
  COMMON.$html = $('html');
  COMMON.$body = $('body');
  
  //console.log( window );
  
  carousel();
  
//   ignite();
//   placeholder();
  
  locationHash();
  
});
