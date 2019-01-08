<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title></title>
<meta name="description" content="">
<meta name="keywords" content="">
<meta name="copyright" content="">
<meta name="author" content="">

<link rel="canonical" href="">
<link rel="alternate" href="" media="only screen and (max-width: 640px)">

<!-- ogp -->
<meta property="og:site_name" content="">
<meta property="og:title" content="">
<meta property="og:description" content="">
<meta property="og:url" content="">
<meta property="og:type" content="website">
<meta property="og:image" content="">

<!-- stylesheet -->
<link rel="stylesheet" href="assets/css/reset.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css">
<link rel="stylesheet" href="assets/css/common.css">
<link rel="stylesheet" href="assets/css/patch.css">

<style>
img {
  max-width: 100%;
  height: auto;
}

#header {
  position: fixed;
  top: 0;
  left: 0;
}
</style>

<noscript>
<link rel="stylesheet" href="assets/css/noscript.css">
</noscript>

</head>
<body id="top" class="body--index">

<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.5&appId=";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>


<div class="l_wrapper_1">

<?php include('assets/html/header-1.php'); ?>


<section>
  <h2>Modal</h2>
  <button class="js_add_open">add open button</button>
  <div class="js_test_opens">
    <button class="js_modal_1__open" data-str="hoge">modal hoge open</button>
    <button class="js_modal_1__open" data-str="fuga">modal fuga open</button>
    <button class="js_modal_1__open" data-str="piyo">modal piyo open</button>
  </div>
</section>


<p>ダミーテキスト。</p>
<p><img src="dummy/1.jpg" alt="1" width="800" height="533"></p>
<p>ダミーテキスト。</p>
<p><img src="dummy/2.jpg" alt="2" width="800" height="533"></p>
<p>ダミーテキスト。</p>
<p><img src="dummy/3.jpg" alt="3" width="800" height="533"></p>
<p>ダミーテキスト。</p>
<p><img src="dummy/4.jpg" alt="4" width="800" height="450"></p>
<p>ダミーテキスト。</p>
<p><img src="dummy/5.jpg" alt="5" width="800" height="450"></p>
<p>ダミーテキスト。</p>


<?php include('assets/html/footer-1.php'); ?>

</div><!-- /.l_wrapper_1 -->


<!-- javascript library -->
<script src="assets/libs/underscore.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="assets/libs/jquery.js"><\/script>')</script>
<script src="assets/libs/jquery.easing.js"></script>
<script src="assets/libs/backbone.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/printThis/1.12.3/printThis.min.js"></script>

<!-- javascript original -->
<script src="assets/js/common.js"></script>

<script src="assets/js/modal.js"></script>
<script id="modal_1_template" type="text/template">
  <div class="white-popup">
    aaa 
    <div id="<%- str %>">
      <%- str %>あああ<%- str %>いいい<%- str %>
    </div>
    <button type="button" class="js_print_1" data-target="#<%- str %>"><%- str %></button>
    bbb
  </div>
</script>

<script src="assets/js/analytics.js"></script>

</body>
</html>