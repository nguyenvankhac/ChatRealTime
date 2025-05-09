package com.vankhac.websocket.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class Usercontroller {

    private final UserService service;

    @MessageMapping("/user.addUser")
    @SendTo("/user/topic")
    public User addUser(
              @Payload User user
    ){
        service.saveUser(user);
        return user;
    }
    public User disconect(
            @Payload User user
    ){
        service.disconnect(user);
        return user;
    }
    @GetMapping("/users")
    public ResponseEntity<List<User>> finConnectedUsers(){
        return ResponseEntity.ok(service.findConnectedUsers());
    }
}
