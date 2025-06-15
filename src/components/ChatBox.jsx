import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleMore, SendHorizontal, Check, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getWsClient } from '../functions/WsClient';
import { RestClient } from '../functions/RestClient';
import { UAParser } from 'ua-parser-js';
import { ClipLoader, HashLoader } from 'react-spinners';

const LINE_CHAR_LIMIT = 32;

export default function ChatBox() {
  const wsClient = useRef(null);
  const restClient = useRef(new RestClient());
  const [messages, setMessages] = useState([]);
  const [wsInitialized, setWsInitialized] = useState(false);
  const [userData, setUserData] = useState({});
  const [formData, setFormData] = useState({});
  const [text, setText] = useState('');
  const [editedMsgId, setEditedMsgId] = useState('');
  const [editting, setEditting] = useState(false);
  const [sending, setSending] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Set user info on mount
  useEffect(() => {
    setUserInfo();
    // eslint-disable-next-line
  }, []);

  // Update wsClient when userData changes
  useEffect(() => {
    wsClient.current = getWsClient(
      setWsInitialized,
      wsClient.current,
      userData,
      messages,
      setMessages,
      restClient.current
    );
    // eslint-disable-next-line
  }, [userData]);

  // Fetch messages when ws is initialized
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userFormDataSubmitted = localStorage.getItem('userFormDataSubmitted');
    if (wsInitialized && wsClient.current && userId) {
      setMsgsLoading(true);
      restClient.current.get('get-messages', { clientId: userId })
        .then((res) => {
          if (res.status === 200) {
            const messagesData = res.data.messages || [];
            setMessages(() => {
              const newMessages = messagesData.map(msg => ({
                ...msg,
                type: (msg.senderId === userId) ? 'sent' : 'received'
              }));
              const receivedMsgsCount = newMessages.filter(msg => msg.type === 'received').length;
              const sentMsgsCount = newMessages.filter(msg => msg.type === 'sent').length;
              if (receivedMsgsCount === 0 && sentMsgsCount !== 0) {
                newMessages.push({
                  messageId: uuidv4(),
                  type: 'bot',
                  message: "We'll reply as soon as possible.",
                  createdAt: Math.floor(Date.now() / 1000).toString()
                });
                if (!userFormDataSubmitted) {
                  newMessages.push({
                    messageId: uuidv4(),
                    type: 'card',
                    createdAt: Math.floor(Date.now() / 1000).toString()
                  });
                }
              }
              return newMessages;
            });
          }
        })
        .catch(console.error)
        .finally(() => setMsgsLoading(false));
    }
    // eslint-disable-next-line
  }, [wsInitialized]);

  // Scroll to bottom and send "received" notifications
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (wsInitialized && wsClient.current) {
      messages.forEach(msg => {
        if (msg.type === 'received' && msg.received === false) {
          const notificationData = {
            userId: userData.userId,
            status: 'MESSAGE_RECEIVED',
            messageId: msg.messageId
          };
          restClient.current.post('notify', notificationData).catch(console.error);
        }
      });
    }
    // eslint-disable-next-line
  }, [messages, wsInitialized, sending]);

  // Send message when "sending" is true
  useEffect(() => {
    if (sending) {
      sendMessage(text);
      setSending(false);
      setText('');
    }
    // eslint-disable-next-line
  }, [sending]);

  // Set user info (location, device, etc)
  const setUserInfo = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch("https://ipinfo.io/json");
      const data = await res.json();
      const userLocation = `${data.city}, ${data.region}, ${data.country}`;
      const parser = new UAParser();
      const result = parser.getResult();
      const userInfo = [];
      if (result.device) {
        if (result.device.vendor) userInfo.push(result.device.vendor);
        if (result.device.model) userInfo.push(result.device.model);
      }
      const userDevice = userInfo.length > 0 ? userInfo.join(' ') : 'Desktop';
      setUserData(prev => ({
        ...prev,
        ...formData,
        userId,
        userLocation,
        userDevice,
      }));
    } catch (error) {
      console.error("Failed to fetch user location:", error);
    }
  }, [formData]);

  // Send or edit message
  const sendMessage = useCallback(async (msgText) => {
    const userId = localStorage.getItem('userId');
    const userFormDataSubmitted = localStorage.getItem('userFormDataSubmitted');
    if (!wsInitialized || !wsClient.current || !userId) return;
    if (!editting) {
      const messageData = {
        userId,
        messageId: uuidv4(),
        message: msgText
      };
      restClient.current.post('send-message', messageData)
        .then((res) => {
          if (res.status === 200) {
            setMessages(prev => {
              const updatedMessages = [
                ...prev.filter(msg => msg.type !== 'bot' && msg.type !== 'card'),
                {
                  ...messageData,
                  type: 'sent',
                  createdAt: Math.floor(Date.now() / 1000).toString()
                }
              ];
              const receivedMsgsCount = updatedMessages.filter(msg => msg.type === 'received').length;
              if (receivedMsgsCount === 0) {
                updatedMessages.push({
                  messageId: uuidv4(),
                  type: 'bot',
                  message: "We'll reply as soon as possible.",
                  createdAt: Math.floor(Date.now() / 1000).toString()
                });
                if (!userFormDataSubmitted) {
                  updatedMessages.push({
                    messageId: uuidv4(),
                    type: 'card',
                    createdAt: Math.floor(Date.now() / 1000).toString()
                  });
                }
              }
              return updatedMessages;
            });
          }
        })
        .catch(console.error);
    } else {
      const messageData = {
        userId,
        messageId: editedMsgId,
        status: 'MESSAGE_EDITED',
        newMessage: msgText
      };
      restClient.current.post('notify', messageData)
        .then((res) => {
          if (res.status === 200) {
            setMessages(prev =>
              prev.map(msg =>
                msg.messageId === editedMsgId ? { ...msg, message: msgText } : msg
              )
            );
          }
        })
        .catch(console.error);
      setEditedMsgId('');
      setEditting(false);
    }
    // eslint-disable-next-line
  }, [wsInitialized, editting, editedMsgId]);

  // Delete message
  const handleMessageDelete = useCallback((messageId) => {
    if (!wsInitialized || !wsClient.current) return;
    const messageData = {
      userId: userData.userId,
      messageId,
      status: 'MESSAGE_DELETED'
    };
    restClient.current.post('notify', messageData)
      .then((res) => {
        if (res.status === 200) {
          setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line
  }, [wsInitialized, userData.userId]);

  // Handle user info form submit
  const handleUserDataSubmit = (e) => {
    e.preventDefault();
    if (formData.userEmail && formData.userName) {
      setUserInfo();
      localStorage.setItem('userFormDataSubmitted', 'true');
      setMessages(prev => {
        const updatedMessages = prev.filter(msg => msg.type !== 'card' && msg.type !== 'bot');
        updatedMessages.push({
          messageId: uuidv4(),
          type: 'bot',
          message: 'Thank you for providing your details! We will reach out to you as soon as possible.',
          createdAt: Math.floor(Date.now() / 1000).toString()
        });
        return updatedMessages;
      });
      setFormData({});
    }
  };

  // Handle send message form submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    setSending(true);
  };

  return (
    <div className="chatbox bg-zinc-700">
      <Popover>
        <PopoverTrigger className="[&_svg]:size-10 m-3">
          <MessageCircleMore />
        </PopoverTrigger>
        <PopoverContent className="mr-5 mb-3 min-w-xs max-w-lg p-2 rounded-lg">
          <div className="grid gap-1">
            <div className="space-y-1">
              <div className="flex mt-1 mb-1 ml-2">
                <h3 className="font-sans font-bold text-xl">Auto Lab Solutions</h3>
              </div>
            </div>
            <ScrollArea className="h-96 sm:h-84 rounded-md border p-1.5 mb-1">
              {msgsLoading ? (
                <div className="flex justify-center h-80 items-center">
                  <HashLoader />
                </div>
              ) : (
                <div key="messages" className="grid gap-1">
                  {messages.map((msg, idx) => (
                    <MessageRow
                      key={msg.messageId || idx}
                      msg={msg}
                      setText={setText}
                      setEditedMsgId={setEditedMsgId}
                      setEditting={setEditting}
                      handleMessageDelete={handleMessageDelete}
                      formData={formData}
                      setFormData={setFormData}
                      handleUserDataSubmit={handleUserDataSubmit}
                    />
                  ))}
                  <div key="ref" ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div>
              <form onSubmit={handleSendMessage} className="d-flex">
                <div className="flex flex-row items-center">
                  <Input
                    type="text"
                    placeholder="Write a message"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="form-control"
                    required
                  />
                  <Button type="submit" className="btn btn-primary ms-2">
                    {sending ? <ClipLoader size={20} color="#ffffff" /> : editting ? <Check /> : <SendHorizontal />}
                  </Button>
                  {editting && (
                    <Button variant="outline" className="ms-2" onClick={() => {
                      setText('');
                      setEditedMsgId('');
                      setEditting(false);
                    }}>
                      <X />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper: Format message into lines
function getMultilineTexts(text) {
  if (!text) return [];
  if (text.length <= LINE_CHAR_LIMIT) return [text];
  const words = text.split(' ');
  let lines = [], currentLine = '';
  for (let word of words) {
    if ((currentLine + word).length > LINE_CHAR_LIMIT) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

// Helper: Format timestamp
function formatTime(timestamp) {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Message row renderer
function MessageRow({
  msg,
  setText,
  setEditedMsgId,
  setEditting,
  handleMessageDelete,
  formData,
  setFormData,
  handleUserDataSubmit
}) {
  if (msg.type === 'typing') {
    return (
      <div className="grid grid-cols-5 items-center gap-4">
        <span className="col-span-4 h-8">Loading...</span>
      </div>
    );
  }
  if (msg.type === 'sent') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="col-span-1" />
            <div className="col-span-4 flex justify-end">
              <Badge variant="secondary" className="bg-gray-500 text-white">
                <FormattedMessage textsList={getMultilineTexts(msg.message)} timestamp={msg.createdAt} />
              </Badge>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <Button variant="ghost" onClick={() => {
              setText(msg.message);
              setEditedMsgId(msg.messageId);
              setEditting(true);
            }}>
              ✏️ Edit
            </Button>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Button variant="ghost" onClick={() => handleMessageDelete(msg.messageId)}>
              🗑️ Delete
            </Button>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
  if (msg.type === 'received' || msg.type === 'bot') {
    return (
      <div className="grid grid-cols-5 items-center gap-4">
        <div className="col-span-4 flex justify-start">
          <Badge variant="default" className="bg-blue-500 text-white">
            <FormattedMessage textsList={getMultilineTexts(msg.message)} timestamp={msg.createdAt} />
          </Badge>
        </div>
        <div className="col-span-1" />
      </div>
    );
  }
  if (msg.type === 'card') {
    return (
      <div className="grid grid-cols-6 items-center gap-1">
        <div className="col-span-5 flex justify-start">
          <Card className="w-full max-w-sm py-4 gap-4">
            <CardHeader className="px-4 pb-0">
              <CardDescription>
                Please fill out the form below to help us reach you, when you are offline.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <form onSubmit={handleUserDataSubmit}>
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={formData.userEmail || ''}
                      onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Name</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="John Doe"
                      value={formData.userName || ''}
                      onChange={e => setFormData({ ...formData, userName: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return null;
}

// Message formatter
function FormattedMessage({ textsList, timestamp }) {
  return (
    <div>
      <pre className="text-sm font-sans m-0.5">
        {textsList.join('\n')}
      </pre>
      <div className="flex justify-end">
        <pre className="text-xs text-gray-200 font-sans font-normal">
          {formatTime(timestamp)}
        </pre>
      </div>
    </div>
  );
}
