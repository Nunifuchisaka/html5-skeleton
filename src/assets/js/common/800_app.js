$(function(){
  
  COMMON.$window = $(window);
  COMMON.$document = $(document);
  COMMON.$html = $("html");
  COMMON.$html_body = $("html, body");
  COMMON.$wrapper = $("#wrapper");
  
  new COMMON.GlobalHeader_A();
  
  new COMMON.SmoothScroll();
  
});



COMMON.GlobalHeader_A = Backbone.View.extend({
  
  el: "#header",
  
  initialize: function() {
    console.log("GlobalHeader_A");
    var self = this;
    _.bindAll(this, "toggle", "open", "close");
    
    this.opened = false;
    this.duration = 1000;
    this.easing = "easeInOutExpo";
    
    this.$spHnav = $("#spHnav");
    this.$inner1 = $("#spHnav__inner1");
    this.$inner2 = $("#spHnav__inner2");
    this.$toggle = this.$(".js_spHnav_toggle");
    
    this.scrollTop = 0;
    
    this.$toggle.click(this.toggle);
  },
  
  toggle: function(e) {
    console.log("toggle");
    e.preventDefault();
    if( this.opened ){
      this.close();
    } else {
      this.open();
    }
  },
  
  open: function(){
    console.log("open");
    this.scrollTop = COMMON.$document.scrollTop();
    this.$spHnav.removeClass("is_none");
    this.$inner2.stop(true,false).slideDown(this.duration, this.easing, function(){
      COMMON.$wrapper.addClass("is_none");
      COMMON.$html.addClass("is_opened_spHnav");
      COMMON.$document.scrollTop(0);
    });
    
    this.$toggle.addClass("is_active");
    this.opened = true;
    return false;
  },
  
  close: function(){
    console.log("close");
    var self = this,
        scrollTop = COMMON.$document.scrollTop();
    
    COMMON.$html.removeClass("is_opened_spHnav");
    this.$inner1.scrollTop(scrollTop);
    COMMON.$wrapper.removeClass("is_none");
    COMMON.$document.scrollTop(this.scrollTop);
    this.$inner2.stop(true,false).slideUp(this.duration, this.easing, function(){
      self.$spHnav.addClass("is_none");
    });
    
    this.$toggle.removeClass("is_active");
    this.opened = false;
    return false;
  }
  
});
