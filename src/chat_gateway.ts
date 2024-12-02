import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { MessageDto } from "./dto/messageDto";


@WebSocketGateway()
export class ChatGateway{
@WebSocketServer()
server;

@SubscribeMessage("chat_update")//-> Channel name
handleChatUpdate(@MessageBody() body:MessageDto){
    this.server.emit("chat_update",body);
}
}