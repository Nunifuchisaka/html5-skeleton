export function placeholder(){
  console.count('placeholder');
  
  $(function(){
    
    $('.placeholder_2').each(function(index,el){
      console.log(index,el);
      new COMMON.Placeholder_B({
        index: index,
        el: el
      });
    });
    
    if( COMMON.is_safari() ){
      
      $('textarea.placeholder_1').each(function(index,el){
        console.log(index,el);
        new COMMON.Placeholder_A({
          index: index,
          el: el
        });
      });
      
    }// COMMON.is_safari()
    
  });
  
  
  /*
  ## COMMON.Placeholder_B
  */
  
  COMMON.Placeholder_B = function(option){
    _.bindAll(this, 'reset', 'click', 'focus', 'blur');
    this.option = _.extend({
      
    }, option);
    this.$el = $(this.option.el);
    this.$textarea = this.$el.children('textarea');
    this.$placeholder = this.$el.children('.placeholder');
    
    this.reset();
    
    /*
    this.placeholder = this.$textarea.attr('placeholder');
    this.$textarea.removeAttr('placeholder');
    this.$placeholder.text(this.placeholder);
    */
    
    this.$placeholder.click(this.click);
    this.$textarea.focus(this.focus);
    this.$textarea.blur(this.blur);
    
    COMMON.$window.resize(this.resize);
    
    this.blur();
  };
  
  COMMON.Placeholder_B.prototype.reset = function(){
    this.$placeholder.css({
      'padding':   this.$textarea.css('padding'),
      'font-size': this.$textarea.css('font-size'),
    });
  };
  
  COMMON.Placeholder_B.prototype.click = function(){
    console.count('click');
    this.$textarea.focus();
  };
  
  COMMON.Placeholder_B.prototype.focus = function(){
    console.count('focus');
    this.$placeholder.hide();
  };
  
  COMMON.Placeholder_B.prototype.blur = function(){
    console.count('blur');
    let val = this.$textarea.val();
    console.log('val', val);
    if( '' == val ){
      this.$placeholder.show();
    }
  };
  

  /*
  ## COMMON.Placeholder_A
  */
  
  COMMON.Placeholder_A = function(option){
    _.bindAll(this, 'check', 'focus', 'blur');
    this.option = _.extend({
      
    }, option);
    this.$el = $(this.option.el);
    this.placeholder = this.$el.attr('placeholder');
    this.$el.removeAttr('placeholder');
    
    this.check();
    
    this.$el
      .focus(this.focus)
      .blur(this.blur);
  }
  
  COMMON.Placeholder_A.prototype.check = function(){
    let val = this.$el.val();
    if( '' == val ){
      this.$el
        .addClass('is_placeholder')
        .val(this.placeholder);
    }
  };
  
  COMMON.Placeholder_A.prototype.focus = function(e){
    if( this.$el.hasClass('is_placeholder') ){
      this.$el
        .val('')
        .removeClass('is_placeholder');
    }
    //this.check();
  };
  
  COMMON.Placeholder_A.prototype.blur = function(e){
    this.check();
  };
  
}