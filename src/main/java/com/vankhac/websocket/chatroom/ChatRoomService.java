package com.vankhac.websocket.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    // Inject repository để thao tác với dữ liệu phòng chat
    private final ChatRoomRepository chatRoomRepository;

    /**
     * Lấy ID của phòng chat giữa hai người dùng.
     * @param senderId ID của người gửi
     * @param recipientId ID của người nhận
     * @param createNewRoomIfNotExists Nếu true thì sẽ tạo phòng chat mới nếu chưa tồn tại
     * @return Optional chứa chatId nếu tìm thấy hoặc tạo mới, ngược lại trả về Optional.empty()
     */
    public Optional<String> getchatRoomId(
            String senderId,
            String recipientId,
            boolean createNewRoomIfNotExists
    ) {
        return chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId)
                .map(ChatRoom::getChatId) // Nếu đã tồn tại phòng chat thì lấy chatId
                .or(() -> {
                    if (createNewRoomIfNotExists) {
                        // Nếu không tồn tại và cho phép tạo mới, thì tạo chatId
                        var chatId = createChatId(senderId, recipientId);
                        return Optional.of(chatId);
                    }
                    // Nếu không được phép tạo mới, trả về empty
                    return Optional.empty();
                });
    }

    /**
     * Tạo mới một chatId cho hai người dùng và lưu vào database cả hai chiều người gửi - người nhận.
     * @param senderId ID người gửi
     * @param recipientId ID người nhận
     * @return chatId được tạo ra
     */
    private String createChatId(String senderId, String recipientId) {
        // Định dạng chatId dưới dạng "sender_recipient"
        var chatId = String.format("%s_%s", senderId, recipientId);

        // Tạo đối tượng ChatRoom cho chiều sender -> recipient
        ChatRoom senderRecipient = ChatRoom.builder()
                .chatId(chatId)
                .senderId(senderId)
                .recipientId(recipientId)
                .build();

        // Tạo đối tượng ChatRoom cho chiều recipient -> sender
        ChatRoom recipientSender = ChatRoom.builder()
                .chatId(chatId)
                .senderId(recipientId)
                .recipientId(senderId)
                .build();

        // Lưu cả hai vào cơ sở dữ liệu để tiện tra cứu từ cả hai phía
        chatRoomRepository.save(senderRecipient);
        chatRoomRepository.save(recipientSender);

        return chatId;
    }
}
