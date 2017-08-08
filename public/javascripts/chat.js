$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');
  var clients = $('#clients');
  var idles = $('#idle-roomes');
  var printAgent = $('#printAgent');
  var canvas = $("#canvas");
  var searchBox = $('.searchBox');
  var name_list = [];
  var userProfiles = [];
  var person = '';
  var historyMsg_users = [];
  var historyMsg_agents = [];
  var user_list = []; // user list for checking on idle chat rooms
  var avgChatTime;
  var sumChatTime;
  var sortAvgBool = true;
  var sortTotalBool = true;
  var sortFirstBool = true;
  var sortRecentBool = true;
  var infoTable = $('.info_input_table');

  const COLOR = {
    FIND: "#A52A2A",
    CLICKED: "#ccc",
  }

  function clickMsg(){
    $("#selected").attr('id','').css("background-color", "");   //selected tablinks change, clean prev's color
    $(this).attr('id','selected').css("background-color",COLOR.CLICKED);    //clicked tablinks color

    if( $(this).find('span').css("font-weight")=="bold" ) {
      $(this).find('span').css("font-weight", "normal");                //read msg, let msg dis-bold
      socket.emit("read message", {id: $(this).attr('rel')} );          //tell socket that this user isnt unRead
    }

    var target = $(this).attr('rel');         //find the message canvas
    $("#"+target).show().siblings().hide();   //show it, and close others
    $('#user-rooms').val(target);             //change value in select bar
    $('#'+target+'-content').scrollTop($('#'+target+'-content')[0].scrollHeight);   //scroll to down

    console.log('click tablink executed');
  }
  function clickSpan() {  //close the message canvas
    let userId = $(this).parent().css("display", "none").attr("id");
    $(".tablinks[rel='" + userId +"'] ").attr("id", "").css("background-color","");   //clean tablinks color
  }

  function closeIdleRoom() {
    // declare current datetime and parse into ms
    // get the message sent time in ms
    let new_date = new Date();
    let over_fifteen_min = Date.parse(new_date);
    let canvas_last_child_time_list = [];
    //convert from htmlcollection to array
    let convert_list;
    // client list on the left needs to move down when idle more than a certain times
    let item_move_down;
    let item_move_up;
    // 這邊需要依照canvas裡面的聊天室做處理
    let canvas = document.getElementById('canvas');
    // check how many users are chatting
    let total_users = document.getElementById('canvas').children.length;
    // children under canvas
    let canvas_all_children = canvas.children;

    for(let i=0;i<total_users;i++) {
      user_list.push(canvas_all_children[i].getAttribute('id'));
      // console.log(user_list);
      convert_list = Array.prototype.slice.call( canvas_all_children[i].getElementsByClassName("messagePanel")[0].getElementsByClassName("message") );
      // console.log(convert_list);
      canvas_last_child_time_list.push(convert_list.slice(-1)[0].getAttribute('rel'))
      // console.log(canvas_last_child_time_list);
      if(over_fifteen_min - canvas_last_child_time_list[i] >= 300000) {
        console.log('id = '+user_list[i]+' passed chat time');
        idles.append($('[rel="'+user_list[i]+'"]').parent());
        clients.find('[rel="'+user_list[i]+'"]').remove();
      } else {

        clients.append($('[rel="'+user_list[i]+'"]').parent());
        idles.find('[rel="'+user_list[i]+'"]').remove();
      }
    }
    // console.log(user_list);

    user_list = [];
    convert_list = [];
    canvas_last_child_time_list = [];
  }
  setInterval(() => {
    closeIdleRoom();
  }, 20000)

  $(document).on('click', '.tablinks', clickMsg);
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '.topright', clickSpan);
  $(document).on('click', '#userInfoBtn', showProfile);
  $(document).on('click', '.userInfo-td[modify="true"]', editProfile);
  $(document).on('click', '.edit-button', changeProfile);
  $(document).on('click','#userInfo-submit',submitProfile);
  $(document).on('click','#sortAvg',sortAvgChatTime);
  $(document).on('click','#sortTotal',sortTotalChatTime);
  $(document).on('click','#sortFirst',sortFirstChatTime);
  $(document).on('click','#sortRecent',sortRecentChatTime);



  if (window.location.pathname === '/chat') {
    console.log("Start loading history message...");
    setTimeout(function() {
      socket.emit('get json from back');
    }, 10);  //load history msg
    setTimeout(agentName, 1000); //enter agent name
    setTimeout(function() {
      socket.emit("get tags from chat")
    }, 100);
  }
  function loadMsg() {
    console.log("Start loading msg...");
    socket.emit('get json from back');    //emit a request to www, request for history msg
  } //end loadMsg func
  socket.on('push json to front', (data) => {   //www emit data of history msg
    console.log("push json to front");
    // console.log(data);
    for( i in data ) pushMsg(data[i]);    //one user do function one time
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    // closeIdleRoom();
    $('.tablinks_head').text('Loading complete'); //origin text is "network loading"
  });
  function pushMsg(data){     //one user do function one time; data structure see file's end
    let historyMsg = data.Messages;
    let profile = data.Profile;
    name_list.push(profile.userId); //make a name list of all chated user
    userProfiles.push(profile);

    let historyMsgStr = "<p class='message-day' style='text-align: center'><strong><i>"
      + "-------------------------------------------------------No More History Message-------------------------------------------------------"
      + "</i></strong></p>";    //history message string head

    let nowDateStr = "";
    for( let i in historyMsg ) {    //this loop plus date info into history message, like "----Thu Aug 01 2017----"
      let d = new Date( historyMsg[i].time ).toDateString();   //get msg's date
      if( d != nowDateStr ) {  //if (now msg's date != previos msg's date), change day
        nowDateStr = d;
        historyMsgStr += "<p class='message-day' style='text-align: center'><strong>" + nowDateStr + "</strong></p>";  //plus date info
      }
      if( historyMsg[i].owner == "agent" ) {    //plus every history msg into string
        historyMsgStr += toAgentStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
      }
      else historyMsgStr += toUserStr(historyMsg[i].message, historyMsg[i].name, historyMsg[i].time);
    }

    historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
      + "-------------------------------------------------------Present Message-------------------------------------------------------"
      +" </italic></strong></p>";   //history message string tail

    canvas.append(    //push string into canvas
      "<div id=\"" + profile.userId + "\" class=\"tabcontent\"style=\"display: none;\">"
       + "<span onclick=\"this.parentElement.style.display=\'none\'\" class=\"topright\">x&nbsp;&nbsp;&nbsp;</span>"
       + "<div id='" + profile.userId + "-content' class='messagePanel'>" + historyMsgStr + "</div>"
       + "</div>"
    );// close append
    $('#user-rooms').append('<option value="' + profile.userId + '">' + profile.nickname + '</option>');  //new a option in select bar

    let lastMsg = historyMsg[historyMsg.length-1];    //this part code is temporary
    let font_weight = profile.unRead ? "bold" : "normal";  //if last msg is by user, then assume the msg is unread by agent
    let lastMsgStr = "";
    lastMsgStr = "<br><span style='font-weight: "+ font_weight + "'>" + toTimeStr(lastMsg.time) + remove_href_msg(lastMsg.message) + "</span>";
    //display last message at tablinks

    let avgChatTime;
    let totalChatTime;
    if( profile.recentChat != lastMsg.time) {   //it means database should update chat time of this user
      let timeArr = [];       //some calculate
      for( let i in historyMsg ) timeArr.push(historyMsg[i].time);
      let times = [];
      let i=0;
      const GAP = 1000*60*10; //10 min
      let headTime;
      let tailTime;
      while( i<timeArr.length ) {
        headTime = tailTime = timeArr[i];
        while( timeArr[i]-tailTime < GAP ) {
          tailTime = timeArr[i];
          i++;
          if( i==timeArr.length ) break;
        }
        var num = tailTime-headTime;
        if( num<1000 ) num = 1000;
        times.push(num);
      }
      let sum = 0;
      for( let j in times ) sum += times[j];
      sum /= 60000;
      totalChatTime = sum;
      avgChatTime = sum/times.length;
      console.log("total = " + totalChatTime);
      console.log("avg = ");
      console.log(avgChatTime);
      console.log("times.length = ");
      console.log(times.length);
      if( isNaN(avgChatTime)||avgChatTime<1 ) avgChatTime = 1;
      if( isNaN(totalChatTime)||totalChatTime<1 ) totalChatTime = 1;

      socket.emit("update chat time", {   //tell www to update this user's chat time info
        id: profile.userId,
        avgTime: avgChatTime,
        totalTime: totalChatTime,
        recentTime: lastMsg.time
      });
    }
    else {      //it means database dont need update, just get info from DB
      avgChatTime = profile.avgChat;
      totalChatTime = profile.totalChat;
    }

    idles.append("<b><button rel=\""+profile.userId+"\" class=\"tablinks\""
      + "data-avgTime=\""+ avgChatTime +"\" "
      + "data-totalTime=\"" + totalChatTime +"\" "
      + "data-firstTime=\"" + profile.firstChat +"\" "
      + "data-recentTime=\"" + lastMsg.time +"\"> "
      + profile.nickname
      + lastMsgStr
      + "</button></b>"
    );    //new a tablinks
  }
  function agentName() {    //enter agent name
    var userId = auth.currentUser.uid;

    database.ref('users/' + userId).on('value', snap => {
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      let person = snap.child(profId[0]).val().nickname;  //從DB獲取agent的nickname
      // console.log(person);

      if (person != '' && person != null) {
        socket.emit('new user', person, (data) => {
          // console.log(data);
          if(data){}   //check whether username is already taken
          else {
            alert('username is already taken');
            person = prompt("Please enter your name");  //update new username
            database.ref('users/' + userId + '/' + profId).update({nickname : person});
          }
        });
        printAgent.html("Welcome <b>" + person + "</b>! You're now on board.");
      }
      else{
        person = prompt("Please enter your name");  //if username not exist,update username
        database.ref('users/' + userId + '/' + profId).update({nickname : person});
      }
    });
  }
  socket.on("push tags to chat", data=> {
    console.log("data:");
    console.log(data);
    let count = 0;
    for( let i in data ) {
      let name = data[i].name;
      let type = data[i].type;
      let set = data[i].set;
      let modify = data[i].modify;
      let tdHtml = "";
      if( type=='text' ) tdHtml = '<p id="td-inner">尚未輸入<p>';
      else if( type=="time" && modify=="true" ) tdHtml = '<input type="datetime-local" id="td-inner"></input>';
      else if( type=="time" && modify=="false" ) tdHtml = '<input type="datetime-local" id="td-inner" readOnly></input>';
      else if( type.indexOf('select')!=-1 ) {
        if( type=='single_select') tdHtml = '<select id="td-inner">';
        else tdHtml = '<select id="td-inner" multiple>';
        for( let j in set ) tdHtml += '<option value="' + set[j] + '">' + set[j] + '</option>';
        tdHtml += '</select>';
      }
      infoTable.append( '<tr>'
        + '<th class="userInfo-th" id="' + name + '">' + name + '</th>'
        + '<th class="userInfo-td" id="' + name + '" type="' + type + '" set="' + set +'" modify="' + modify +'">' + tdHtml + '</th>'
        + '<td class="edit-button yes " name="yes">yes</td>'
        + '<td class="edit-button no " name="no">no</td> </tr>'
      );
    }
  });
  messageForm.submit((e) => {
    e.preventDefault();
    selectAll();

    if (Array.isArray(designated_user_id)) {
      for (var i=0; i < name_list.length;i++) {
        socket.emit('send message2', {id: name_list[i] , msg: messageInput.val()}, (data) => {
          messageContent.append('<span class="error">' + data + "</span><br/>");
          console.log('this is designated_user_id[i]');
          console.log(designated_user_id[i]);
        });//snap=
      };//for
    }
    else {
      socket.emit('send message2', {id: designated_user_id , msg: messageInput.val()}, (data) => {
        messageContent.append('<span class="error">' + data + "</span><br/>");
      });//socket.emit

    }//else
    messageInput.val('');
  });
  function selectAll(){
    if ($( "#user-rooms option:selected" ).val()=='全選'){
      designated_user_id = name_list;
      select = 'true';
    }
    else{
      designated_user_id = $( "#user-rooms option:selected" ).val();
      select = 'false';
    }
  }
  socket.on('usernames', (data) => {    //maybe no use now
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += data[i] + '<br />';
    }
    users.html(html);
  });
  /*  =================================  */
  socket.on('new message2', (data) => {   //if www push "new message2"
    console.log("Message get! identity = " + data.owner + ", name = " + data.name);
    //owner = "user", "agent" ; name = "Colman", "Ted", others...
    displayMessage( data ); //update canvas
    displayClient( data );  //update tablinks

    if( name_list.indexOf(data.id) == -1 ) {  //if its never chated user, push his name into name list
      name_list.push(data.id);
      console.log("push into name_list!");
    }
    else console.log("this msgOwner already exist");

    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });
  function displayMessage( data ) {     //update canvas

    if (name_list.indexOf(data.id) !== -1) {    //if its chated user
      let str;
      let designated_chat_room_length = $("#" + data.id + "-content p.message").length;
      let designated_chat_room_msg_time = $("#" + data.id + "-content p.message")[designated_chat_room_length-1].getAttribute('rel');
      // console.log(designated_chat_room_length);
      // console.log(designated_chat_room_msg_time);
      // 上一筆聊天記錄時間超過15分鐘
      if(data.time - designated_chat_room_msg_time >= 900000){
        $("#" + data.id + "-content").append('New Session starts-------------------');
        if( data.owner == "agent" ) str = toAgentStr(data.message, data.name, data.time);
        else str = toUserStr(data.message, data.name, data.time);
      } else {
        if( data.owner == "agent" ) str = toAgentStr(data.message, data.name, data.time);
        else str = toUserStr(data.message, data.name, data.time);
      }

      $("#" + data.id + "-content").append(str);    //push message into right canvas
      $('#'+data.id+'-content').scrollTop($('#'+data.id+'-content')[0].scrollHeight);  //scroll to down

    } //close if
    else {              //if its never chated user
      console.log('new user msg append to canvas');

      //THIS PART DIVIDE HISTORY MSG INTO DIFFERENT DAYS
      let historyMsgStr = "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------No More History Message-------------------------------------------------------"
        + "</italic></strong></p>";

      historyMsgStr += "<p class='message-day' style='text-align: center'><strong><italic>"
        + "-------------------------------------------------------Present Message-------------------------------------------------------"
        +" </italic></strong></p>";

      if( data.owner == "agent" ) historyMsgStr += toAgentStr(data.message, data.name, data.time);
      else historyMsgStr += toUserStr(data.message, data.name, data.time);

      canvas.append(      //new a canvas
        "<div id=\"" + data.id + "\" class=\"tabcontent\"style=\"display: none;\">"
        + "<span class=\"topright\">x&nbsp;</span>"
        + "<div id='" + data.id + "-content' class='messagePanel'>"
         + historyMsgStr
        + "</div></div>"
      );// close append

      $('#user-rooms').append('<option value="' + data.id + '">' + data.name + '</option>');
      //new a option in select bar
    }
  }//function
  function displayClient( data ) {    //update tablinks
    let font_weight = data.owner=="user" ? "bold" : "normal";   //if msg is by user, mark it unread

    if (name_list.indexOf(data.id) !== -1 ) {
      console.log('user existed');
      $(".tablinks[rel='"+data.id+"'] span").text(toTimeStr(data.time)+remove_href_msg(data.message)).css("font-weight", font_weight);
      $(".tablinks[rel='"+data.id+"']").attr("data-recentTime", data.time);
      //update tablnks's last msg
    }
    else{
      //new user, make a tablinks
      clients.append("<b><button rel=\"" + data.id + "\" class=\"tablinks\" >" + data.name
        + "<br><span style='font-weight: " + font_weight + "'>" + toTimeStr(data.time)
        + remove_href_msg(data.message) +  "</span></button></b>"
      );
    }

    $(".tablinks").eq(0).before($(".tablinks[rel='"+data.id+"']"));
  } //close client function
  //extend jquery, let searching case insensitive
  $.extend($.expr[':'], {
    'containsi': function(elem, i, match, array) {
      return (elem.textContent || elem.innerText || '').toLowerCase()
      .indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });
  searchBox.change(function () {    //not clean code ><,  just some search function
    var searchStr = searchBox.val();

    if( searchStr == "" ) {
      displayAll();
    }
    else {
      $('.tablinks').each( function() {
        //find his content parent
        let id = $(this).attr('rel');
        //hide no search_str msg
        $("div #"+id+"-content"+" .message").css("display", "none");
        //display searched msg & push #link when onclick
        $("div #"+id+"-content"+" .message:containsi("+searchStr+")")
          .css("display", "").on( "click", when_click_msg );

        //when onclick, get search_str msg # link
        function when_click_msg() {    //when clicing searched msg

          $(this).attr("id", "ref");    //msg immediately add link
          searchBox.val("");    //then cancel searching mode,
          displayAll();         //display all msg
          window.location.replace("/chat#ref"); //then jump to the #link added
          $(this).attr("id", "");   //last remove link
        };
        //if this customer already no msg...
        let color = "";
        $("div #"+id+"-content"+" .message").each(function() {
          if($(this).css("display")!="none") {
            color = COLOR.FIND;
            return false;
          }
        });
        //then hide the customer's tablinks
        $(this).css("color", color);
      });
    }
  });   //end searchBox change func
  function displayAll() {
    $('.tablinks').each( function() {
      let id = $(this).attr('rel');
      $("div #"+id+"-content"+" .message").css("display", "").off("click");

      $(this).css("color","");
    });
  }
  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd'
  });
  $('.filterClean').on('click', function() {
    $('#startdate').val('');
    $('#enddate').val('');
    $('.tablinks').show();
    searchBox.val('');
    displayAll();
  })
  $('.filterDate').on('click', function(){
      let filterWay = $(this).attr('id');
      let startTime = new Date($('#startdate').val()).getTime();
      let endTime = new Date($('#enddate').val()).getTime();

      if(startTime>endTime) alert('startTime must early then endTime');
      else {
        $('.tablinks').each(function() {
          let val = $(this).attr('data-'+filterWay);
          if( val<startTime || val>(endTime+86400000) ) $(this).hide();
          else $(this).show();
        });
      }
  });
  $('.filterTime').on('click', function(){
    let filterWay = $(this).attr('id');
    let val = $('#filterTimeSelect').val();
    let a;  let b;
    if( val==0) { a=0; b=5; }
    else if( val==1) { a= 5; b=10; }
    else if( val==2) { a=10; b=30; }
    else if( val==3) { a=30; b=60; }
    else if( val==4) { a=60; b=9999999; }
    else alert(val);
    $('.tablinks').each(function() {
      let val = $(this).attr('data-'+filterWay);
      if( val>a && val<b ) $(this).show();
      else $(this).hide();
    });
  });
  function sortUsers(ref, up_or_down, operate) {
    let arr = $('#idle-roomes b');
    for( let i=0; i<arr.length-1; i++ ) {
      for( let j=i+1; j<arr.length; j++ ) {
        let a = arr.eq(i).children(".tablinks").attr("data-"+ref)-'0';
        let b = arr.eq(j).children(".tablinks").attr("data-"+ref)-'0';
        if( up_or_down == operate(a, b) ) {
          let tmp = arr[i];   arr[i] = arr[j];    arr[j] = tmp;
        }
      }
    }
    // $('#clients').append(arr);
    idles.append(arr);

  } //end sort func
  function sortAvgChatTime() {
    sortUsers("avgTime", sortAvgBool, function(a,b){ return a<b; } );
    var tmp = !sortAvgBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortAvgBool = tmp;
  }
  function sortTotalChatTime() {
    sortUsers("totalTime", sortTotalBool, function(a,b){ return a<b; } );
    var tmp = !sortTotalBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortTotalBool = tmp;
  }
  function sortFirstChatTime() {
    sortUsers("firstTime", sortFirstBool, function(a,b){ return a>b; } );
    var tmp = !sortFirstBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortFirstBool = tmp;
  }
  function sortRecentChatTime() {
    sortUsers("recentTime", sortRecentBool, function(a,b){ return a<b; } );
    var tmp = !sortRecentBool;
    sortAvgBool = sortTotalBool = sortFirstBool = sortRecentBool = true;
    sortRecentBool = tmp;
  }
  // buffer for showProfile
  /*======================= warren ====================================*/
    var buffer;
    function showProfile() {
      var target = $('#selected').attr('rel'); //get useridd of current selected user
      if(target === undefined){
        $('#userInfo-submit').hide();
        $('.modal-title').eq(0).html('No user selected!');
      }else{$('#userInfo-submit').show();}
      socket.emit('get profile',{id: target}) ;
    }


    socket.on('show profile',(data) => {
      var Th = $('.userInfo-th') ;
      var Td = $('.userInfo-td') ;
      var but = $('.edit-button');
      for(let i in but){but.eq(i).hide();} //hide all yes/no buttons
      for(let i in Th ){Th.eq(i).text(Th.eq(i).attr('id')+' : ') ;}
      $('.modal-title').html(data.nickname);
      buffer = data ;  //storage profile in buffer zone
      for(let j in Td){
        for(let key in data ){
          if(key == Td.eq(j).attr('id')){
            Td.eq(j).text(data[key]); //show each profile data
            if(key == 'userId'){Td.eq(j).click(false);}  //disable editing of userid
          }
        }
      }
    });
    function editProfile() {
      let name = $(this).attr('id');
      let origin = $(this).text() ;
      $(this).html('<input type="text" class="textarea" placeholder="'+name+'" value = "'+origin+'">');
      $(this).parent().children('.edit-button').show(); //show yes/no button
      $(this).children().focus(function () {
        $(this).click(false);  //disable click when editing
      })
    //  for(let i in buffer){alert(i+':'+buffer[i]);}
    }
    function changeProfile() {
      let id = $(this).parent().children('.userInfo-td').attr('id');
      let name = $(this).attr('name');
      let content =   $(this).parent().children('.userInfo-td').children().val();  //get agent's input
      let origin = '';
      for(let i in buffer){
          if(i == id ){
            origin = buffer[i]; //storage original profile data
          }
      }
      $(this).parent().children('.userInfo-td').on('click',editProfile); //restore click of userInfo-td
      $(this).parent().children('.edit-button').hide();  //hide yes/no button

      if(name == 'yes'){  //confirm edit, change data in buffer instead of DB
        for(let i in buffer){
          if(i == id ){
            buffer[i] = content ;
            $(this).parent().children('.userInfo-td').html(buffer[i]);
            break;
          }
        }
      }else{  //deny edit, restore data before editing
        $(this).parent().children('.userInfo-td').html(origin);
      }
    }
    function submitProfile() {
      let r = confirm("Are you sure to change profile?");
      if(r){
        socket.emit('update profile',buffer);
      }else{}
    }

  function toAgentStr(msg, name, time) {
    return "<p class='message' rel='" + time + "' style='text-align: right;'>" + msg + "<strong> : " + name + toTimeStr(time) + "</strong><br/></p>";
  }
  function toUserStr(msg, name, time) {
    return "<p class='message' rel='" + time + "'><strong>" + name + toTimeStr(time) + ": </strong>" + msg + "<br/></p>";
  }
  function toDateStr( input ) {
    var str = " ";
    let date = new Date(input);
    str += date.getFullYear() + '/' + addZero(date.getMonth()+1) + '/' + addZero(date.getDate()) + ' ';

    var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    str += week[date.getDay()] + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());
    return str;
  }
  function toTimeStr( input ) {
    let date = new Date(input);
    return " (" + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ") ";
  }
  function addZero(val){
    return val<10 ? '0'+val : val;
  }
  function remove_href_msg(msg) {   //let last msg display correct, not well tested, may many bug
    return msg;
  }

  function determineSessionEnds(){

  }

}); //document ready close tag
