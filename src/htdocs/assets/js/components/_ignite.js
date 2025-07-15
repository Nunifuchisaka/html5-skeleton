import $ from 'jquery';

export default function () {
  //observer2を作成
  const observer2 = new IntersectionObserver(function(entries){
    for(let i = 0; i < entries.length; i++) {
      if( entries[i].isIntersecting ){
        $(entries[i].target).addClass('is_animation');
        observer2.unobserve(entries[i].target);
      }
    }
  }, {
    threshold: .2
  });

  $('.a_ignite_2').each(function(){
    observer2.observe(this);
  });


  //observer1を作成
  const observer1 = new IntersectionObserver(function(entries){
    for(let i = 0; i < entries.length; i++) {
      if( entries[i].isIntersecting ){
        $(entries[i].target).addClass('is_animation');
        observer1.unobserve(entries[i].target);
      }
    }
  }, {
    threshold: .2
  });

  $('.a_ignite_1').each(function(){
    observer1.observe(this);
  });

}