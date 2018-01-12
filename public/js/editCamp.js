$(function() {
  
    $('#imgs-group').on('click', '.removeIcon', function(e){
        e.preventDefault();
        $(this).parent().parent().remove();
    });
    
    $('#imgs-group').on('click', '.logo-btn', function(e){
        e.preventDefault();
        var $logo = $(this).parent().parent().parent();
        var $logoUrl = $logo.find("input").attr("value");
        var $first = $(this).parent().parent().parent().siblings('div .col-logo');
        var $firstUrl = $first.find("input").attr("value");
        
        $first.removeClass("col-logo");
        $first.children().removeClass("logo");
        $first.find(".removeIcon").removeClass("hidden");
        $first.find(".logo-btn").removeClass("hidden");
        $first.find(".logo-text").addClass("hidden");
        $first.find("input").attr("value",$logoUrl);
        
        $logo.addClass("col-logo");
        $logo.children().addClass("logo");
        $logo.find(".removeIcon").addClass("hidden");
        $logo.find(".logo-btn").addClass("hidden");
        $logo.find(".logo-text").removeClass("hidden");
        $logo.find("input").attr("value",$firstUrl);
        
    });
    
    $('.upload_field').unsigned_cloudinary_upload("sample_f5c4ba5ba7ee00cb7024c39a408329f7232acb6b", 
      { cloud_name: 'upcampinc'}, 
      { multiple: true }
    ).bind('cloudinarydone', function(e, data) {
        $("." + data.files[0].size).find("img").attr("src",data.result.secure_url);
        $("." + data.files[0].size).find("input").attr("value",data.result.secure_url);
        $("." + data.files[0].size).find(".progress").remove();
        $("." + data.files[0].size).children().removeClass("start");
        
    }).bind('cloudinaryprogress', function(e, data) { 
       $("." + data.files[0].size).find(".progress").children().css('width', Math.round((data.loaded * 100.0) / data.total) + '%');
       $("." + data.files[0].size).find(".progress").children().text( Math.round((data.loaded * 100.0) / data.total) + '%'); 
        
    }).bind('fileuploadsend', function(e, data){
        $('#imgs-group').append(`
        <div class="col-md-5 col-sm-5 ${data.files[0].size}">
          <div class="thumbnail image-container start">
            <img class="img-inline" style="height:100px;width:auto;" src="https://media.istockphoto.com/photos/dark-texture-background-of-black-fabric-picture-id185317608?k=6&m=185317608&s=612x612&w=0&h=4sun4mTS45BThoiT5e0t976QNDZQ-LkJD-Ex6g6nHtM=">
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: 30%;" 
                 aria-valuemin="0" aria-valuemax="100">0%</div>
            </div>
            <a class="removeIcon" href="#"><i class="fa fa-times" aria-hidden="true"></i></a>
            <input class="hidden" type="text" name="urls" value="<%= campground.images[i] %>">
            <div class="caption">
                <a class="logo-btn" href="#">Make Logo</a>
                <span class="logo-text hidden">Logo</span>
            </div> 
          </div>
        </div>
      `);
      hasAnyLogo();
    });
    
});

function hasAnyLogo(){
    var $div = $("#imgs-group").find("div.col-md-5.col-sm-5");
    if($div.length === 1){
        $div.addClass("col-logo");
        $div.children().addClass("logo");
        $div.find("a").addClass("hidden");
        $div.find("span").removeClass("hidden");
    }
};
