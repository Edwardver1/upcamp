$(function() {
    
    $('.removeIcon').click(function(e){
        e.preventDefault();
        $(this).parent().parent().remove();
    });
    
    $('.logo-btn').click(function(e){
        e.preventDefault();
        var $logo = $(this).parent().parent().parent();
        var $first = $(this).parent().parent().parent().siblings('div:first');
        
        $first.children().removeClass("logo");
        $first.find(".removeIcon").removeClass("hidden");
        $first.find(".logo-btn").removeClass("hidden");
        $first.find(".logo-text").addClass("hidden");
        
        $logo.children().addClass("logo");
        $logo.find(".removeIcon").addClass("hidden");
        $logo.find(".logo-btn").addClass("hidden");
        $logo.find(".logo-text").removeClass("hidden");
        
        $first.before($logo);
    });
    
    
});
