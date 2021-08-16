;(function($, window, document, undefined){
'use strict';

window.COMMON = new Object();

COMMON.device = (function(u){
  return {
    Tablet:(u.indexOf('windows') != -1 && u.indexOf('touch') != -1 && u.indexOf('tablet pc') == -1) 
      || u.indexOf('ipad') != -1
      || (u.indexOf('android') != -1 && u.indexOf('mobile') == -1)
      || (u.indexOf('firefox') != -1 && u.indexOf('tablet') != -1)
      || u.indexOf('kindle') != -1
      || u.indexOf('silk') != -1
      || u.indexOf('playbook') != -1,
    Mobile:(u.indexOf('windows') != -1 && u.indexOf('phone') != -1)
      || u.indexOf('iphone') != -1
      || u.indexOf('ipod') != -1
      || (u.indexOf('android') != -1 && u.indexOf('mobile') != -1)
      || (u.indexOf('firefox') != -1 && u.indexOf('mobile') != -1)
      || u.indexOf('blackberry') != -1
  }
})(window.navigator.userAgent.toLowerCase());


$(function(){
  
  COMMON.$window = $(window);
  COMMON.$document = $(document);
  COMMON.$html_body = $('html, body');
  COMMON.$html = $('html');
  COMMON.$body = $('body');
  
  console.log(navigator.userAgent);
  
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
  
  
  new COMMON.SmoothScroll();
  
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


/*
## SmoothScroll
*/

COMMON.SmoothScroll = function(option){
  option = _.extend({
    target: 'a[data-smooth-scroll]'
  }, option);
  
  const SPEED_DEFAULT = 800, // 最初の速度
        SPEED_REPEAT = 800; // 繰り返し時の速度
  
  const getTargetPositionY = function($this){
    // 移動先を取得
    const href = $this.attr('href');
    const target = $(href == '#' || href == '' ? 'html' : href);
    
    // 移動先のY座標を返却
    return target.offset().top;
  }
  
  const scrollAnimate = function($this, positionStart, scrollSpeed){
    TSUBUGUMI.$html.animate({ scrollTop: positionStart }, scrollSpeed, 'swing', function(){
      // スクロールアニメーション終了時に、目的地のY座標を取得
      const positionEnd = getTargetPositionY($this);
      
      // 処理を繰り返すかの判定
      // 目的地のY座標が変わっていたらやり直し
      if(positionStart !== positionEnd) {
        scrollAnimate($this, positionEnd, SPEED_REPEAT);
      }
    });
  }
  
  function click(e){
    e.preventDefault();
    const positionStart = getTargetPositionY($(this));
    scrollAnimate($(this), positionStart, SPEED_DEFAULT);
  };
  
  $('a' + option.target).on('click.smoothScroll', click);
  $(option.target).find('a[href^="#"]').click(click);
  
}


/*
## is_safari
*/

COMMON.is_safari = function(){
  return (
    -1 !== navigator.userAgent.indexOf('Safari') &&
    -1 === navigator.userAgent.indexOf('Chrome') &&
    -1 === navigator.userAgent.indexOf('Edge')
  )?true:false;
}

console.log('COMMON.is_safari()', COMMON.is_safari());

})(jQuery, this, this.document);