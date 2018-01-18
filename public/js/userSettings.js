$(function() {
  
  $('#select-avatar-btn').click(function(){
      $('#image-avatar-update').trigger('click');
      $(this).blur();
  });
  
  $('#image-avatar-update').on('change', function(){
    var urlImg = window.URL.createObjectURL($(this).get(0).files[0]);
    $('#settings-avatar').attr('src',urlImg);
  });
  
  $('#password').on('input', function(){
    if($(this).val().length === 0 || !$(this).val().trim()){
      $('#passwordConfirm').prop('required',false);
    } else {
      $('#passwordConfirm').prop('required',true);
    }
  })
  
})