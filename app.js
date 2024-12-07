var existingHares = 0;
var enteringHares = 0;
var tokensMade = 0;
$(document).ready(function () {
  $('#calculate').click(function(){
    existingHares = $('#existingHares').val();
    enteringHares = $('#enteringHares').val();
    existingHares = +existingHares;
    enteringHares = +enteringHares;
    for(i=0;i<enteringHares;i++){
      tokensMade = tokensMade + existingHares;
      existingHares++;
    }
    $('#huge-answer-number').text(tokensMade);
  });
});
