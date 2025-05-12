'use strict'; // Kích hoạt chế độ nghiêm ngặt để tránh lỗi lập trình phổ biến

// Truy xuất các phần tử HTML cần dùng
const usernamePage = document.querySelector('#username-page'); // Trang nhập tên người dùng
const chatPage = document.querySelector('#chat-page'); // Trang giao diện chat
const usernameForm = document.querySelector('#usernameForm'); // Form nhập tên
const messageForm = document.querySelector('#messageForm'); // Form gửi tin nhắn
const messageInput = document.querySelector('#message'); // Ô nhập nội dung tin nhắn
const connectingElement = document.querySelector('.connecting'); // Thông báo kết nối
const chatArea = document.querySelector('#chat-messages'); // Khu vực hiển thị tin nhắn
const logout = document.querySelector('#logout'); // Nút đăng xuất

// Các biến toàn cục lưu trạng thái ứng dụng
let stompClient = null; // Đối tượng STOMP client
let nickname = null; // Tên đăng nhập người dùng
let fullname = null; // Họ tên người dùng
let selectedUserId = null; // ID của người dùng đang được chọn để chat

// Xử lý khi người dùng nhấn nút đăng nhập
function connect(event) {
    nickname = document.querySelector('#nickname').value.trim(); // Lấy nickname từ ô nhập
    fullname = document.querySelector('#fullname').value.trim(); // Lấy họ tên

    if (nickname && fullname) {
        usernamePage.classList.add('hidden'); // Ẩn trang nhập tên
        chatPage.classList.remove('hidden'); // Hiện giao diện chat

        const socket = new SockJS('/ws'); // Tạo kết nối SockJS đến server WebSocket
        stompClient = Stomp.over(socket); // Khởi tạo STOMP client

        stompClient.connect({}, onConnected, onError); // Kết nối và chỉ định hàm callback
    }
    event.preventDefault(); // Ngăn reload trang
}

// Gọi khi kết nối STOMP thành công
function onConnected() {
    // Đăng ký nhận tin nhắn từ hàng đợi cá nhân và kênh công khai
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    // Gửi thông báo lên server rằng người dùng đã online
    stompClient.send("/app/user.addUser", {}, JSON.stringify({
        nickName: nickname,
        fullName: fullname,
        status: 'ONLINE'
    }));

    document.querySelector('#connected-user-fullname').textContent = fullname; // Hiển thị họ tên
    findAndDisplayConnectedUsers().then(); // Lấy danh sách người đang online
}

// Gửi yêu cầu lấy danh sách người dùng đang online và hiển thị
async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users'); // Gửi yêu cầu tới server
    let connectedUsers = await connectedUsersResponse.json(); // Parse kết quả JSON

    connectedUsers = connectedUsers.filter(user => user.nickName !== nickname); // Bỏ chính mình ra
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = ''; // Xóa danh sách cũ

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList); // Thêm từng người vào danh sách

        // Thêm dấu phân cách nếu chưa phải phần tử cuối
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

// Tạo phần tử HTML đại diện cho một người dùng và thêm vào danh sách
function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickName;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullName;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullName;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0'; // Số tin nhắn chưa đọc
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick); // Gắn sự kiện click để chọn user

    connectedUsersList.appendChild(listItem);
}

// Xử lý khi người dùng chọn một người để chat
function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active'); // Bỏ chọn tất cả
    });

    messageForm.classList.remove('hidden'); // Hiện form nhập tin nhắn

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active'); // Đánh dấu người đang được chọn

    selectedUserId = clickedUser.getAttribute('id'); // Lấy ID người nhận
    fetchAndDisplayUserChat().then(); // Lấy lịch sử chat với người này

    // Xóa thông báo số tin chưa đọc
    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

// Hiển thị tin nhắn trong khu vực chat
function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    // Xác định ai là người gửi
    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

// Lấy lịch sử trò chuyện giữa người dùng hiện tại và người đang được chọn
async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();

    chatArea.innerHTML = ''; // Xóa nội dung cũ

    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content); // Hiển thị từng tin nhắn
    });

    chatArea.scrollTop = chatArea.scrollHeight; // Cuộn xuống cuối
}

// Hiển thị lỗi nếu không kết nối được WebSocket
function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

// Gửi tin nhắn
function sendMessage(event) {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };

        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage)); // Gửi qua WebSocket
        displayMessage(nickname, messageInput.value.trim()); // Hiển thị ngay tin vừa gửi
        messageInput.value = ''; // Xóa ô nhập
    }

    chatArea.scrollTop = chatArea.scrollHeight; // Cuộn xuống cuối
    event.preventDefault();
}

// Nhận tin nhắn từ server
async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers(); // Cập nhật lại danh sách người dùng

    console.log('Message received', payload); // In log để kiểm tra

    const message = JSON.parse(payload.body); // Parse tin nhắn

    // Nếu đang chat với người gửi thì hiển thị ngay
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden'); // Ẩn form nếu chưa chọn ai
    }

    // Thông báo tin nhắn mới nếu không phải đang chat với người đó
    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = ''; // Có thể cải tiến: tăng số lượng tin chưa đọc
    }
}

// Gửi thông báo ngắt kết nối và reload trang
function onLogout() {
    stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({
        nickName: nickname,
        fullName: fullname,
        status: 'OFFLINE'
    }));
    window.location.reload();
}

// Gắn các sự kiện người dùng
usernameForm.addEventListener('submit', connect, true); // Khi đăng nhập
messageForm.addEventListener('submit', sendMessage, true); // Khi gửi tin
logout.addEventListener('click', onLogout, true); // Khi đăng xuất
window.onbeforeunload = () => onLogout(); // Khi đóng/trở lại trang
