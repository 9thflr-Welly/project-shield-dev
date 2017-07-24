$(document).ready(function() {

  function submitMessage(data) {
    let input_text = $(this).parent().find('#message').val();
    let chat_area = $(this).parent().parent().find('.chat_area');

    socket.emit('send message', messageInput.val(), (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
    });
    messageInput.val('');

    chat_area.append("<p><strong>" + data.name + ": </strong>" + input_text + "<br/></p>");
  }
});
