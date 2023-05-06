// ロード時処理

$(window).on('load', function (){

  console.log("読み込み");

});


//トップに戻る
// エスケープ用関数
function escapeSelectorString(val){
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, "\\$&");
  }
  jQuery(function($){
    $(document).on('click', 'a[href^="#"]', function (e) {
        e.preventDefault();
        var speed = 500;

        $("html, body").animate({scrollTop:0}, speed, "swing");
  
        return false;
    });
  });

 /*パッシング*/
let windowHeight = jQuery(window).height(); //<- 画面の縦幅

jQuery(function($){

  $(window).scroll(function(){

    var scrollPosition = $(window).scrollTop();
    var pathName = location.pathname;

    // ヘッダー90px ナビゲーション80px

    if(scrollPosition > 170){

        $(".back-to-top").addClass('animation');

        if(pathName.match("index") || pathName === "/nanbu/"){
          $(".common-header").addClass('index-fixed');
          $(".navbar").addClass('index-fixed');
        }

    }else{
        $(".back-to-top").removeClass('animation');

        if(pathName.match("index") || pathName === "/nanbu/"){
          $(".common-header").removeClass('index-fixed');
          $(".navbar").removeClass('index-fixed');
        }

    }

    $("section").each(function(){
      var div_pos = $(this).offset();
      var scrollPosition = $(window).scrollTop();

      if (scrollPosition > div_pos.top - windowHeight) {

        $(this).addClass('fadein');

      }

    });

 });

});