var key
var sublist  = []

var DataTicket
var DataAgent
var DataContact
var DataSolution

$(document).ready(function() {
  var socket = io.connect()

  if(window.location.pathname === '/ticket'){
    document.getElementById("defaultOpen").click() // open tab selected
    setTimeout(loadTable, 1000)
  }

  $(document).on('click', '#signout-btn', logout) //登出

  socket.on('all tickets info', data => {
    // console.log('Ticket: ')
    // console.log(data[0])
    DataTicket = data
  })

  socket.on('all agents info', data => {
    // console.log('Agent: ')
    // console.log(data[0])
    DataAgent = data
  })

  socket.on('all contacts info', data => {
    console.log('Contact: ')
    console.log(data)
    DataContact = data
  })

  socket.on('all solutions info', data => {
    // console.log('Solutions: ')
    // console.log(data)
    DataSolution = data
  })


})

//functions
function loadTable(){
  // console.log('loaded')
  // console.log(DataTicket);

  for(let i=0;i < DataTicket.length;i++){
      if(DataTicket[i].status === 5) {
        $('#closed-ticket-list').prepend(
          '<tr>' +
            '<td id="' + DataTicket[i].id + '">' + DataTicket[i].id + '</td>' +
            '<td>' + DataTicket[i].subject + '</td>' +
            // '<td class="category">' + DataTicket[i].category + '</td>' +
            '<td>' + statusMark(DataTicket[i].status) + '</td>' +
            '<td>' + priorityMark(DataTicket[i].priority) + '</td>' +
            // '<td class="owner">' + DataTicket[i].owner + '</td>' +
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
            '<td id="' + DataTicket[i].id + '">' + DataTicket[i].id + '</td>' +
            '<td>' + DataTicket[i].subject + '</td>' +
            // '<td class="category">' + DataTicket[i].category + '</td>' +
            '<td>' + statusMark(DataTicket[i].status) + '</td>' +
            '<td>' + priorityMark(DataTicket[i].priority) + '</td>' +
            // '<td class="owner">' + DataTicket[i].owner + '</td>' +
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
}

function submitAdd(){

}

function statusMark(status){
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

function priorityMark(priority){
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
