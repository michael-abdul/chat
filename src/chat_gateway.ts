import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from "@nestjs/websockets";
import { MessageDto } from "./dto/messageDto";

interface ActiveUser {
  socketId: string;
  userId: string;
}

@WebSocketGateway({
    cors: {
      origin: '*', // Muvofiqlik uchun kerak
    },
  })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  private activeUsers: ActiveUser[] = [];

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeUsers = this.activeUsers.filter(user => user.socketId !== client.id);
  }
  @SubscribeMessage("register_user")
  handleRegisterUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: any) {
    console.log('Registering user:', data); // Debug
    console.log('Client ID:', client.id); // Debug
  
    if (!data || !data.userId) {
      console.log('Invalid user data:', data); // Yuborilgan ma'lumot noto'g'ri bo'lishi mumkin
      return;
    }
  
    const existingUser = this.activeUsers.find(user => user.userId === data.userId);
  
    if (existingUser) {
      existingUser.socketId = client.id; // Mavjud foydalanuvchining socketId yangilanadi
    } else {
      this.activeUsers.push({ socketId: client.id, userId: data.userId });
    }
  
    console.log('Active Users:', this.activeUsers); // Debug
  }

  @SubscribeMessage("chat_update")
  handleChatUpdate(@MessageBody() body: MessageDto) {
    // Umumiy chat uchun barcha foydalanuvchilarga yuboriladi
    this.server.emit("chat_update", body);
  }

  @SubscribeMessage("private_message")
  handlePrivateMessage(@MessageBody() body: { senderId: string; receiverId: string; message: string }) {
    const receiver = this.activeUsers.find(user => user.userId === body.receiverId);
  
    if (receiver) {
      this.server.to(receiver.socketId).emit("private_message", {
        senderId: body.senderId,
        receiverId: body.receiverId,
        message: body.message,
      },
      console.log("message", body.message ),

    );
    } else {
      console.log(`User ${body.receiverId} is offline. Active Users:`, this.activeUsers); // Active foydalanuvchilarni tekshirish
    }
  }
  
  
}
