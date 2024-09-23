export type Message = {
  id: string;
  text: React.ReactNode;
  messageType: MessageType;
};

export enum MessageType {
  Received = "Received",
  Sent = "Sent",
}
