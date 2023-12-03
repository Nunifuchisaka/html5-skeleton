import carousel from './components/_carousel.js';

window.COMMON = new Object();

$(function(){
  
  COMMON.$window = $(window);
  COMMON.$document = $(document);
  COMMON.$html_body = $('html, body');
  COMMON.$html = $('html');
  COMMON.$body = $('body');
  
  carousel();
  
//   ignite();
//   placeholder();
  
});
