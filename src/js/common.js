import $ from 'jquery';
import _ from 'underscore';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'magnific-popup';
//import 'magnific-popup/dist/magnific-popup.css';

// import { ignite } from './module/_ignite';
// import { placeholder } from './module/_placeholder';

window.COMMON = new Object();

$(function(){
  
  COMMON.$window = $(window);
  COMMON.$document = $(document);
  COMMON.$html_body = $('html, body');
  COMMON.$html = $('html');
  COMMON.$body = $('body');
  
//   ignite();
//   placeholder();
  
});
