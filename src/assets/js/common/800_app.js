$(function(){
  
  COMMON.$window = $(window);
  COMMON.$html = $("html");
  COMMON.$html_body = $("html, body");
  
  new COMMON.GlobalHeader_A();
  
  new COMMON.SmoothScroll();
  
});



COMMON.GlobalHeader_A = Backbone.View.extend({
  
  el: "#header",
  
  initialize: function() {
    console.log("GlobalHeader_A");
    var self = this;
    _.bindAll(this, "toggle", "open", "close", "movefun");
    
    this.opened = false;
    this.duration = 1000;
    this.easing = "easeInOutExpo";
    
    this.$spHnav = $("#spHnav");
    this.$inner = $("#spHnav__1");
    this.$toggle = this.$(".js_spHnav_toggle");
    
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
    console.group("open");
    var self = this;
    
    //スクロールを無効
    //window.addEventListener('touchmove', this.movefun ,{ passive: false });
    COMMON.$html.addClass("is_opened_spHnav");
    
    //ナビゲーションを表示
    this.$spHnav.removeClass("is_none");
    this.$inner.stop(true,false).slideDown(this.duration, this.easing, function(){
      //window.removeEventListener('touchmove', self.movefun, { passive: false });
    });
    
    //その他
    this.$toggle.addClass("is_active");
    this.opened = true;
    console.groupEnd();
    return false;
  },
  
  close: function(){
    console.group("close");
    var self = this;
    
    //ページ全体のスクロールを有効
    //window.removeEventListener('touchmove', this.movefun, { passive: false });
    COMMON.$html.removeClass("is_opened_spHnav");
    
    //ナビゲーションを非表示
    this.$inner.slideUp(this.duration, this.easing, function(){
      self.$spHnav.addClass("is_none");
    });
    
    //その他
    this.$toggle.removeClass("is_active");
    this.opened = false;
    console.groupEnd();
    return false;
  },
  
  movefun: function( event ){
    event.preventDefault();
  }
  
});
