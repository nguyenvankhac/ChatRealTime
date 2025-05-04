// Khai báo package cho lớp WebSocketConfig
package com.vankhac.websocket.config;

// Import các thư viện cần thiết
import com.fasterxml.jackson.databind.ObjectMapper; // Dùng để ánh xạ (map) dữ liệu JSON sang đối tượng Java
import org.springframework.context.annotation.Configuration; // Đánh dấu lớp là một cấu hình Spring
import org.springframework.messaging.converter.DefaultContentTypeResolver; // Dùng để thiết lập kiểu MIME mặc định cho converter
import org.springframework.messaging.converter.MappingJackson2MessageConverter; // Converter để chuyển đổi giữa JSON và đối tượng Java
import org.springframework.messaging.converter.MessageConverter; // Interface chung cho các converter của Spring Messaging
import org.springframework.messaging.simp.config.MessageBrokerRegistry; // Dùng để cấu hình message broker (trung gian xử lý tin nhắn)
import org.springframework.util.MimeTypeUtils; // Hằng số định nghĩa MIME types
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker; // Kích hoạt hỗ trợ WebSocket và STOMP
import org.springframework.web.socket.config.annotation.StompEndpointRegistry; // Dùng để đăng ký endpoint STOMP
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer; // Interface để cấu hình WebSocket

import java.util.List; // Sử dụng List để cấu hình danh sách converter

// Kích hoạt WebSocket message broker
@EnableWebSocketMessageBroker
// Đánh dấu đây là một lớp cấu hình Spring
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Cấu hình message broker
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Kích hoạt một broker đơn giản với prefix "/user"
        registry.enableSimpleBroker("/user");
        // Định nghĩa prefix cho các message gửi từ client tới server
        registry.setApplicationDestinationPrefixes("/app");
        // Định nghĩa prefix để gửi message tới người dùng cụ thể
        registry.setUserDestinationPrefix("/user");
    }

    // Đăng ký endpoint STOMP để client kết nối
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Tạo endpoint tại đường dẫn "/ws" và kích hoạt SockJS (fallback cho WebSocket)
        registry.addEndpoint("/ws")
                .withSockJS();
    }

    // Cấu hình converter cho message (chuyển đổi giữa JSON và Java object)
    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        // Tạo resolver mặc định cho MIME type và thiết lập kiểu mặc định là JSON
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);

        // Tạo converter sử dụng Jackson để ánh xạ JSON
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(new ObjectMapper()); // Sử dụng ObjectMapper mặc định
        converter.setContentTypeResolver(resolver); // Gắn resolver MIME vào converter

        // Thêm converter vào danh sách
        messageConverters.add(converter);

        // Trả về false để giữ lại các converter mặc định khác của Spring
        return false;
    }
}
