// Update user
$('#users-list').on('click', '.edit-user-button', function () {
	$(this).parent().siblings('.user-text').toggleClass("hidden");
	$(this).parent().siblings('.edit-td').toggle();
	$(this).siblings('.submit-update-form').toggle();
	$(this).toggleText('EDIT', 'CANCEL');
});

$('#users-list').on('click', '.submit-update-form', function () {
	$(this).siblings('.edit-user-button').trigger('click');
	$(this).parent().siblings('.edit-user-form').trigger('submit');
	
});

$('#users-list').on('submit', '.edit-user-form', function (e) {
	e.preventDefault();
	var userItem = $(this).serialize();
	var actionUrl = $(this).attr('action');
	var $originalItem = $(this).closest('tr');
	var $updateBtn = $(this).siblings('.td-buttons').find('.edit-user-button');
	$.ajax({
		url: actionUrl,
		data: userItem,
		type: 'PUT',
		originalItem: $originalItem,
		updateBtn: $updateBtn,
		success: function success(user) {
			this.updateBtn.trigger('click');
			this.originalItem.find('.username').text(user.username);
			this.originalItem.find('.email').text(user.email);
			this.originalItem.find('.isAuthenticated').text(user.isAuthenticated);
		}
	});
});

// Delete user
$('#users-list').on('submit', '.delete-form', function (e) {
	e.preventDefault();
	var confirmResponse = confirm('Are you sure?');
	if (confirmResponse) {
		var actionUrl = $(this).attr('action');
		var $itemToDelete = $(this).closest('tr');
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


