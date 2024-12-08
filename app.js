var existingHares = 0;
var enteringHares = 0;
var tokensMade = 0;
$(document).ready(function () {
  $('#calculate-button').click(function(){
    existingHares = $('#existingHares').val();
    enteringHares = $('#enteringHares').val();
    existingHares = +existingHares;
    enteringHares = +enteringHares;
    for(i=0;i<enteringHares;i++){
      tokensMade = tokensMade + existingHares;
      existingHares++;
    }
    $('#huge-answer-number').each(function () {
      var $this = $(this);
      jQuery({ Counter: 0 }).animate({ Counter: tokensMade }, {
        duration: 1000,
        easing: 'swing',
        step: function (now) {
          $this.text(Math.ceil(now));
        }
      });
    });
    $('#calculator').fadeOut();
    $('#answer').fadeIn();
  });
  $('#back-button').click(function(){
    existingHares = 0;
    enteringHares = 0;
    tokensMade = 0;
    $('#huge-answer-number').text(0);
    $('#answer').fadeOut();
    $('#calculator').fadeIn();
  });
});
