const socket = io();

let form = document.querySelector(".form"),
  text = document.querySelector(".text"),
  container = document.querySelector(".text-container"),
  name = localStorage.getItem("name"),
  nameContainer = document.querySelector(".name-container"),
  exitBtn = document.querySelector(".exit"),
  type = document.querySelector(".type"),
  room = document.querySelector(".room"),
  roomBtn = document.querySelector(".room-btn"),
  roomContainer = document.querySelector(".room-container"),
  roomBtns = document.querySelectorAll(".roomBtn"),
  select = document.querySelector("select"),
  clearBtn = document.querySelector(".clear");

// let roomBtns;
let userRooms = [];
//* listener
socket.on("chat", (data) => {
  displayMessage(data.message, data.name, data.room);
});

socket.on("online", (users) => {
  displayUsers(users);
});

socket.on("type", (data) => {
  type.classList.remove("d-none");
  type.innerHTML = `
  ${data.name} درحال نوشتن است ...
  `;
});

socket.on("rooms", (rooms) => {
  displayRooms(rooms);
});

// socket.on("leave-room", (rooms) => {});

socket.on("remove-type", () => {
  type.classList.add("d-none");
  type.innerHTML = "";
});

//* emitter

socket.emit("login", {
  name,
});

exitBtn.addEventListener("click", exit);

text.addEventListener("keypress", () => {
  socket.emit("type", {
    name,
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = text.value;
  const room = select.value;
  if (value) {
    socket.emit("chat", {
      message: value,
      name,
      room,
    });
    text.value = "";
  }
  document.body.scrollTop = container.scrollHeight - container.clientHeight;
});

roomBtn.addEventListener("click", () => {
  if (room.value) {
    socket.emit("join-room", room.value);
  }
  room.value = "";
});

clearBtn.addEventListener("click", () => {
  container.innerHTML = "";
});

//* functions

function exit() {
  localStorage.clear();
  location.href = "./index.html";
}

function displayMessage(message, nickname, room) {
  let chatRoom = "";
  room == "" ? (chatRoom = "عمومی") : (chatRoom = room);
  if (nickname == name) {
    container.innerHTML +=
      //
      `<div class="alert alert-warning">
      <h5 class="text-danger mb-0">شما در ${chatRoom}</h5>
      <p class="mb-0">${message}</p>
      </div>`;
  } else {
    container.innerHTML +=
      //
      `<div class="alert alert-success w-100">
          <h5 class="text-danger mb-0">${nickname} در ${chatRoom}</h5>
          <p class="mb-0">${message}</p>
          </div>`;
  }
}

function displayUsers(users) {
  nameContainer.innerHTML = "";
  Object.values(users).forEach((nickname) => {
    if (nickname == name) {
      nameContainer.innerHTML += `<div class="alert alert-success mr-2">
        ${nickname}
      </div>`;
    } else {
      nameContainer.innerHTML += `
          <div class="alert alert-secondary mr-2">
          ${nickname}
        </div>
          `;
    }
  });
}

function displayRooms(rooms) {
  userRooms = rooms;
  roomContainer.innerHTML = "";
  rooms.forEach((r) => {
    roomContainer.innerHTML += `<button class="btn btn-danger mr-2 roomBtn" room-name="${r}">
    ${r}
  </button>`;
  });
  roomBtns = document.querySelectorAll(".roomBtn");
  displayBtns();
  manageRooms(rooms);
}

function displayBtns() {
  roomBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let room = btn.getAttribute("room-name");
      socket.emit("leave-room", room);
    });
  });
}

function manageRooms(rooms) {
  select.innerHTML = "<option selected value=''>عمومی</option>";
  rooms.forEach((room) => {
    select.innerHTML += `<option value="${room}">${room}</option>`;
  });
}
