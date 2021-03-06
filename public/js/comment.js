'use strict';

// Create Comment

$('#new-comment-form').click(function(){
	$('.form-group:nth-child(2)').removeClass('hidden');	
});

$('#new-comment-form').submit(function (e) {
	e.preventDefault();

	var comment = $(this).serialize();
	$.post('/campgrounds/' + getID() + '/comments', comment, function (data) {
		if(data.text){
			var $row = $('<div>',{class: "row"});
			var comment = createComment(data);
			$row.append(comment);
			$('#comments-list').append($row);
			$('#new-comment-form').find('.form-control').val('');
		}
	});
});

// Update comment
$('#comments-list').on('click', '.edit-button', function () {
	$(this).parent().siblings('.edit-item-form').toggle();
	$(this).parent().siblings('.comment-text').toggleClass("hidden");
	$(this).parent().toggleClass("move-update-button");
	$(this).toggleText('EDIT', 'CANCEL');
});

$('#comments-list').on('submit', '.edit-item-form', function (e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	var actionUrl = $(this).attr('action');
	var $originalItem = $(this).closest('.row');
	$.ajax({
		url: actionUrl,
		data: toDoItem,
		type: 'PUT',
		originalItem: $originalItem,
		success: function success(data) {
		    var comment = createComment(data);
			this.originalItem.html(comment);
		}
	});
});

// Delete comment
$('#comments-list').on('submit', '.delete-form', function (e) {
	e.preventDefault();
	var confirmResponse = confirm('Are you sure?');
	if (confirmResponse) {
		var actionUrl = $(this).attr('action');
		var $itemToDelete = $(this).closest('.row');
		$.ajax({
			url: actionUrl,
			type: 'DELETE',
			itemToDelete: $itemToDelete,
			success: function success(data) {
				this.itemToDelete.remove();
				console.log(this.itemToDelete);
			}
		});
	} else {
		$(this).find('button').blur();
	}
});


function getID(){
	var url = window.location.pathname;
	var id = url.substring(url.lastIndexOf('/') + 1);
	return id;
};

function createComment(data){
	var $colmd12 = $('<div>',{class: "col-md-12"});
	var $divPullLeft = $('<div>',{class: "pull-left"});
	var $avatar = $('<img>',{class: "img-circle img-comment", src: data.author.avatar});
	var $strong = $('<strong>', {text: data.author.username});
    var $time = $('<span>',{class: 'pull-right', text: moment(data.createdAt).fromNow()})
	var $divText = $('<div>');
	var $comText = $('<span>', {class: 'comment-text', text: data.text});
	var $updateForm = $('<form>',{class: 'edit-item-form', action: '/campgrounds/' + getID() + '/comments/' + data._id, method: 'POST'});
	var $divFormGroup1 = $('<div>', {class: 'form-group'});
	var $divFormGroup2 = $('<div>', {class: 'form-group'});
	var $inputUpdate = $('<input>',{class: 'form-control', type: 'text', value: data.text, name: 'comment[text]'});
	var $submitButton = $('<button>',{class: 'btn btn-xs btn-primary', text: 'Save'});
	var $divButtons = $('<div>',{class: 'pull-right'});
	var $updateButton = $('<button>',{style: 'margin-right: 5px', class: 'btn btn-xs btn-warning edit-button', text: 'EDIT'});
	var $form = $('<form>', {class: 'delete-form', action: '/campgrounds/' + getID() + '/comments/' + data._id + '?_method=DELETE', method: 'POST'});
	var $delButton = $('<button>', {class: 'btn btn-xs btn-danger', text: 'DELETE'});
	var $hr = $('<hr>');
	
	$divPullLeft.append($avatar);
	
	$divFormGroup1.append($inputUpdate);
	$divFormGroup2.append($submitButton);
	$updateForm.append($divFormGroup1);
	$updateForm.append($divFormGroup2);
	
	$form.append($delButton);
	$divButtons.append($updateButton);
	$divButtons.append($form);
	
	$divText.append($comText);
	$divText.append($updateForm);
	$divText.append($divButtons);
	$divText.append($hr);
	
	$colmd12.append($divPullLeft);
	$colmd12.append($strong);
	$colmd12.append($time);
	$colmd12.append($divText);
	
	return $colmd12;
};

$.fn.extend({
    toggleText: function(a, b){
        return this.text(this.text() == b ? a : b);
    }
});

