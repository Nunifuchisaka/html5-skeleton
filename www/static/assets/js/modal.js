;(function($, window, document, undefined){
"use strict";
$(function(){
  
  var $body = $("body"),
      template = _.template( $("#modal_1_template").html() );
  
  $body.on("click", ".js_modal_1__open", function(e){
    var $me = $(e.currentTarget),
        data = $me.data();
    console.log("data", data);
    $.magnificPopup.open({
      items: {
        src: template(data),
        type: "inline"
      }
    });
    return false;
  });
  
  
  var $opens = $(".js_test_opens"),
      $add_open = $(".js_add_open");
  $add_open.click(function(){
    var str = Math.random().toString(36).slice(-8);
    console.log("str", str);
    $opens.append('<button class="js_modal_1__open" data-str="'+ str +'">modal '+ str +' open</button>');
    return false;
  });
  
  
  $body.on("click", ".js_print_1", function(e){
    var $me = $(e.currentTarget),
        target = $me.attr("data-target");
    $(target).printThis({
      importCSS: false,
      loadCSS: ""
    });
    return false;
  });
  
});
})(jQuery, this, this.document);