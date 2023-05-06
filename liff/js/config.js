// ロード時処理

$(window).on('load', function (){

  console.log("読み込み");

  console.log(<%= data %>)
  
  const weeks = ['日', '月', '火', '水', '木', '金', '土']
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const startDate = new Date(year, month - 1, 1) // 月の最初の日を取得
  const endDate = new Date(year, month,  0) // 月の最後の日を取得
  const endDayCount = endDate.getDate() // 月の末日
  const lastMonthEndDate = new Date(year, month - 1, 0) // 前月の最後の日の情報
  const lastMonthendDayCount = lastMonthEndDate.getDate() // 前月の末日
  const startDay = startDate.getDay() // 月の最初の日の曜日を取得
  let dayCount = 1 // 日にちのカウント
  let calendarHtml = '' // HTMLを組み立てる変数

  calendarHtml += '<h1>' + year  + '/' + month + '</h1>'
  calendarHtml += '<table>'

  // 曜日の行を作成
  for (let i = 0; i < weeks.length; i++) {
      calendarHtml += '<td>' + weeks[i] + '</td>'
  }

  for (let w = 0; w < 6; w++) {
      calendarHtml += '<tr>'

      for (let d = 0; d < 7; d++) {
          if (w == 0 && d < startDay) {
              // 1行目で1日の曜日の前
              let num = lastMonthendDayCount - startDay + d + 1
              calendarHtml += '<td class="is-disabled">' + num + '</td>'
          } else if (dayCount > endDayCount) {
              // 末尾の日数を超えた
              let num = dayCount - endDayCount
              calendarHtml += '<td class="is-disabled">' + num + '</td>'
              dayCount++
          } else {
              calendarHtml += '<td>' + dayCount + '</td>'
              dayCount++
          }
      }
      calendarHtml += '</tr>'
  }
  calendarHtml += '</table>'

  document.querySelector('#calendar').innerHTML = calendarHtml

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