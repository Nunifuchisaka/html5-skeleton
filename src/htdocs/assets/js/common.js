// import $ from 'jquery';
// import _ from 'underscore';
/*
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
*/
// import 'magnific-popup';
// import 'magnific-popup/dist/magnific-popup.css';

// import { ignite } from './components/_ignite';
// import { placeholder } from './components/_placeholder';
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
