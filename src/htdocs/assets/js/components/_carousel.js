import $ from 'jquery';
import 'slick-carousel';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

export default function() {
  console.count('carousel.js');
  
  $('.carousel_1__main').slick({
    infinite: false,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          dots: true,
        }
      }
    ]
  });
  
}
