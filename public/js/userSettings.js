$(function() {
  
  $('#select-avatar-btn').click(function(){
      $('#image-avatar-update').trigger('click');
      $(this).blur();
  });
  
  $('#image-avatar-update').on('change', function(){
    var urlImg = window.URL.createObjectURL($(this).get(0).files[0]);
    $('#settings-avatar').attr('src',urlImg);
  });
  
})