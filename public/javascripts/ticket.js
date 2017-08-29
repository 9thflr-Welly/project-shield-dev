var key
var sublist  = []

var yourdomain = 'fongyu';
var api_key = '4qydTzwnD7xRGaTt7Hqw';

$(document).ready(function() {
  var socket = io.connect()

  if(window.location.pathname === '/ticket'){
    document.getElementById("defaultOpen").click() // open tab selected
    setTimeout(loadTable, 1000)
  }

  $(document).on('click', '#signout-btn', logout) //登出
  $(document).on('click', '#form-goback', goBack) //上一頁
  $(document).on('click', '#form-submit', submitAdd) //ticket form 送出
  $(document).on('click', '#edit-submit', changeEdit) //ticket form 送出
  $(document).on('click', '#deleBtn', deleteTicket) //ticket form 送出
  // modal效果
  $(document).on('click', '#editBtn', modalEdit); //editModal 打開
  $(document).on('click', '#viewBtn', modalView); //viewModal 打開
  $('#editModal').on('hidden.bs.modal', reset); //editModal 收起來
  $('#viewModal').on('hidden.bs.modal', reset); //viewModal 收起來

  //=========[SEARCH by TEXT]=========
  $("#exampleInputAmount").keyup(function() {
    var open_rows = $('#open-ticket-list tr');
    var close_rows = $('#closed-ticket-list tr');
    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

    open_rows.show().filter(function() {
      var text1 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
      return !~text1.indexOf(val);
    }).hide();

    close_rows.show().filter(function() {
      var text2 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
      return !~text2.indexOf(val);
    }).hide();
  });

})

//functions
function loadTable(){
  $.ajax(
    {
      url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets?include=requester",
      type: 'GET',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "Authorization": "Basic " + btoa(api_key + ":x")
      },
      success: function(data, textStatus, jqXHR) {
        // console.log(data);
        for(let i=0;i < data.length;i++){
            if(data[i].status === 5) {
              $('#closed-ticket-list').prepend(
                '<tr>' +
                  '<td id="' + data[i].id + '">' + data[i].id + '</td>' +
                  '<td>' + data[i].subject + '</td>' +
                  '<td>' + statusNumberToText(data[i].status) + '</td>' +
                  '<td>' + priorityNumberToText(data[i].priority) + '</td>' +
                  '<td>' +
                    '<button type="button" id="editBtn" data-toggle="modal" data-target="#editModal">Edit</button>' +
                    ' ' +
                    '<button type="button" id="viewBtn" data-toggle="modal" data-target="#viewModal">View</button>' +
                    ' ' +
                    '<button type="button" id="deleBtn">Delete</button>' +
                  '</td>' +
                '</tr>'
              );
            } else {
              $('#open-ticket-list').prepend(
                '<tr>' +
                  '<td id="' + data[i].id + '">' + data[i].id + '</td>' +
                  '<td>' + data[i].subject + '</td>' +
                  '<td>' + statusNumberToText(data[i].status) + '</td>' +
                  '<td>' + priorityNumberToText(data[i].priority) + '</td>' +
                  '<td>' +
                    '<button type="button" id="editBtn" data-toggle="modal" data-target="#editModal">Edit</button>' +
                    ' ' +
                    '<button type="button" id="viewBtn" data-toggle="modal" data-target="#viewModal">View</button>' +
                    ' ' +
                    '<button type="button" id="deleBtn">Delete</button>' +
                  '</td>' +
                '</tr>'
              );
            }
          }
      },
      error: function(jqXHR, tranStatus) {
        console.log('error');
      }
    }
  );


}

function submitAdd(){
  let subject = $('#form-subject').val();
  let email = $('#form-email').val();
  let phone = $('#form-phone').val();
  let status = $('#form-status option:selected').text();
  let priority = $('#form-priority option:selected').text();
  let description = $('#form-description').val();
  ticket_data = '{ "description": "'+description+'", "subject": "'+subject+'", "email": "'+email+'", "phone": "'+phone+'", "priority": '+priorityTextToMark(priority)+', "status": '+statusTextToMark(status)+' }';

  // 驗證
  let email_reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
  let phone_reg = /\b[0-9]+\b/;
  if(!email_reg.test(email)){
    $('#error').append('請輸入正確的email格式');
    $('#form-email').css('border', '1px solid red');
    setTimeout(() => {
      $('#error').empty();
      $('#form-email').css('border', '1px solid #ccc');
    }, 3000);
  } else if(!phone_reg.test(phone)) {
    $('#error').append('請輸入正確的電話格式');
    $('#form-phone').css('border', '1px solid red');
    setTimeout(() => {
      $('#error').empty();
      $('#form-phone').css('border', '1px solid #ccc');
    }, 3000);
  } else if($('#form-subject').val().trim() === '') {
    $('#error').append('請輸入主題');
    $('#form-subject').css('border', '1px solid red');
    setTimeout(() => {
      $('#error').empty();
      $('#form-subject').css('border', '1px solid #ccc');
    }, 3000);
  } else if($('#form-description').val().trim() === '') {
    $('#error').append('請輸入內容');
    $('#form-description').css('border', '1px solid red');
    setTimeout(() => {
      $('#error').empty();
      $('#form-description').css('border', '1px solid #ccc');
    }, 3000);
  } else {
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets",
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        data: ticket_data,
        success: function(data, textStatus, jqXHR) {
          // console.log('works');
        },
        error: function(jqXHR, tranStatus) {
          x_request_id = jqXHR.getResponseHeader('X-Request-Id');
          response_text = jqXHR.responseText;
        }
      }
    );

    $('#form-subject').val('');
    $('#form-email').val('');
    $('#form-phone').val('');
    $('#form-description').val('');

    setTimeout(() => {
      location.href = '/ticket';
    }, 1000)
  }

}

function goBack(){
  window.history.back();
}

function statusNumberToText(status){
  switch(status) {
    case 5:
        return 'Closed';
        break;
    case 4:
        return 'Resolved';
        break;
    case 3:
        return 'Pending';
        break;
    default:
        return 'Open';
  }
}

function priorityNumberToText(priority){
  switch(priority) {
    case 4:
        return 'Urgent';
        break;
    case 3:
        return 'High';
        break;
    case 2:
        return 'Medium';
        break;
    default:
        return 'Low';
  }
}

function statusTextToMark(status){
  switch(status) {
    case 'Closed':
        return 5;
        break;
    case 'Resolved':
        return 4;
        break;
    case 'Pending':
        return 3;
        break;
    default:
        return 2;
  }
}

function priorityTextToMark(priority){
  switch(priority) {
    case 'Urgent':
        return 4;
        break;
    case 'High':
        return 3;
        break;
    case 'Medium':
        return 2;
        break;
    default:
        return 1;
  }
}

function openCity(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent")
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks")
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "")
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block"
    evt.currentTarget.className += " active"
}

function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login")
  })
}

function deleteTicket(){
  let id = $(this).parent().parent().find('td:first').text();
  let confirm_delete = confirm('Are you sure?');

  if(confirm_delete){
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+id,
        type: 'DELETE',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        success: function(data, textStatus, jqXHR) {
          // console.log('deleted');
        },
        error: function(jqXHR, tranStatus) {
          console.log('error');
        }
      }
    );

    setTimeout(() => {
      location.reload();
    }, 1000)
  }

}

function reset(){
  $('#view-id').text(''); //主題
  $('#view-subject').text(''); //主題
  $('#view-email').text(''); //email
  $('#view-phone').text(''); //電話
  $('#view-status').text(''); //狀態
  $('#view-priority').text(''); //緊急
  $('#view-description').text(''); //說明

  $('#edit-id').text(''); // 編號
  $('#edit-subject').val(''); //主題
  $('#edit-email').val(''); //email
  $('#edit-phone').val(''); //電話
  $('#edit-status').val('Open'); //狀態
  $('#edit-priority').val('Low'); //緊急
  $('#edit-description').val(''); //說明
}

// Modal Actions
function modalEdit(){
  let id = $(this).parent().parent().find('td:first').text();
  let contact_id;

  $.ajax(
    {
      url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+id+"?include=requester",
      type: 'GET',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "Authorization": "Basic " + btoa(api_key + ":x")
      },
      success: function(data, textStatus, jqXHR) {
        // console.log(data);
        contact_id = data.requester_id;
        $('#edit-id').text(data.id);
        $('#edit-subject').val(data.subject);
        $('#edit-email').val(data.requester.email);
        $('#edit-status').val(statusNumberToText(data.status));
        $('#edit-priority').val(priorityNumberToText(data.priority));
        $('#edit-description').val(data.description_text.trim());
      },
      error: function(jqXHR, tranStatus) {
        x_request_id = jqXHR.getResponseHeader('X-Request-Id');
        response_text = jqXHR.responseText;
      }
    }
  );

  setTimeout(() => {
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/contacts/"+contact_id,
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        success: function(data, textStatus, jqXHR) {
          // console.log(data);
          $('#edit-phone').val(data.phone);
        },
        error: function(jqXHR, tranStatus) {
          x_request_id = jqXHR.getResponseHeader('X-Request-Id');
          response_text = jqXHR.responseText;
        }
      }
    );
  }, 1000)

}
function modalView(){
  let id = $(this).parent().parent().find('td:first').text();

  $.ajax(
    {
      url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+id+"?include=requester",
      type: 'GET',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "Authorization": "Basic " + btoa(api_key + ":x")
      },
      success: function(data, textStatus, jqXHR) {
        // console.log(data);
        $('#view-id').text(data.id);
        $('#view-subject').text(data.subject);
        $('#view-email').text(data.requester.email);
        $('#view-phone').text(data.requester.phone);
        $('#view-status').text(statusNumberToText(data.status));
        $('#view-priority').text(priorityNumberToText(data.priority));
        $('#view-description').text(data.description_text.trim());
      },
      error: function(jqXHR, tranStatus) {
        x_request_id = jqXHR.getResponseHeader('X-Request-Id');
        response_text = jqXHR.responseText;
      }
    }
  );
}
function changeEdit(){
  let id = $('#edit-id').text();
  let subject = $('#edit-subject').val();
  let email = $('#edit-email').val();
  let phone = $('#edit-phone').val();
  let status = $('#edit-status option:selected').text();
  let priority = $('#edit-priority option:selected').text();
  let description = $('#edit-description').val();
  ticket_data = '{ "description": "'+description+'", "subject": "'+subject+'", "email": "'+email+'", "priority": '+priorityTextToMark(priority)+', "status": '+statusTextToMark(status)+' }';

  contact_phone = '{ "phone": "'+phone+'" }';
  var update_id;
  // console.log(typeof subject, typeof email, typeof phone, typeof statusTextToMark(status), typeof priorityTextToMark(priority), typeof description);

  $('#loading').text('Loading...');

  $.ajax(
    {
      url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets/"+id,
      type: 'PUT',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "Authorization": "Basic " + btoa(api_key + ":X")
      },
      data: ticket_data,
      success: function(data, textStatus, jqXHR) {
        update_id = data.requester_id;
        alert('Saved!');
      },
      error: function(jqXHR, tranStatus) {
        console.log('save error');
      }
    }
  );

  setTimeout(() => {
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/contacts/"+update_id,
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":X")
        },
        data: contact_phone,
        success: function(data, textStatus, jqXHR) {

        },
        error: function(jqXHR, tranStatus) {
          console.log('save error');
        }
      }
    );
  }, 1000)

  setTimeout(() => {
    location.reload();
    $('#loading').empty();
  }, 1000)

}
// Modal Actions Ends

// Sorting Starts
//=========[SORT OPEN]=========
function sortOpenTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0
  table = document.getElementById("open-Table")
  switching = true
  //Set the sorting direction to ascending:
  dir = "asc"
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false
    rows = table.getElementsByTagName("TR")
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n]
      y = rows[i + 1].getElementsByTagName("TD")[n]
      // console.log(x, y)
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir === "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true
          break
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true
          break
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
      //Each time a switch is done, increase this count by 1:
      switchcount ++
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc"
        switching = true
      }
    }
  }
}

//=========[SORT CLOSE]=========
function sortCloseTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0
  table = document.getElementById("close-Table")
  switching = true
  //Set the sorting direction to ascending:
  dir = "asc"
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false
    rows = table.getElementsByTagName("TR")
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n]
      y = rows[i + 1].getElementsByTagName("TD")[n]
      // console.log(x, y)
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true
          break
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true
          break
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
      //Each time a switch is done, increase this count by 1:
      switchcount ++
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc"
        switching = true
      }
    }
  }
}
// Sorting Ends
