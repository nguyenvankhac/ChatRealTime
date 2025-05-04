package com.vankhac.websocket.chatroom;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom,String> {

    Optional<ChatRoom> finBySenderIdAndRecipientId(String senderId , String recipientId);
}
