"use strict";

// Local Storage Keys
const USERS_KEY = "users";
const UPLOADS_KEY = "uploads";
const CHATS_KEY = "chats";
const LOGGED_IN_KEY = "loggedIn";

// Error Messages Object
const errorMessages = {
  fillAllFields: "Please fill in all fields.",
  validEmail: "Please enter a valid email address.",
  passwordMismatch: "Password and Confirm Password must match.",
  userExists: "User already exists!",
  wrongCredentials: "Wrong Email or Password",
  userNotFound: "User not found!",
  uploadNotFound: "Upload not found!",
  noUploadId: "No upload ID provided.",
  emptyMessage: "Please enter a message.",
  emptyLabel: "File Description cannot be empty.",
  emailTaken: "This email is already taken by another user.",
  cannotDeleteSelf: "You cannot delete your own account.",
};

// Function to load users from local storage
const loadUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];

// Function to save users to local storage
const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

// Function to load uploads from local storage
const loadUploads = () => JSON.parse(localStorage.getItem(UPLOADS_KEY)) || [];

// Function to save uploads to local storage
const saveUploads = (uploads) =>
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));

// Function to load chats from local storage
const loadChats = () => JSON.parse(localStorage.getItem(CHATS_KEY)) || [];

// Function to save chats to local storage
const saveChats = (chats) =>
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

// Function to check if a user is logged in
const isLoggedIn = () => localStorage.getItem(LOGGED_IN_KEY) !== null;

// Function to get the logged-in user's email
const getLoggedInUserEmail = () => localStorage.getItem(LOGGED_IN_KEY);

// Function to set the logged-in user's email
const setLoggedInUserEmail = (email) =>
  localStorage.setItem(LOGGED_IN_KEY, email);

// Function to remove the logged-in user's email (logout)
const logout = () => localStorage.removeItem(LOGGED_IN_KEY);

// Function to validate email format
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Function to handle login
const login = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === "" || password === "") {
    alert(errorMessages.fillAllFields);
    return;
  }

  if (!validateEmail(email)) {
    alert(errorMessages.validEmail);
    return;
  }

  const users = loadUsers();
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    setLoggedInUserEmail(email);
    window.location.href = "loginSuccess.html";
  } else {
    alert(errorMessages.wrongCredentials);
  }
};

// Function to handle registration
const register = () => {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (
    fullName === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    alert(errorMessages.fillAllFields);
    return;
  }

  if (!validateEmail(email)) {
    alert(errorMessages.validEmail);
    return;
  }

  if (password !== confirmPassword) {
    alert(errorMessages.passwordMismatch);
    return;
  }

  let users = loadUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    alert(errorMessages.userExists);
  } else {
    const newUser = {
      id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
      name: fullName,
      email: email,
      password: password,
    };
    users.push(newUser);
    saveUsers(users);
    window.location.href = "registerSuccess.html";
  }
};

// Function to display the user list
const displayUsers = () => {
  const users = loadUsers();
  const usersTable = document
    .getElementById("usersTable")
    .getElementsByTagName("tbody")[0];
  usersTable.innerHTML = "";

  const loggedInEmail = getLoggedInUserEmail();

  users.forEach((user) => {
    const row = usersTable.insertRow();
    const nameCell = row.insertCell();
    const emailCell = row.insertCell();
    const actionCell = row.insertCell();

    nameCell.textContent = user.name;
    emailCell.textContent = user.email;

    if (user.email === loggedInEmail) {
      actionCell.innerHTML = `
        <a href="editUser.html?id=${user.id}" class="edit-link">Edit</a>
      `;
    } else {
      actionCell.innerHTML = `
        <a href="editUser.html?id=${user.id}" class="edit-link">Edit</a> |
        <a href="#" class="delete-link" onclick="deleteUser(${user.id})">Delete</a>
      `;
    }
  });
};

// Function to delete a user
const deleteUser = (id) => {
  const users = loadUsers();
  const userToDelete = users.find((user) => user.id === id);
  const loggedInEmail = getLoggedInUserEmail();

  if (!userToDelete) {
    alert(errorMessages.userNotFound);
    return;
  }

  if (userToDelete.email === loggedInEmail) {
    alert(errorMessages.cannotDeleteSelf);
    return;
  }

  if (confirm("Are you sure you want to delete this user?")) {
    let updatedUsers = users.filter((user) => user.id !== id);
    saveUsers(updatedUsers);
    displayUsers();

    // Remove associated uploads
    let uploads = loadUploads();
    uploads = uploads.filter(
      (upload) => upload.sharedBy !== userToDelete.email
    );
    saveUploads(uploads);

    // Remove associated chats
    let chats = loadChats();
    chats = chats.filter((chat) => chat.sender !== userToDelete.email);
    saveChats(chats);
  }
};

// Function to get the logged-in user's name
const getLoggedInUserName = () => {
  const email = getLoggedInUserEmail();
  const users = loadUsers();
  const user = users.find((user) => user.email === email);
  return user ? user.name : "User";
};

// Function to display user information for editing
const displayEditUser = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = parseInt(urlParams.get("id"));

  const users = loadUsers();
  const user = users.find((user) => user.id === userId);

  if (user) {
    document.getElementById("fullName").value = user.name;
    document.getElementById("email").value = user.email;
  } else {
    alert(errorMessages.userNotFound);
    window.location.href = "userList.html";
  }
};

// Function to save edited user information
const saveUser = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = parseInt(urlParams.get("id"));
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();

  if (fullName === "" || email === "") {
    alert(errorMessages.fillAllFields);
    return;
  }

  if (!validateEmail(email)) {
    alert(errorMessages.validEmail);
    return;
  }

  let users = loadUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex !== -1) {
    // Check if the new email is already taken by another user
    const emailTaken = users.some(
      (user, index) => user.email === email && index !== userIndex
    );
    if (emailTaken) {
      alert(errorMessages.emailTaken);
      return;
    }

    users[userIndex].name = fullName;
    users[userIndex].email = email;
    saveUsers(users);
    alert("User updated successfully!");
    window.location.href = "userList.html";
  } else {
    alert(errorMessages.userNotFound);
  }
};

// Function to display chat messages
const displayChatMessages = () => {
  let chats = loadChats();

  // Sort chats by timestamp
  chats.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const chatMessagesDiv = document.getElementById("chatMessages");
  const chatUserNameDiv = document.getElementById("chat-user-name");
  chatMessagesDiv.innerHTML = "";
  chatUserNameDiv.textContent = `Logged in as: ${getLoggedInUserName()}`;

  chats.forEach((chat) => {
    const messageElement = document.createElement("p");
    messageElement.textContent = `${chat.timestamp} - ${chat.sender}: ${chat.message}`;
    chatMessagesDiv.appendChild(messageElement);
  });

  // Scroll to the bottom of the chat messages
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
};

// Function to send a chat message
const sendMessage = () => {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message === "") {
    alert(errorMessages.emptyMessage);
    return;
  }

  const loggedinUserEmail = getLoggedInUserEmail();
  const newChat = {
    timestamp: new Date().toLocaleString(),
    sender: loggedinUserEmail,
    message: message,
  };

  const chats = loadChats();
  chats.push(newChat);
  saveChats(chats);
  displayChatMessages();
  messageInput.value = "";
};

// Function to refresh chat messages
const refreshChat = () => {
  displayChatMessages();
};

// Function to display the document list
const displayDocumentList = () => {
  const uploads = loadUploads();
  const myUploadsTable = document
    .getElementById("myUploadsTable")
    .getElementsByTagName("tbody")[0];
  const sharedUploadsTable = document
    .getElementById("sharedUploadsTable")
    .getElementsByTagName("tbody")[0];

  myUploadsTable.innerHTML = "";
  sharedUploadsTable.innerHTML = "";

  const loggedinUserEmail = getLoggedInUserEmail();

  uploads.forEach((upload) => {
    if (upload.sharedBy === loggedinUserEmail) {
      const row = myUploadsTable.insertRow();
      const labelCell = row.insertCell();
      const fileNameCell = row.insertCell();
      const actionCell = row.insertCell();

      labelCell.textContent = upload.label;
      fileNameCell.textContent = upload.fileName;
      actionCell.innerHTML = `
        <a href="editDocument.html?id=${upload.id}" class="edit-link">Edit</a> |
        <a href="deleteUpload.html?id=${upload.id}" class="delete-link">Delete</a>
      `;
    } else {
      const row = sharedUploadsTable.insertRow();
      const labelCell = row.insertCell();
      const fileNameCell = row.insertCell();
      const sharedByCell = row.insertCell();

      labelCell.textContent = upload.label;
      fileNameCell.textContent = upload.fileName;
      sharedByCell.textContent = upload.sharedBy;
    }
  });
};

// Function to add a new upload
const addUpload = () => {
  // Get values from the modal input fields
  const label = document.getElementById("uploadLabel").value.trim();
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];

  if (label === "" || !file) {
    alert(errorMessages.fillAllFields);
    return;
  }

  const fileName = file.name;

  // Create a new upload object
  const newUpload = {
    id:
      loadUploads().length > 0
        ? loadUploads()[loadUploads().length - 1].id + 1
        : 1,
    label: label,
    fileName: fileName,
    sharedBy: getLoggedInUserEmail(),
  };

  // Add the new upload to local storage
  let uploads = loadUploads();
  uploads.push(newUpload);
  saveUploads(uploads);

  // Close the modal and update the document list
  document.getElementById("uploadModal").style.display = "none";
  displayDocumentList();

  // Reset the modal fields
  document.getElementById("uploadLabel").value = "";
  fileInput.value = "";
};

// Function to edit an existing upload
const editDocument = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uploadId = parseInt(urlParams.get("id"));

  if (!uploadId) {
    alert(errorMessages.noUploadId);
    window.location.href = "documentList.html";
    return;
  }

  const uploads = loadUploads();
  const upload = uploads.find((upload) => upload.id === uploadId);

  if (upload) {
    document.getElementById("editLabel").value = upload.label;
    const editFileNameElement = document.getElementById("editFileName");
    if (editFileNameElement) {
      editFileNameElement.textContent = upload.fileName;
    }
  } else {
    alert(errorMessages.uploadNotFound);
    window.location.href = "documentList.html";
  }
};

// Function to save the edited upload
const saveEditedUpload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uploadId = parseInt(urlParams.get("id"));
  const newLabel = document.getElementById("editLabel").value.trim();

  if (newLabel === "") {
    alert(errorMessages.emptyLabel);
    return;
  }

  let uploads = loadUploads();
  const uploadIndex = uploads.findIndex((upload) => upload.id === uploadId);

  if (uploadIndex !== -1) {
    uploads[uploadIndex].label = newLabel;
    saveUploads(uploads);
    alert("Upload updated successfully!");
    window.location.href = "documentList.html";
  } else {
    alert(errorMessages.uploadNotFound);
  }
};

// Function to delete an upload
const confirmDelete = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uploadId = parseInt(urlParams.get("id"));

  if (!uploadId) {
    alert(errorMessages.noUploadId);
    window.location.href = "documentList.html";
    return;
  }

  let uploads = loadUploads();
  const uploadIndex = uploads.findIndex((upload) => upload.id === uploadId);

  if (uploadIndex !== -1) {
    uploads.splice(uploadIndex, 1);
    saveUploads(uploads);
    alert("Upload deleted successfully!");
    window.location.href = "documentList.html";
  } else {
    alert(errorMessages.uploadNotFound);
  }
};

// Function to populate delete confirmation details
const populateDeleteConfirmation = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const uploadId = parseInt(urlParams.get("id"));

  if (!uploadId) {
    alert(errorMessages.noUploadId);
    window.location.href = "documentList.html";
    return;
  }

  const uploads = loadUploads();
  const upload = uploads.find((upload) => upload.id === uploadId);

  if (upload) {
    const deleteLabelElement = document.getElementById("deleteLabel");
    const deleteFileNameElement = document.getElementById("deleteFileName");
    if (deleteLabelElement && deleteFileNameElement) {
      deleteLabelElement.textContent = upload.label;
      deleteFileNameElement.textContent = upload.fileName;
    }
  } else {
    alert(errorMessages.uploadNotFound);
    window.location.href = "documentList.html";
  }
};

// Function to create and inject navigation
const createNav = () => {
  const navHtml = `
    <div class="navigation">
      <a href="chatList.html">Group Chat</a>
      <a href="userList.html">Manage Users</a>
      <a href="documentList.html">Manage Documents</a>
      <a href="logout.html">Logout</a>
    </div>
  `;

  const headerContainer = document.querySelector(".header");
  if (headerContainer) {
    headerContainer.innerHTML = navHtml;
  }
};

// Function to restrict access to internal pages
const restrictAccess = () => {
  const internalPages = [
    "chatList.html",
    "userList.html",
    "documentList.html",
    "editUser.html",
    "editDocument.html",
    "deleteUpload.html",
    "loginSuccess.html",
  ];
  const currentPage = window.location.pathname.split("/").pop();

  if (internalPages.includes(currentPage) && !isLoggedIn()) {
    window.location.href = "login.html";
  }
};

// Function to display logged-in username on chat page
const displayLoggedInUsername = () => {
  const chatUserNameDiv = document.getElementById("chat-user-name");
  if (chatUserNameDiv) {
    chatUserNameDiv.textContent = `${getLoggedInUserName()}`;
  }
};

// Function to handle page-specific initializations
const initializePage = () => {
  const currentPage = window.location.pathname.split("/").pop();

  // Inject navigation except on specified pages
  const excludeNavPages = [
    "register.html",
    "login.html",
    "registerSuccess.html",
    "logout.html",
    "welcome.html",
  ];
  if (!excludeNavPages.includes(currentPage)) {
    createNav();
  }

  // Display welcome message if on loginSuccess.html
  if (currentPage === "loginSuccess.html") {
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome! ${getLoggedInUserEmail()}`;
    }
  }

  // Display logout message if on logout.html
  if (currentPage === "logout.html") {
    const logoutMessage = document.getElementById("logoutMessage");
    if (logoutMessage) {
      logoutMessage.textContent = "You have been logged out.";
    }
  }

  // Load and display the user list on userList.html
  if (currentPage === "userList.html") {
    displayUsers();
  }

  // Load and display user information for editing on editUser.html
  if (currentPage === "editUser.html") {
    displayEditUser();
  }

  // Load and display chat messages on chatList.html
  if (currentPage === "chatList.html") {
    displayChatMessages();
    displayLoggedInUsername();
  }

  // Load and display the document list on documentList.html
  if (currentPage === "documentList.html") {
    displayDocumentList();
  }

  // If on editDocument.html, populate the form
  if (currentPage === "editDocument.html") {
    editDocument();
  }

  // If on deleteUpload.html, populate the confirmation
  if (currentPage === "deleteUpload.html") {
    populateDeleteConfirmation();
  }

  // Add event listeners for buttons without inline onclick
  if (currentPage === "chatList.html") {
    const sendMessageButton = document.getElementById("sendMessageButton");
    const refreshChatButton = document.getElementById("refreshChatButton");

    if (sendMessageButton) {
      sendMessageButton.addEventListener("click", sendMessage);
    }

    if (refreshChatButton) {
      refreshChatButton.addEventListener("click", refreshChat);
    }
  }

  if (currentPage === "documentList.html") {
    const addUploadButton = document.getElementById("addUploadButton");
    if (addUploadButton) {
      addUploadButton.addEventListener("click", () => {
        document.getElementById("uploadModal").style.display = "block";
      });
    }

    // Close modal when clicking outside of the modal content
    window.onclick = (event) => {
      const modal = document.getElementById("uploadModal");
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  // Add event listener for Register button on register.html
  if (currentPage === "register.html") {
    const registerButton = document.getElementById("registerButton");
    if (registerButton) {
      registerButton.addEventListener("click", register);
    }
  }

  // Add event listener for Login button on login.html (if applicable)
  if (currentPage === "login.html") {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", login);
    }
  }
};

// Check for user login status and initialize page
window.onload = () => {
  restrictAccess();
  initializePage();
};
