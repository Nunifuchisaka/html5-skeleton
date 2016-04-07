/*
## SmoothScroll
*/

COMMON.SmoothScroll = function(opts) {
  opts = _.extend({
    target: '.js-smoothScroll-1'
  }, opts);
  
  var $html_body = $('html, body');
  
  $(opts.target).click(function() {
    var href = $(this).attr('href');
    $html_body.stop(true,false).animate({
      scrollTop: $(href).offset().top
    }, 1500, 'easeOutExpo');
    return false;
  });
}
