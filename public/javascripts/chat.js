$(document).ready(function() {
    var socket = io.connect();
    var users = $('#users');
    var nicknameForm = $('#setNick');
    var nicknameError = $('#nickError');
    var nicknameInput = $('#nickname');
    var messageForm = $('#send-message');
    var messageInput = $('#message');
    var messageContent = $('#chat');
    var clients = $('#clients');

    var newUsers = $('#newUsers');
    var printAgent = $('#printAgent');
    var canvas = $("#canvas");

    var name_list = ['test'];
    var user_list = [];
    var person = prompt("Please enter your name");
    var count = 0;
    var t = [];
    var t_value;
    var t_key;
    var receiver;
    var designated_user_id;

    function clickMsg() {
        var target = $(this).attr('rel');
        $("#" + target).show().siblings().hide();
    }

    $(document).on('click', '.tablinks', clickMsg);
    $(document).on('click', '#signout-btn', logout); //登出

    if (window.location.pathname === '/chat') {
        setTimeout(agentName, 100);
        //   setTimeout(loadMsg, 100);
    } // set agent name

    function agentName() {
        // person;
        if (person != null) {
            socket.emit('new user', person, (data) => {
                if (data) {

                } else {
                    nicknameError.html('username is already taken');
                }
            });

            printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
        } //'name already taken'功能未做、push agent name 未做

    }

    /*  =======  To indentify the right receiver  =====  */
    function defReceiver() {
        socket.emit('receiver', receiver, (data) => {});
        console.log('receiver sent to www');
    }

    /*  =======  CODES FROM GITHUB: NICKNAME  ======  */
    messageForm.submit((e) => {
        e.preventDefault();
        socket.emit('send message', messageInput.val(), (data) => {
            messageContent.append('<span class="error">' + data + "</span><br/>");
        });
        messageInput.val('');
    });

    socket.on('usernames', (data) => {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += data[i] + '<br />';
        }
        users.html(html);
    });

    /*  =========== to assign the right receiverId  =========  */

    socket.on('send message', messageInput.val(), (data) => {

    })

    /*  =================================  */

    socket.on('new message', (data) => {
        displayMessage(data);
        displayClient(data);

        // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
    });

    function displayMessage(data) {
        var i = data.name;
        var namefound = (name_list.indexOf(i) > -1); //if client exists
        console.log(namefound);

        if (namefound) {
            //append new msg in existed window
            console.log('im: ' + i);
            console.log('namefound');
            if (i == person && data.to_id !== undefined) {
                console.log('yes existed agent msg identified');
                // if ($("#" + data.to_id).is(':visible')) {
                if($("#" + data.to_id + "-option").is(':selected')){
                    // console.log('appended agent message');
                    $("#" + data.to_id + "-content").append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");
                }
                else {
                    console.log('no the n is not visible, do it again')
                }
            } //if agent
            else {
                $("#" + data.id + "-content").append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");
                console.log('appended to according canvas');
            } //if
        } //close if
        else {
          if (i == person && data.to_id !== undefined) {
              console.log('yes existed agent msg identified');
              for (let n = 0; n < t_value + 1; n++) {
                  if ($("#" + data.to_id).is(':visible')) {
                      console.log('appended agent message');
                      $("#" + data.to_id + "-content").append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");
                  } //if if
                  else {
                      console.log('no the n is not visible, do it again')
                  }
              } //for
          } else {
            // console.log('new msg append to canvas');
            name_list.push(data.id);
            $('#user-rooms').append('<option id="' + data.id + '-option">' + data.name + '</option>');

            canvas.append(
                "<div id=\"" + data.id + "\" class=\"tabcontent\">" +
                "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span>" +
                "<div id='" + data.id + "-content'>" +
                "<p>" +
                "<strong>" + data.name + ": </strong>" + data.msg + "<br/>" +
                "</p>" +
                "</div>" +
                "</div>"); // close append
          }


        } //else


    } //function

    function displayClient(data) {
        var i = data.name;
        var namefound = (name_list.indexOf(i) > -1);

        if (namefound) {
            console.log('user existed');

        } else if (i == 'notice') {
            console.log('notice sent');

        } else {
            if (i == person) {
                console.log('agent username loaded');
                name_list.push(data.name);
                t.push({
                    key: data.name,
                    value: count
                });
                console.log(t);
                t_value = t[count].value;
                console.log('the below is t_value');
                console.log(t_value);
                t_key = t[count].key;
                count++;

                console.log('is data.name == person? \(should be yes coz were now in the if agent');
                console.log(i == person);

                if (data.name == person && data.to_id != undefined) {
                    console.log('yes agent msg identified');

                    for (var n = 0; n < t_value; n++) {
                        console.log('yes it gets to the for loop');


                        var k = t[n].key;


                        if ($("#" + k).is(':visible')) {
                            console.log('yes it knows it is visible');
                            var gotIt;
                            gotIt = k;
                            console.log('the following is gotIt');
                            console.log(gotIt);
                            receiver = gotIt;
                            console.log('Tell me whats receiver');
                            console.log(receiver);
                            defReceiver();


                            $("#" + gotIt).append("<p><strong>" + data.name + ": </strong>" + data.msg + "<br/></p>");
                            console.log('agent reply appended to according canvas');


                        } //if if

                    } //for

                } //if agent

            } else {

                clients.append("<b><button  rel=\"" + data.id + "\" class=\"tablinks\"> " + data.name + "</button></b>");
                name_list.push(data.name);
                t.push({
                    key: data.name,
                    value: count
                });
                console.log(t);
                t_value = t[count].value;
                t_key = t[count].key;
                count++;

            } //close else
        } //close else


    } //close client function

}); //document ready close tag
