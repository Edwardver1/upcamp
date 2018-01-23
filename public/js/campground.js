$(function() {
    
    hasSecondPrice();
  
    // ----- Remove image ------ //
    $('#imgs-group').on('click', '.removeIcon', function(e){
        e.preventDefault();
        var $arr = $("#imgs-group").find("div.col-md-5.col-sm-5");
        var $div = $(this).parent().parent();
        var $divLogo = $("#imgs-group").find('div.col-md-5.col-sm-5.col-logo');
        // handle remove first image issue with > 2 available
        if($arr.length > 2 && ($arr.get().indexOf($div.get(0)) === 0)){
            var $logoUrl = $("#imgs-group").find("div.col-md-5.col-sm-5:first-child").find('input').attr('value');
            var $nextToLogoUrl = $("#imgs-group").find("div.col-md-5.col-sm-5:nth-child(2)").find('input').attr('value');
            if($arr.get().indexOf($divLogo.get()[0]) === 1){ // logo 2 image 
                // switching them
                $("#imgs-group").find("div.col-md-5.col-sm-5:first-child").find('input').attr('value', $nextToLogoUrl);
                $("#imgs-group").find("div.col-md-5.col-sm-5:nth-child(2)").find('input').attr('value',$logoUrl);
                $div.remove();
            } else { // logo > 2 image
                $div.remove();
                $("#imgs-group").find("div.col-md-5.col-sm-5:first-child").find('input').attr('value',$logoUrl);
                $("#imgs-group").find('div.col-md-5.col-sm-5.col-logo').find('input').attr('value',$nextToLogoUrl); 
            }
        } else if ($arr.length = 2 && ($arr.get().indexOf($div.get(0)) === 0)) {
            var $logoUrl = $("#imgs-group").find("div.col-md-5.col-sm-5:first-child").find('input').attr('value');
            $div.siblings('div.col-logo').find('input').attr('value',$logoUrl);
            $div.remove();
        } else {
            $div.remove();
        }
    });
    
    // ----- Switch logo ------ //
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
    
    // ----- Upload image  ------ //
    $('.upload_field').unsigned_cloudinary_upload("sample_f5c4ba5ba7ee00cb7024c39a408329f7232acb6b", 
      { cloud_name: 'upcampinc'}, 
      { multiple: true }
    ).bind('cloudinarydone', function(e, data) {
        $("." + data.files[0].size).find("input").attr("value",data.result.secure_url);
        $("." + data.files[0].size).find(".progress").remove();
        $("." + data.files[0].size).children().removeClass("start");
        
    }).bind('cloudinaryprogress', function(e, data) { 
      $("." + data.files[0].size).find(".progress").children().css('width', Math.round((data.loaded * 100.0) / data.total) + '%');
      $("." + data.files[0].size).find(".progress").children().text( Math.round((data.loaded * 100.0) / data.total) + '%'); 
        
    }).bind('fileuploadsend', function(e, data){
        var urlImg = window.URL.createObjectURL(data.files[0]);
        $('#imgs-group').append(`
        <div class="col-md-5 col-sm-5 ${data.files[0].size}">
          <div class="thumbnail image-container start">
            <img class="img-inline" style="height:100px;width:auto;" src="${urlImg}">
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
    
    // ----- Trigger selectImage input ------ //
    $('#select-img-btn').on('click', function(e){
      $("#image").trigger('click');
      if($("#helpImage").hasClass("hidden") === false){
          $("#helpImage").addClass("hidden"); 
      }
    });
    
    // // ----- Remove helpBlock on input ------ //
    $('form').on('input change', ':input[required]', function(e){
        var $helpId = $(this).attr('aria-describedby');
        if($('#' + $helpId).hasClass('hidden') === false){
          $('#' + $helpId).addClass('hidden') 
        }
    });
    
    // // ----- Submit form + validation ------ //
    $("#submit-btn").click(function(e){
        e.preventDefault();
        var $arr = $("#imgs-group").find("div.col-md-5.col-sm-5");
        var inputCost = $(this).attr("name") === 'price[cost]';
        var $helpId;
        var hasHelp = 0;
        $(':input[required]').each(function(){
            // check required provided and cost > 500
            if($(this).val() == 0 || ($(this).attr("name") === 'price[cost]' ? ($(this).val() > 500 ? true : false) : false)){
                $helpId = $(this).attr('aria-describedby');
                $('#' + $helpId).removeClass('hidden');
                $(this).focus();
                return hasHelp += 1;
            }else if ($arr.length === 0){
                $("#helpImage").removeClass("hidden");
                return hasHelp += 1;
            }
        });
        if(hasHelp === 0){
            $("#createForm").submit();
        }
    });
    
    $('#addCost').click(function(e){
        e.preventDefault();
        var $index = $(".divCost").length+1;

        $(this).before(`
        <div class="divCost">
            <input class="form-control hidden" type="text" name="price[new]" value="true">
            <input class="form-control const-input" type="text" name="price[season]" placeholder="Season" required aria-describedby="helpSeason${$index}">
            <span id="helpSeason${$index}" class="help-block hidden">Please provide season.</span>
            <input class="form-control const-input" type="number" name="price[cost]" placeholder="9.99" step="0.01" min="0.01" required aria-describedby="helpCost${$index}">
            <span id="helpCost${$index}" class="help-block hidden">Please provide cost. Min 0.01, Max 500</span>
        </div>
        `);

        $('#removeCost').removeClass('hidden');
        $(this).blur();
    });
    
     $('#removeCost').click(function(e){
        e.preventDefault();
        if($('.divCost:last-of-type').find('input[name="price[_id]"]')){
            var campId = $('#campId').text();
            var priceId = $('.divCost:last-of-type').find('input[name="price[_id]"]').val();
            $.ajax({
			url: '/campgrounds/'+campId+'/costs/'+priceId,
			type: 'DELETE',
			success: function success(data) {
				// $('.divCost:last-of-type').remove();
			}
		    });
        }
        // else{
         $('.divCost:last-of-type').remove();   
        // }
        if($('.divCost').length === 0){
            $(this).addClass('hidden');
        }
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

function hasSecondPrice(){
    if($('.divCost').length > 0){
            $("#removeCost").removeClass('hidden');
    }
};
