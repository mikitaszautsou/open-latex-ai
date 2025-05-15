// import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//     cors: {
//         origin: "*"
//     },
// })
// export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer()
//     server: Server

//     handleConnection(client: Socket) {
//         console.log(`Client connected`)
//     }

//     handleDisconnect(client: Socket) {
//         console.log(`Client disconnected: ${client.id}`);
//     }

//     @SubscribeMessage('message')
//     handleMessage(client: Socket, payload: any): void {
//         console.log('Rreceived message', payload);
//         this.server.emit('messageResponse', payload);
//     }
// }