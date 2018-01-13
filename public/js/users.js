// Update user
$('#users-list').on('click', '.edit-user-button', function () {
	$(this).parent().siblings('.user-text').toggleClass("hidden");
	$(this).parent().siblings('.edit-td').toggle();
	$(this).siblings('.submit-update-form').toggle();
	$(this).toggleText('EDIT', 'CANCEL');
});

$('#users-list').on('click', '.submit-update-form', function () {
	$(this).parent().siblings('.edit-user-form').trigger('submit');
	
});

$('#users-list').on('keypress', 'input', function (e) {
	 if (e.which == 13) {
        e.preventDefault();
				$(this).parent().siblings('.edit-user-form').trigger('submit');
    }
});

$('#users-list').on('submit', '.edit-user-form', function (e) {
	e.preventDefault();
	// var userItem = $(this).serialize();
	var actionUrl = $(this).attr('action');
	var $originalItem = $(this).closest('tr');
	var $updateBtn = $(this).siblings('.td-buttons').find('.edit-user-button');
	//TO-DO: serialize() form on search
	var username = $(this).parent().find('.input-username').val();
	var email = $(this).parent().find('.input-email').val();
	var emailName = email.substring(0, email.lastIndexOf("@"));
	var emailDomain = email.substring(email.lastIndexOf("@")+1, email.length);
	var auth = $(this).parent().find('.input-auth').val();
	var enabl = $(this).parent().find('.input-enabl').val();
	var str = 'user%5Busername%5D='+username+'&user%5Bemail%5D='+emailName+'%40'+emailDomain+'&user%5BisAuthenticated%5D='+auth+'&user%5BisEnabled%5D='+enabl;
	$.ajax({
		url: actionUrl,
		data: str,
		type: 'PUT',
		originalItem: $originalItem,
		updateBtn: $updateBtn,
		success: function success(user) {
			this.updateBtn.trigger('click');
			this.originalItem.find('.username').text(user.username);
			this.originalItem.find('.email').text(user.email);
			this.originalItem.find('.isAuthenticated').text(user.isAuthenticated);
			this.originalItem.find('.isEnabled').text(user.isEnabled);
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

// Search user
$('#user-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "username=") {
    search = "all"
  }
  $.get('/admin/users?' + search, function(data) {
    $('#users-list').html('');
    data.forEach(function(user) {
    	if(!user.isAdmin){
    		$('#users-list').append(`
        <tr>
            <td class="user-text username">${ user.username }</td>
            <td class="user-text email">${ user.email }</td>
            <td class="user-text isAuthenticated">${ user.isAuthenticated }</td>
            <form class="edit-user-form" action="/admin/users/${ user._id }" method="POST">
              <td class="edit-td">
                  <input class="form-control input-username" type="text" value="${ user.username }"  name="user[username]">
              </td>
              <td class="edit-td">
                  <input class="form-control input-email" type="text" value="${ user.email }"  name="user[email]">
              </td>
              <td class="edit-td">
                  <select class="form-control input-auth" name="user[isAuthenticated]">
                      <option value='true'>True</option>
                      <option value='false'>False</option>
                  </select>
              </td>
                
            </form>
            <td class="td-buttons">
                <button class="btn btn-xs btn-primary submit-update-form">UPDATE</button>
                <button class="btn btn-xs btn-warning edit-user-button">EDIT</button>
                <form class="delete-form" action="/admin/users/${ user._id }" method="POST">
                  <button class="btn btn-xs btn-danger">DELETE</button>
                </form>
            </td>
          </tr>
      `	);
    	};
    });
  });
});

