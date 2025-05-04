package com.vankhac.websocket.chat;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document
@Builder
public class ChatMessage {
    @Id
    private String id;
    private String chatId;
    private String senderId;
}
