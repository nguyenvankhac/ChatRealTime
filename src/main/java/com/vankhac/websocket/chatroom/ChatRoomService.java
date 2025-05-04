package com.vankhac.websocket.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    public Optional<String> getchatRoomId(
            String senderId,
            String recipientId,
            boolean createNewRoomIfNotExists
    ) {
        return chatRoomRepository.finBySenderIdAndRecipientId(senderId,recipientId)
                .map(ChatRoom::getChatId)
                .or(() ->{
                    if (createNewRoomIfNotExists){
                        var chatId = createChat(senderId , recipientId);
                    }
                    return Optional.empty();
                });

    }

    private String createChat(String senderId, String recipientId) {
        var chatId = String.format("%s_%s",senderId, recipientId);
        return null;
    }
}
