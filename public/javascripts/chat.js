$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var nicknameForm = $('#setNick');
  var nicknameError = $('#nickError');
  var nicknameInput = $('#nickname');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');
  var messageContent2 = $('#chat2');
  // var clients = $('#clients');
  // var newUsers = $('#newUsers');
  // var printAgent = $('#printAgent');
  // var canvas = $("#canvas");
  //
  // var name_list = ['test'];

  $(document).on('click', '#signout-btn', logout); //登出

  // if(window.location.pathname === '/chat'){
  //   setTimeout(agentName, 1000);
  // }

  nicknameForm.submit((e) => {
    e.preventDefault();
    socket.emit('new user', nicknameInput.val(), (data) => {
      if(data){
        $('#nickWrap').hide();
        $('#contentWrap').show();
      } else {
        nicknameError.html('username is already taken');
      }
    });
    nicknameInput.val('');
  });

  messageForm.submit((e) => {
    e.preventDefault();
    socket.emit('send message', messageInput.val(), (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
    });
    messageInput.val('');
  });

  socket.on('usernames', (data) => {
    var html = '';
    for(i=0; i < data.length; i++){
      html += data[i] + '<br />';
    }
    users.html(html);
  });

  socket.on('new message', (data) => {
    console.log(data);
    displayMessage(data)
    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  socket.on('whisper', (data) => {
    messageContent.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
  });

  socket.on('load old messages', docs => {
    for(i=0; i < data.length; i++){
      displayMessage(docs[i]);
    }
  });

  // function displayMessage(data){
  //   messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  // }

  function displayMessage(data){
    if(data.name === 'Ue369116591fbd2d13a7eb5f0ff12547b') {
      messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
    } else {
      messageContent2.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
    }
  }

});

// 我的版本


// wenyen's version
// function displayMessage(data){
//     var i = data.name;
//     var namefound = (name_list.indexOf(i) > -1);
//     /*     var n, dataName ;
//     dataName = document.getElementsById(data.name);
//     for (n = 0; n < dataName.length; n++) { */
//
//     //  messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
//     if (namefound){
//       //append new msg in existed window
//       console.log('found');
//     } else {
//       canvas.append("<div id=\""+ data.name +"\" class=\"tabcontent\"><span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x</span><div id=\"chat\""+
//       "<strong>" + data.name + ": </strong>" + data.msg + "<br/></div>"+
//       "<form action=\"\" id=\"send-message\"><input size=\"35\" id=\"message\" /><input type=\"submit\"/></form></div>");
//     }
// }
//
// function displayMsg(evt, cityName) {
//     var x = document.getElementById(data.name);
//     if (x.style.display === 'none') {
//         x.style.display = 'block';
//     } else {
//         x.style.display = 'none';
//     }
// }
//
// function openCity(evt, cityName) {
//    var a, tabcontent, tablinks;
//    tabcontent = document.getElementsByClassName("tabcontent");
//    for (a = 0; a < tabcontent.length; a++) {
//        tabcontent[i].style.display = "none";
//    }
//    tablinks = document.getElementsByClassName("tablinks");
//    for (a = 0; a < tablinks.length; a++) {
//        tablinks[i].className = tablinks[i].className.replace(" active", "");
//    }
//    document.getElementById(cityName).style.display = "block";
//    evt.currentTarget.className += " active";
//    // Get the element with id="defaultOpen" and click on it
//    document.getElementById("defaultOpen").click();
// }
//
// function displayClient(data){
//     var i = data.name;
//     var namefound = (name_list.indexOf(i) > -1);
//     var ct = document.getElementById("chat");
//
//     if (namefound){
//        console.log('found');
//     } else if (namefound == name_list.indexOf(1)){
//        clients.append("<b><button onclick=\"ct.style.display=\'block\'\" class=\"tablinks\">"+data.name+"</button>");
//        name_list.push(data.name);
//        console.log(name_list);
//     } else {
//        clients.append("<b><button onclick=\"ct.style.display=\'block\'\" class=\"tablinks\"> "+data.name+"</button></b>");
//        name_list.push(data.name);
//        console.log(name_list);
//     }
// }
//
// function agentName() { //'name already taken'功能未做
//   var person = prompt("Please enter your name");
//   if (person != null) {
//     printAgent.append("Welcome <b>" + person + "</b>! You're now on board.");
//   }
// }
