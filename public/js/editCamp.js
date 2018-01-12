$(function() {
    
    $('.removeIcon').click(function(e){
        e.preventDefault();
        $(this).parent().parent().remove();
    });
    
    $('.logo-btn').click(function(e){
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
    
    
});
