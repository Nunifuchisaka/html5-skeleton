/*
## SmoothScroll
*/

COMMON.SmoothScroll = function(opts) {
  opts = _.extend({
    target: ".js_smooth-scroll_1"
  }, opts);
  
  $(opts.target).click(function(){
    var href = $(this).attr("href");
    COMMON.$html_body.stop(true,false).animate({
      scrollTop: $(href).offset().top
    }, 1500, "easeOutExpo");
    return false;
  });
}
