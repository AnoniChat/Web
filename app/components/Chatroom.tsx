'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: Date;
}

interface ChatRoomProps {
  roomId: string;
  category: {
    id: string;
    name: string;
    icon: string;
    displayName: string;
  };
  onExit: () => void;
  websocket: WebSocket | null; // ⭐ 외부에서 받은 WebSocket
}

interface WebSocketMessage {
  type: 'JOIN' | 'MESSAGE' | 'EXIT' | 'DISCONNECT' | 'ERROR' | 'HEARTBEAT' | 'MATCHING_SUCCESS';
  roomId?: string;
  content?: string;
  messageId?: string;
  senderId?: string;
  timestamp?: string;
  isMe?: boolean;
}

export default function ChatRoom({ roomId, category, onExit, websocket }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(websocket); // ⭐ 외부 WebSocket 사용
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ⭐ useCallback으로 감싸서 메모이제이션 (ESLint 경고 해결)
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const heartbeatMessage: WebSocketMessage = {
          type: 'HEARTBEAT',
          roomId: roomId
        };
        wsRef.current.send(JSON.stringify(heartbeatMessage));
        lastActivityRef.current = Date.now();
      }
    }, 25000);
  }, [roomId]); // roomId를 dependency에 추가

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // ⭐ WebSocket 초기화 (외부에서 받은 것 사용)
  useEffect(() => {
    if (!websocket) {
      console.error('WebSocket이 전달되지 않았습니다!');
      setConnectionStatus('disconnected');
      return;
    }

    wsRef.current = websocket;

    // 연결 상태 확인
    if (websocket.readyState === WebSocket.OPEN) {
      setConnectionStatus('connected');
      setIsConnected(true);
      
      // 채팅방 입장 메시지 전송
      const joinMessage: WebSocketMessage = {
        type: 'JOIN',
        roomId: roomId
      };
      websocket.send(JSON.stringify(joinMessage));

      startHeartbeat();
    } else if (websocket.readyState === WebSocket.CONNECTING) {
      setConnectionStatus('connecting');
      
      // 연결 완료 대기
      websocket.addEventListener('open', () => {
        setConnectionStatus('connected');
        setIsConnected(true);
        
        const joinMessage: WebSocketMessage = {
          type: 'JOIN',
          roomId: roomId
        };
        websocket.send(JSON.stringify(joinMessage));
        
        startHeartbeat();
      }, { once: true });
    }

    // 메시지 리스너 추가 (기존 리스너에 추가)
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        lastActivityRef.current = Date.now();
        
        switch (data.type) {
          case 'MESSAGE':
            const newMessage: Message = {
              id: data.messageId || `msg_${Date.now()}`,
              sender: data.isMe ? 'me' : 'other',
              text: data.content || '',
              timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
            };
            if (newMessage.sender === "other") {
              setMessages(prev => [...prev, newMessage]);
            }
            break;

          case 'DISCONNECT':
            setIsConnected(false);
            break;

          case 'HEARTBEAT':
            // Heartbeat 응답
            break;

          case 'MATCHING_SUCCESS':
            // 매칭 알림은 page.tsx에서 이미 처리됨 (무시)
            break;

          case 'ERROR':
            console.error('WebSocket 에러:', data.content);
            break;

          default:
            console.log('알 수 없는 메시지 타입:', data);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    websocket.addEventListener('message', handleMessage);

    const handleError = (error: Event) => {
      console.error('WebSocket 에러:', error);
      setConnectionStatus('disconnected');
    };

    const handleClose = (event: CloseEvent) => {
      setConnectionStatus('disconnected');
      stopHeartbeat();
    };

    websocket.addEventListener('error', handleError);
    websocket.addEventListener('close', handleClose);

    // Visibility API - 백그라운드 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          startHeartbeat();
        }
      } else {
        stopHeartbeat();
      }
    };

    const handleFocus = () => {
    };

    const handleBlur = () => {
      stopHeartbeat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // 컴포넌트 언마운트 시 정리
    return () => {
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);

      stopHeartbeat();
      
      websocket.removeEventListener('message', handleMessage);
      websocket.removeEventListener('error', handleError);
      websocket.removeEventListener('close', handleClose);

      // ⚠️ WebSocket은 종료하지 않음! (page.tsx에서 관리)
      // 퇴장 메시지만 전송
      if (websocket.readyState === WebSocket.OPEN) {
        const exitMessage: WebSocketMessage = {
          type: 'EXIT',
          roomId: roomId
        };
        websocket.send(JSON.stringify(exitMessage));
      }
    };
  }, [websocket, roomId, startHeartbeat, stopHeartbeat]); // ⭐ dependency 추가

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageData: WebSocketMessage = {
      type: 'MESSAGE',
      roomId: roomId,
      content: inputMessage
    };

    try {
      wsRef.current.send(JSON.stringify(messageData));
      lastActivityRef.current = Date.now();
      
      const newMessage: Message = {
        id: `temp_${Date.now()}`,
        sender: 'me',
        text: inputMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExitChat = () => {
    // WebSocket은 종료하지 않음 (page.tsx에서 관리)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const exitMessage: WebSocketMessage = {
        type: 'EXIT',
        roomId: roomId
      };
      wsRef.current.send(JSON.stringify(exitMessage));
    }

    stopHeartbeat();
    onExit(); // page.tsx로 돌아감 (거기서 WebSocket 정리)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl h-[95vh] sm:h-[92vh] md:h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* 채팅방 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 md:p-6 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <span className="text-2xl sm:text-3xl flex-shrink-0">{category.icon}</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">{category.displayName}</h2>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400' : 
                  'bg-red-400'
                } ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
                <p className="text-xs sm:text-sm opacity-90 truncate">
                  {connectionStatus === 'connected' 
                    ? (isConnected ? '상대방과 연결됨' : '상대방이 나갔습니다')
                    : connectionStatus === 'connecting' 
                    ? '연결 중...' 
                    : '연결 끊김'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleExitChat}
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base flex-shrink-0"
          >
            나가기
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p className="text-sm sm:text-base">대화를 시작해보세요!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <p className="break-words text-sm sm:text-base">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'me' ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 연결 끊김 알림 */}
        {!isConnected && connectionStatus === 'connected' && (
          <div className="bg-yellow-100 text-yellow-800 px-4 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm flex-shrink-0">
            상대방이 채팅방을 나갔습니다. 새로운 대화를 시작하시겠습니까?
          </div>
        )}

        {/* WebSocket 연결 끊김 알림 */}
        {connectionStatus === 'disconnected' && (
          <div className="bg-red-100 text-red-800 px-4 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm flex-shrink-0">
            서버와의 연결이 끊어졌습니다.
          </div>
        )}

        {/* 메시지 입력 영역 */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={connectionStatus !== 'connected' || !isConnected}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || connectionStatus !== 'connected' || !isConnected}
              className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex-shrink-0"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}