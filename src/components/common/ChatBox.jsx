import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { MessageCircleMore, SendHorizontal, Check, X, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useRestClient } from '../contexts/RestContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useGlobalData } from '../contexts/GlobalDataContext';
import { UAParser } from 'ua-parser-js';
import { ClipLoader, HashLoader, SyncLoader } from 'react-spinners';
import { companyName } from '../../meta/companyData';
import { getPerthCurrentDateTime, formatPerthDateTime } from '../../utils/timezoneUtils';
import MessageNotification from './MessageNotification';
import {
  generateMessageId,
  MESSAGE_STATUS,
  formatMessage,
  createSendMessagePayload,
  createNotificationPayload,
  validateMessage,
  handleApiError,
  debounce,
  formatTimestamp,
  formatMessageText,
  showTypingIndicatorForMessage,
  splitMessageText,
  sortMessagesByTimestamp,
  syncMessagesOnReconnection,
  validateAndUpdateMessageStatuses
} from '../../utils/messagingUtils';

const LINE_CHAR_LIMIT = 32;

export default function ChatBox() {
  const { restClient } = useRestClient();
  const { 
    reconnectWebSocket, 
    connectionStatus, 
    isConnected, 
    setChatboxOpen: updateWebSocketChatboxStatus, 
    performMessageSync,
    wasOffline
  } = useWebSocket();
  const { 
    userId, 
    userData, 
    messages, 
    staffUserTyping,
    updateUserId,
    updateUserData, 
    updateMessages 
  } = useGlobalData();
  
  const [formData, setFormData] = useState({});
  const [text, setText] = useState('');
  const [editedMsgId, setEditedMsgId] = useState('');
  const [editting, setEditting] = useState(false);
  const [sending, setSending] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [userManuallyScrolled, setUserManuallyScrolled] = useState(false);
  const [chatboxOpen, setChatboxOpen] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // Track sync status
  const [pendingViewedNotifications, setPendingViewedNotifications] = useState(false); // Track if viewed notifications need to be sent
  const [queuedViewedNotifications, setQueuedViewedNotifications] = useState([]); // Queue notifications when WebSocket not ready
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const userScrollIntentionRef = useRef('auto'); // 'auto', 'manual-top', 'manual-bottom'
  const viewedNotificationsSentRef = useRef(new Set()); // Track which messages we've already sent viewed notifications for
  const connectionStatusRef = useRef(connectionStatus); // Track connection status changes

  // Calculate unread message count for badge
  const unreadCount = useMemo(() => {
    return messages.filter(msg => 
      msg.type === 'received' && 
      msg.senderId !== userId && 
      !msg.viewed
    ).length;
  }, [messages, userId]);

  // Watch for connection status changes and trigger sync if needed
  useEffect(() => {
    const prevStatus = connectionStatusRef.current;
    connectionStatusRef.current = connectionStatus;
    
    // If we just connected after being disconnected, and we have WebSocket sync available
    if (prevStatus === 'disconnected' && connectionStatus === 'connected' && userId && restClient) {
      console.log('🔄 Connection restored, forcing message sync...', {
        prevStatus,
        currentStatus: connectionStatus,
        hasPerformMessageSync: !!performMessageSync,
        hasUserId: !!userId,
        hasRestClient: !!restClient,
        wasOffline
      });
      
      // Force sync regardless of wasOffline flag since connection was lost
      setTimeout(async () => {
        console.log('📡 Executing forced message sync after connection restoration...');
        setIsSyncing(true);
        try {
          // Use our sync function directly
          const syncResult = await syncMessagesOnReconnection(
            restClient,
            userId,
            messages,
            updateMessages
          );
          
          if (syncResult.success) {
            console.log('✅ Forced message sync completed successfully:', syncResult);
          } else {
            console.error('❌ Forced message sync failed:', syncResult.error);
          }
        } catch (error) {
          console.error('❌ Error during forced message sync:', error);
        } finally {
          setIsSyncing(false);
        }
      }, 3000); // Wait 3 seconds for connection to stabilize
    }
  }, [connectionStatus, userId, restClient, messages, updateMessages]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      setShowScrollToBottom(false);
      setUserManuallyScrolled(false); // Reset manual scroll flag when user manually scrolls to bottom
      userScrollIntentionRef.current = 'auto'; // Resume auto-scroll behavior
    }
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
      setShowScrollToTop(false);
      setUserManuallyScrolled(true); // Mark as manually scrolled to prevent auto-scroll
      userScrollIntentionRef.current = 'manual-top'; // User wants to stay at top
      
      // Set a timestamp to prevent intention from being reset too quickly
      userScrollIntentionRef.manualTopTimestamp = Date.now();
    }
  }, []);

  // Check if user is near bottom of scroll area
  const handleScroll = useCallback((event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    const isNearTop = scrollTop < 50;
    const hasScrollableContent = scrollHeight > clientHeight;
    
    // Show scroll to bottom button if not at bottom and has scrollable content
    setShowScrollToBottom(!isNearBottom && hasScrollableContent && messages.length > 2);
    
    // Show scroll to top button if not at top and has scrollable content
    setShowScrollToTop(!isNearTop && hasScrollableContent && messages.length > 2);
    
    // Reset manual scroll flag if user scrolls back to bottom
    if (isNearBottom) {
      // Don't reset intention to auto immediately after user clicked scroll-to-top
      const timeSinceManualTop = userScrollIntentionRef.manualTopTimestamp ? Date.now() - userScrollIntentionRef.manualTopTimestamp : Infinity;
      
      if (userScrollIntentionRef.current === 'manual-top' && timeSinceManualTop < 2000) {
        // Prevent auto-scroll reset - user just clicked scroll-to-top
      } else {
        setUserManuallyScrolled(false);
        userScrollIntentionRef.current = 'auto'; // Resume auto-scroll when user scrolls to bottom
        userScrollIntentionRef.manualTopTimestamp = null; // Clear timestamp
      }
    }
    
    // Send viewed notifications when user reaches bottom (safely without breaking anything)
    if (isNearBottom && chatboxOpen && typeof sendViewedNotifications === 'function') {
      setTimeout(() => {
        sendViewedNotifications();
      }, 1000);
    }
  }, [messages.length]);

  // Handle manual scroll events (wheel, touch) to detect user intention
  const handleManualScroll = useCallback((event) => {
    // If user is manually scrolling and not near bottom, consider it manual intention
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      if (!isNearBottom && userScrollIntentionRef.current === 'auto') {
        userScrollIntentionRef.current = 'manual-top';
        setUserManuallyScrolled(true);
      }
    }
  }, []);

  // Enhanced scroll to bottom function with delay and retries
  const ensureScrollToBottom = useCallback(() => {
    // Only scroll if user intention allows auto-scrolling
    if (userScrollIntentionRef.current !== 'auto') {
      return;
    }

    if (!scrollAreaRef.current) {
      return;
    }

    const scrollToBottomWithRetry = (attemptNumber = 1, maxAttempts = 5) => {
      if (attemptNumber > maxAttempts) {
        return;
      }

      setTimeout(() => {
        if (scrollAreaRef.current) {
          const { scrollHeight, clientHeight, scrollTop } = scrollAreaRef.current;
          const currentBottom = scrollTop + clientHeight;
          const isAlreadyAtBottom = Math.abs(scrollHeight - currentBottom) < 10;

          if (!isAlreadyAtBottom) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            setShowScrollToBottom(false);
            // Only show scroll to top when there are enough messages for scrolling
            const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
            setShowScrollToTop(hasScrollableContent && messages.length > 2);
            
            // Verify scroll worked, retry if not
            setTimeout(() => {
              if (scrollAreaRef.current) {
                const newScrollTop = scrollAreaRef.current.scrollTop;
                const newCurrentBottom = newScrollTop + clientHeight;
                const newIsAtBottom = Math.abs(scrollHeight - newCurrentBottom) < 10;
                
                if (!newIsAtBottom && attemptNumber < maxAttempts) {
                  scrollToBottomWithRetry(attemptNumber + 1, maxAttempts);
                }
              }
            }, 50);
          } else {
            setShowScrollToBottom(false);
            // Only show scroll to top when there are enough messages for scrolling
            const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
            setShowScrollToTop(hasScrollableContent && messages.length > 2);
          }
        }
      }, attemptNumber === 1 ? 100 : 50);
    };

    scrollToBottomWithRetry();
  }, []);

  // Debounced typing status sender
  const debouncedSendTyping = useCallback(
    debounce(() => {
      if (!userId || !restClient) {
        console.debug('Skipping typing notification - missing userId or restClient');
        return;
      }
      
      const typingData = createNotificationPayload(userId, MESSAGE_STATUS.TYPING);
      restClient.post('messages/notify', typingData).catch(error => {
        console.error('Failed to send typing status:', handleApiError(error, 'typing status'));
      });
    }, 500),
    [userId, restClient]
  );

  // Send MESSAGE_VIEWED notifications when chatbox is opened
  const sendViewedNotifications = useCallback(async () => {
    console.log('🔍 sendViewedNotifications called:', {
      userId,
      restClient: !!restClient,
      messagesLength: messages.length,
      chatboxOpen,
      pendingViewedNotifications,
      callStack: new Error().stack?.split('\n').slice(1, 4).map(line => line.trim())
    });

    if (!userId || !restClient || messages.length === 0) {
      console.log('❌ Early return - missing requirements:', {
        hasUserId: !!userId,
        hasRestClient: !!restClient,
        hasMessages: messages.length > 0
      });
      
      // If chatbox is open but we can't send notifications yet, mark as pending
      if (chatboxOpen && messages.length > 0) {
        console.log('📝 Marking viewed notifications as pending due to missing dependencies');
        setPendingViewedNotifications(true);
      }
      
      return;
    }

    // Find messages that need viewed notifications (received messages that haven't been marked as viewed)
    // Consider ALL unviewed messages (no time restriction)
    
    const unviewedMessages = messages.filter(msg => {
      const shouldInclude = msg.type === 'received' && 
             msg.senderId !== userId && // Don't send notifications for our own messages
             !msg.viewed && // Not yet marked as viewed
             msg.messageId && // Has a valid message ID
             !viewedNotificationsSentRef.current.has(msg.messageId); // Haven't already sent notification for this message
      
      console.log(`📝 Message ${msg.messageId} evaluation:`, {
        type: msg.type,
        senderId: msg.senderId,
        userId,
        viewed: msg.viewed,
        received: msg.received,
        content: msg.content?.substring(0, 50),
        alreadySent: viewedNotificationsSentRef.current.has(msg.messageId),
        shouldInclude
      });
      
      return shouldInclude;
    });

    console.log('📋 Messages analysis:', {
      totalMessages: messages.length,
      receivedMessages: messages.filter(m => m.type === 'received').length,
      unviewedMessages: unviewedMessages.length,
      unviewedMessageIds: unviewedMessages.map(m => m.messageId),
      allMessages: messages.map(m => ({
        id: m.messageId,
        type: m.type,
        viewed: m.viewed,
        received: m.received,
        senderId: m.senderId,
        content: m.content?.substring(0, 30) + '...'
      })),
      messageTypes: [...new Set(messages.map(m => m.type))],
      senderIds: [...new Set(messages.map(m => m.senderId))]
    });

    if (unviewedMessages.length === 0) {
      console.log('ℹ️ No unviewed messages to mark as viewed');
      return;
    }

    // Send viewed notifications for each unviewed message
    const successfullyMarkedIds = [];
    
    // First, update local state immediately to mark as viewed
    if (unviewedMessages.length > 0) {
      console.log('🔄 Updating local state to mark messages as viewed immediately');
      const updatedMessages = messages.map(msg => {
        if (unviewedMessages.some(unviewed => unviewed.messageId === msg.messageId)) {
          console.log(`👁️ Locally marking message ${msg.messageId} as viewed`);
          return { ...msg, viewed: true };
        }
        return msg;
      });
      updateMessages(updatedMessages);
    }
    
    for (const msg of unviewedMessages) {
      // Create notification data outside try block so it's available in catch block
      const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_VIEWED, msg.messageId);
      
      try {
        console.log('📤 Sending MESSAGE_VIEWED for:', msg.messageId);
        console.log('📤 Notification payload:', notificationData);
        
        await restClient.post('messages/notify', notificationData);
        
        // Track successfully sent notifications to prevent duplicates
        successfullyMarkedIds.push(msg.messageId);
        viewedNotificationsSentRef.current.add(msg.messageId);
        console.log('✅ Viewed notification sent for message:', msg.messageId);
      } catch (error) {
        const errorDetails = error.response?.data || error.message;
        const statusCode = error.response?.status;
        
        console.error('❌ Failed to send viewed notification:', {
          messageId: msg.messageId,
          statusCode,
          errorDetails,
          fullError: error
        });
        
        // If WebSocket connection not available (400 error), queue for later
        if (statusCode === 400 && errorDetails.message?.includes('No connection found')) {
          console.log('📝 Queueing viewed notification for when WebSocket is ready:', msg.messageId);
          setQueuedViewedNotifications(prev => {
            // Avoid duplicates
            if (!prev.some(queued => queued.messageId === msg.messageId)) {
              return [...prev, { messageId: msg.messageId, notificationData }];
            }
            return prev;
          });
          // Still mark as viewed locally for UI purposes
          successfullyMarkedIds.push(msg.messageId);
          viewedNotificationsSentRef.current.add(msg.messageId);
        } else {
          console.warn('Failed to send viewed notification for message:', msg.messageId, errorDetails);
        }
      }
    }

    // Update local state for successfully marked messages to immediately reflect viewed status
    if (successfullyMarkedIds.length > 0) {
      console.log('🔄 Updating local state for viewed messages:', successfullyMarkedIds);
      const updatedMessages = messages.map(msg => 
        successfullyMarkedIds.includes(msg.messageId) 
          ? { ...msg, viewed: true } 
          : msg
      );
      updateMessages(updatedMessages);
      console.log('✅ Local state updated for', successfullyMarkedIds.length, 'viewed messages');
    }

    console.log('✅ Viewed notifications sent for', unviewedMessages.length, 'messages');
    
    // Clear pending flag since notifications were successfully sent
    if (pendingViewedNotifications) {
      setPendingViewedNotifications(false);
      console.log('✅ Cleared pending viewed notifications flag');
    }
  }, [userId, restClient, messages, updateMessages, pendingViewedNotifications, setQueuedViewedNotifications]);

  // Debug function to force send viewed notifications - accessible from console
  window.debugForceViewedNotifications = () => {
    console.log('🔧 DEBUG: Force sending viewed notifications');
    console.log('Current state:', {
      userId,
      restClient: !!restClient,
      messagesLength: messages.length,
      chatboxOpen,
      messages: messages.map(m => ({
        id: m.messageId,
        type: m.type,
        viewed: m.viewed,
        senderId: m.senderId
      }))
    });
    sendViewedNotifications();
  };

  // Retry sending viewed notifications when dependencies become available
  useEffect(() => {
    console.log('🔍 Retry useEffect triggered:', {
      pendingViewedNotifications,
      hasUserId: !!userId,
      hasRestClient: !!restClient,
      messagesLength: messages.length,
      chatboxOpen,
      willRetry: pendingViewedNotifications && userId && restClient && messages.length > 0 && chatboxOpen
    });
    
    if (pendingViewedNotifications && userId && restClient && messages.length > 0 && chatboxOpen) {
      console.log('🔄 Retrying pending viewed notifications now that dependencies are available');
      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        console.log('🔔 Triggering sendViewedNotifications from retry mechanism');
        sendViewedNotifications();
      }, 100);
    }
  }, [pendingViewedNotifications, userId, restClient, messages.length, chatboxOpen, sendViewedNotifications]);

  // Process queued viewed notifications when WebSocket becomes ready
  useEffect(() => {
    if (queuedViewedNotifications.length > 0 && isConnected && userId && restClient) {
      console.log('🔄 Processing queued viewed notifications now that WebSocket is connected:', {
        queuedCount: queuedViewedNotifications.length,
        queuedIds: queuedViewedNotifications.map(q => q.messageId)
      });
      
      // Process each queued notification
      const processQueue = async () => {
        const processed = [];
        
        for (const queued of queuedViewedNotifications) {
          try {
            console.log('📤 Sending queued MESSAGE_VIEWED for:', queued.messageId);
            await restClient.post('messages/notify', queued.notificationData);
            console.log('✅ Queued viewed notification sent for message:', queued.messageId);
            processed.push(queued.messageId);
          } catch (error) {
            console.error('❌ Failed to send queued viewed notification:', {
              messageId: queued.messageId,
              error: error.response?.data || error.message
            });
          }
        }
        
        // Remove successfully processed notifications from queue
        if (processed.length > 0) {
          setQueuedViewedNotifications(prev => 
            prev.filter(queued => !processed.includes(queued.messageId))
          );
          console.log('✅ Processed and removed queued notifications:', processed);
        }
      };
      
      // Small delay to ensure WebSocket is fully ready
      setTimeout(processQueue, 1000);
    }
  }, [queuedViewedNotifications, isConnected, userId, restClient]);

  // Handle chatbox open/close
    const handleChatboxOpenChange = useCallback((open) => {
    console.log('🎯 Chatbox open state changed:', {
      newState: open,
      previousState: chatboxOpen,
      willTriggerViewedNotifications: open && !chatboxOpen,
      currentMessages: messages.length,
      hasUserId: !!userId,
      hasRestClient: !!restClient
    });
    setChatboxOpen(open);
    
    // Notify WebSocket context about chatbox status
    if (updateWebSocketChatboxStatus) {
      updateWebSocketChatboxStatus(open);
    }

    // Send viewed notifications when chatbox is opened (only for true open events)
    if (open && !chatboxOpen) {
      // Reset manual scroll flag when chatbox is opened to allow auto-scroll
      setUserManuallyScrolled(false);
      userScrollIntentionRef.current = 'auto'; // Reset to auto-scroll when opening chatbox
      
      // Delay slightly to ensure messages are loaded and DOM is ready
      setTimeout(() => {
        console.log('🔔 Triggering sendViewedNotifications after chatbox open delay');
        sendViewedNotifications();
        // Ensure scroll to bottom when opened from notification only if user intention allows
        if (userScrollIntentionRef.current === 'auto') {
          ensureScrollToBottom();
        }
      }, 100);
      
      // Validate message statuses when chatbox opens
      if (messages.length > 0) {
        setTimeout(async () => {
          console.log('📱 Chatbox opened, validating message statuses...');
          try {
            await validateAndUpdateMessageStatuses(
              restClient,
              userId,
              messages,
              updateMessages,
              true
            );
          } catch (error) {
            console.error('❌ Failed to validate message statuses on chatbox open:', error);
          }
        }, 500);
      }
    } else if (open) {
      // Just send viewed notifications without resetting scroll intention
      setTimeout(() => {
        sendViewedNotifications();
      }, 100);
    } else {
      // When chatbox is closed, clear the tracking of sent notifications for next session
      viewedNotificationsSentRef.current.clear();
      
      // Clear pending viewed notifications flag when chatbox is closed
      if (pendingViewedNotifications) {
        setPendingViewedNotifications(false);
        console.log('🔄 Cleared pending viewed notifications flag on chatbox close');
      }
      
      // Clear queued viewed notifications when chatbox is closed
      if (queuedViewedNotifications.length > 0) {
        setQueuedViewedNotifications([]);
        console.log('🔄 Cleared queued viewed notifications on chatbox close');
      }
    }
  }, [updateWebSocketChatboxStatus, sendViewedNotifications, ensureScrollToBottom, chatboxOpen, messages, restClient, userId, updateMessages, pendingViewedNotifications, queuedViewedNotifications]);

  // Send MESSAGE_RECEIVED notifications for messages that need them
  const sendReceivedNotifications = useCallback(async (messages, isFromSync = false) => {
    if (!userId || !restClient || messages.length === 0) {
      console.log('❌ sendReceivedNotifications - missing requirements:', {
        hasUserId: !!userId,
        hasRestClient: !!restClient,
        hasMessages: messages.length > 0
      });
      return messages; // Return original messages if can't process
    }

    // Find messages that need received notifications
    // For sync operations, process all unreceived messages
    // For regular operations, only consider messages from the last 30 seconds to avoid spam
    let timeFilter = () => true; // Default: no time filter for sync operations
    
    if (!isFromSync) {
      const thirtySecondsAgo = Math.floor(Date.now() / 1000) - 30;
      timeFilter = (messageTimestamp) => messageTimestamp > thirtySecondsAgo;
    }
    
    const unreceivedMessages = messages.filter(msg => {
      const messageTimestamp = parseInt(msg.createdAt) || msg.timestamp || 0;
      return msg.type === 'received' && 
             msg.senderId !== userId && // Don't send notifications for our own messages
             !msg.received && // Not yet marked as received
             msg.messageId && // Has a valid message ID
             !msg.notificationSent && // Haven't already sent notification to avoid duplicates
             timeFilter(messageTimestamp); // Apply time filter based on operation type
    });

    console.log('📨 Received notifications check:', {
      totalMessages: messages.length,
      receivedMessages: messages.filter(m => m.type === 'received').length,
      unreceivedMessages: unreceivedMessages.length,
      unreceivedMessageIds: unreceivedMessages.map(m => m.messageId),
      messagesWithoutNotificationSent: messages.filter(m => m.type === 'received' && !m.notificationSent).length,
      isFromSync,
      timeFilterApplied: !isFromSync ? 'last 30 seconds only' : 'all messages'
    });

    if (unreceivedMessages.length === 0) {
      console.log('ℹ️ No unreceived messages to notify about');
      return messages;
    }

    // Send received notifications for each unreceived message
    for (const msg of unreceivedMessages) {
      try {
        console.log('📤 Sending MESSAGE_RECEIVED for:', msg.messageId);
        const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_RECEIVED, msg.messageId);
        await restClient.post('messages/notify', notificationData);
        
        // Don't modify messages here - just send notifications to backend
        console.log('✅ Received notification sent for message:', msg.messageId);
      } catch (error) {
        const errorDetails = error.response?.data || error.message;
        const statusCode = error.response?.status;
        
        console.error('❌ Failed to send received notification:', {
          messageId: msg.messageId,
          statusCode,
          errorDetails
        });
        
        // Only log as warning for non-critical errors
        if (statusCode === 400 && errorDetails.message?.includes('No connection found')) {
          console.debug('WebSocket connection not available for received notification:', msg.messageId);
        } else {
          console.warn('Failed to send received notification for message:', msg.messageId, errorDetails);
        }
      }
    }

    // Just return original messages without modification
    return messages;
  }, [userId, restClient]);

  // Note: userId is provided by the WebSocket connection initialization from backend
  // No need to generate userId in frontend - it comes from the WebSocket 'init' event

  // Set user info on mount
  useEffect(() => {
    setUserInfo();
    // Initialize scroll intention to auto
    userScrollIntentionRef.current = 'auto';
  }, []);

  // Handle stored messages from localStorage on component mount
  useEffect(() => {
    // Only run this once when the component mounts and we have the required dependencies
    const hasInitialData = userId && messages.length > 0 && restClient;
    const hasNotProcessedStoredMessages = !localStorage.getItem('storedMessagesProcessed');
    
    if (hasInitialData && hasNotProcessedStoredMessages) {
      console.log('🔄 Processing stored messages from localStorage for notifications:', {
        userId,
        messageCount: messages.length
      });
      
      // Process messages loaded from localStorage and send notifications if needed
      const processStoredMessages = async () => {
        try {
          // Send received notifications for any messages that need them
          await sendReceivedNotifications(messages, true); // Mark as sync-like operation
          
          // Don't update messages here to avoid conflicts with real-time updates
          console.log('✅ Stored messages processed for notifications (without state update)');
          
          // Mark as processed to prevent re-processing
          localStorage.setItem('storedMessagesProcessed', 'true');
        } catch (error) {
          console.error('❌ Failed to process stored messages:', error);
        }
      };
      
      processStoredMessages();
    }
    
    // Clear the processed flag when userId changes (new user)
    return () => {
      if (!userId) {
        localStorage.removeItem('storedMessagesProcessed');
      }
    };
  }, [userId]); // Minimal dependencies to prevent loops

  // Fetch messages when userId is available - but only once per userId to prevent conflicts with WebSocket
  const [hasFetchedInitialMessages, setHasFetchedInitialMessages] = useState(false);
  
  useEffect(() => {
    // Always fetch messages when we have userId, restClient, and haven't fetched yet for this user
    if (userId && restClient && !hasFetchedInitialMessages) {
      console.log('📨 Initial message fetch starting for userId:', userId, {
        existingMessages: messages.length,
        hasRecentMessages: messages.length > 0 && messages.some(m => m.type === 'received')
      });
      
      setMsgsLoading(true);
      setErrorMessage('');
      
      // Always fetch from backend to ensure we have all messages
      console.log('📨 Fetching all messages from backend...');
      restClient.get('messages', { clientId: userId })
        .then(async (res) => {
          if (res.status === 200) {
            const messagesData = res.data?.messages || [];
            console.log('📨 Raw messages from backend:', messagesData.map(m => ({
              id: m.messageId,
              senderId: m.senderId,
              received: m.received,
              viewed: m.viewed,
              message: m.message?.substring(0, 30) + '...'
            })));
            
            const formattedMessages = messagesData.map(msg => {
              const formatted = formatMessage(msg, userId);
              // Don't automatically mark as received - let sendReceivedNotifications handle it
              return formatted;
            });
            
            console.log('📨 Formatted messages:', formattedMessages.map(m => ({
              id: m.messageId,
              type: m.type,
              senderId: m.senderId,
              received: m.received,
              viewed: m.viewed
            })));
            
            // Send received notifications for messages that need them
            await sendReceivedNotifications(formattedMessages, true); // Mark as sync operation
            
            // Smart merge: Combine backend messages with local messages
            // Backend is the source of truth, but preserve local client-side messages
            console.log('🔄 Starting smart message merge...', {
              backendMessages: formattedMessages.length,
              localMessages: messages.length,
              backendIds: formattedMessages.map(m => m.messageId),
              localIds: messages.map(m => m.messageId)
            });
            
            const backendMessageIds = new Set(formattedMessages.map(m => m.messageId));
            const backendTimestamps = new Set(formattedMessages.map(m => m.createdAt || m.timestamp));
            
            // Keep local messages that are client-side only (bot/card) or exist in backend
            const validLocalMessages = messages.filter(localMsg => {
              const existsById = backendMessageIds.has(localMsg.messageId);
              const existsByTimestamp = backendTimestamps.has(localMsg.createdAt || localMsg.timestamp);
              const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
              
              return existsById || existsByTimestamp || isClientSideMessage;
            });
            
            // Start with all backend messages (they are the authoritative source)
            let finalMessages = [...formattedMessages];
            
            // Add client-side messages that don't exist in backend
            const clientSideMessages = messages.filter(localMsg => {
              const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
              const existsInBackend = backendMessageIds.has(localMsg.messageId);
              return isClientSideMessage && !existsInBackend;
            });
            
            finalMessages = [...finalMessages, ...clientSideMessages];
            
            console.log('📨 Message merge completed:', {
              finalMessageCount: finalMessages.length,
              backendMessagesAdded: formattedMessages.length,
              clientSideMessagesKept: clientSideMessages.length,
              removedLocalMessages: messages.length - validLocalMessages.length,
              finalIds: finalMessages.map(m => m.messageId)
            });
            
            const receivedMsgsCount = finalMessages.filter(msg => msg.type === 'received').length;
            const sentMsgsCount = finalMessages.filter(msg => msg.type === 'sent').length;
            
            // Only add bot message if there are sent messages but no received messages
            if (receivedMsgsCount === 0 && sentMsgsCount > 0) {
              const botTimestamp = Math.floor(Date.now() / 1000);
              finalMessages.push({
                messageId: generateMessageId(),
                type: 'bot',
                message: "We'll reply as soon as possible.",
                createdAt: botTimestamp.toString(),
                timestamp: botTimestamp
              });
              
              const userFormDataSubmitted = localStorage.getItem('userFormDataSubmitted');
              if (!userFormDataSubmitted) {
                const cardTimestamp = Math.floor(Date.now() / 1000);
                finalMessages.push({
                  messageId: generateMessageId(),
                  type: 'card',
                  createdAt: cardTimestamp.toString(),
                  timestamp: cardTimestamp
                });
              }
            }
            
            // Sort all messages by timestamp before updating
            const sortedMessages = sortMessagesByTimestamp(finalMessages);
            console.log('📨 Final message update:', {
              beforeSort: finalMessages.length,
              afterSort: sortedMessages.length,
              finalMessageIds: sortedMessages.map(m => m.messageId),
              finalMessageTypes: sortedMessages.map(m => m.type),
              lastMessage: sortedMessages[sortedMessages.length - 1]
            });
            updateMessages(sortedMessages);
            setHasFetchedInitialMessages(true);
            console.log('✅ Initial message fetch completed:', sortedMessages.length, 'messages');
          }
        })
        .catch(error => {
          const errorMsg = handleApiError(error, 'loading messages');
          setErrorMessage(errorMsg);
          console.error('Failed to load messages:', errorMsg);
        })
        .finally(() => setMsgsLoading(false));
    } else if (userId && restClient && hasFetchedInitialMessages) {
      // If we already fetched for this user, don't show loading
      setMsgsLoading(false);
    }
  }, [userId, restClient, hasFetchedInitialMessages]);
  
  // Reset fetch flag when userId changes
  useEffect(() => {
    setHasFetchedInitialMessages(false);
    setMsgsLoading(true); // Start with loading when userId changes
  }, [userId]);

  // Scroll to bottom and send "received" notifications
  useEffect(() => {
    // Only auto-scroll if user intention is auto (not manually at top)
    if (userScrollIntentionRef.current === 'auto') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (userId && restClient && messages.length > 0) {
      // Only send notifications for messages that are actually received from staff
      // and avoid sending notifications immediately after loading (which might be old messages)
      const thirtySecondsAgo = Math.floor(Date.now() / 1000) - 30;
      
      const newReceivedMessages = messages.filter(msg => {
        const messageTimestamp = parseInt(msg.createdAt) || msg.timestamp || 0;
        return msg.type === 'received' && 
               msg.received === false && 
               msg.messageId && 
               !msg.notificationSent &&
               msg.senderId !== msg.receiverId &&
               msg.senderId !== userId && // Don't send notifications for our own messages
               messageTimestamp > thirtySecondsAgo; // Only recent messages to avoid spam
      });

      newReceivedMessages.forEach(async (msg) => {
        try {
          const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_RECEIVED, msg.messageId);
          await restClient.post('messages/notify', notificationData);
          // Don't mutate message object directly - just send to backend
          console.log('Received notification sent for message:', msg.messageId);
        } catch (error) {
          const errorDetails = error.response?.data || error.message;
          const statusCode = error.response?.status;
          
          // Only log as warning for non-critical errors (like connection not found)
          if (statusCode === 400 && errorDetails.message?.includes('No connection found')) {
            console.debug('WebSocket connection not available for notification:', msg.messageId);
          } else {
            console.warn('Failed to send received notification for message:', msg.messageId, errorDetails);
          }
          // Don't show this error to user as it's not critical for chat functionality
        }
      });
    }
  }, [messages, userId, sending, staffUserTyping, restClient, userManuallyScrolled]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Scroll to bottom when messages change, but only if user intention is auto
    // or if this is the first message load, or if chatbox was just opened
    // Do NOT auto-scroll if user manually scrolled to top
    if (messages.length > 0 && (!showScrollToBottom || msgsLoading || chatboxOpen) && userScrollIntentionRef.current === 'auto') {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          // Only show scroll to top when there are enough messages for scrolling
          const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
          setShowScrollToTop(hasScrollableContent && messages.length > 2);
        }
      }, 100);
    }
  }, [messages, showScrollToBottom, msgsLoading, chatboxOpen, userManuallyScrolled]);

  // Initial scroll to bottom when chat loads
  useEffect(() => {
    if (!msgsLoading && messages.length > 0 && scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
      setTimeout(() => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          // Only show scroll to top when there are enough messages for scrolling
          const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
          setShowScrollToTop(hasScrollableContent && messages.length > 2);
          setUserManuallyScrolled(false); // Reset manual scroll flag on initial load
        }
      }, 200);
    }
  }, [msgsLoading, messages.length]);

  // Scroll to bottom when chatbox is opened
  useEffect(() => {
    if (chatboxOpen && messages.length > 0 && scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
      // Multiple attempts to ensure scrolling works when opening from notification
      setTimeout(() => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          setShowScrollToBottom(false);
          // Only show scroll to top when there are enough messages for scrolling
          const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
          setShowScrollToTop(hasScrollableContent && messages.length > 2);
        }
      }, 50);
      setTimeout(() => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          setShowScrollToBottom(false);
          // Only show scroll to top when there are enough messages for scrolling
          const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
          setShowScrollToTop(hasScrollableContent && messages.length > 2);
        }
      }, 200);
      setTimeout(() => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          setShowScrollToBottom(false);
          // Only show scroll to top when there are enough messages for scrolling
          const hasScrollableContent = scrollAreaRef.current.scrollHeight > scrollAreaRef.current.clientHeight;
          setShowScrollToTop(hasScrollableContent && messages.length > 2);
        }
      }, 400);
    }
  }, [chatboxOpen, messages.length, userManuallyScrolled]);

  // Check if scroll buttons should be shown when messages change
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const hasScrollableContent = scrollHeight > clientHeight;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        const isNearTop = scrollTop < 50;
        
        if (hasScrollableContent && messages.length > 2) {
          setShowScrollToBottom(!isNearBottom);
          setShowScrollToTop(!isNearTop);
        } else {
          setShowScrollToBottom(false);
          setShowScrollToTop(false);
        }
      }, 300);
    }
  }, [messages]);

  // Force scrollbar to always be visible - nuclear option
  useEffect(() => {
    const ensureScrollbar = () => {
      if (scrollAreaRef.current) {
        const element = scrollAreaRef.current;
        
        // Nuclear option - force all scroll properties with maximum priority
        element.style.setProperty('overflow-y', 'scroll', 'important');
        element.style.setProperty('overflow-x', 'hidden', 'important');
        element.style.setProperty('scrollbar-width', 'auto', 'important');
        element.style.setProperty('pointer-events', 'auto', 'important');
        element.style.setProperty('user-select', 'none', 'important');
        element.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
        element.tabIndex = 0;
        
        // Add the classes if they're missing
        if (!element.classList.contains('chatbox-messages')) {
          element.classList.add('chatbox-messages');
        }
        if (!element.classList.contains('scrollbar-thin')) {
          element.classList.add('scrollbar-thin');
        }
      }
    };

    // Set immediately
    ensureScrollbar();
    
    // Set again after multiple delays to handle ALL possible timing issues
    const timeouts = [10, 50, 100, 200, 500, 1000].map(delay => 
      setTimeout(ensureScrollbar, delay)
    );

    // Also set up a periodic check every 2 seconds
    const interval = setInterval(ensureScrollbar, 2000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [messages.length, msgsLoading, sending]); // Re-run when anything changes

  // Send message when "sending" is true
  useEffect(() => {
    if (sending) {
      sendMessage(text);
      setSending(false);
      setText('');
    }
  }, [sending]);

  // Set user info (location, device, etc)
  const setUserInfo = useCallback(async () => {
    try {
      const res = await fetch("https://ipwho.is/");
      const data = await res.json();
      
      // Check if the API request was successful
      if (!data.success) {
        throw new Error('Failed to get location data');
      }
      
      const userLocation = `${data.city}, ${data.region}, ${data.country}`;
      const parser = new UAParser();
      const result = parser.getResult();
      const userInfo = [];
      if (result.device) {
        if (result.device.vendor) userInfo.push(result.device.vendor);
        if (result.device.model) userInfo.push(result.device.model);
      }
      const userDevice = userInfo.length > 0 ? userInfo.join(' ') : 'Desktop';
      const newUserData = {
        ...formData,
        userId,
        userLocation,
        userDevice,
        // Add additional fields for API compatibility
        userEmail: formData.userEmail || userData.userEmail || '',
        userName: formData.userName || userData.userName || '',
        contactNumber: formData.contactNumber || userData.contactNumber || ''
      };
      updateUserData(newUserData);
      
      // Reconnect WebSocket with updated user data
      console.log('🔄 User data updated, reconnecting WebSocket with new data:', newUserData);
      setTimeout(() => {
        reconnectWebSocket();
      }, 500); // Small delay to ensure userData state update is propagated
    } catch (error) {
      console.error("Failed to fetch user location:", error);
    }
  }, [formData, userId, updateUserData, userData, reconnectWebSocket]);

  // Track previous message count to detect truly new messages
  const prevMessageCountRef = useRef(messages.length);

  // Handle new message notifications - ONLY when message count increases with received messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // Messages array increased - check if new received message was added
      const newMessages = messages.slice(prevMessageCountRef.current);
      const newReceivedMessage = newMessages.find(msg => 
        msg.type === 'received' && msg.senderId !== userId
      );
      
      if (newReceivedMessage && !chatboxOpen) {
        setNewMessageNotification(newReceivedMessage);
        setShowNotification(true);
      }
    }
    
    // Update previous count
    prevMessageCountRef.current = messages.length;
  }, [messages.length, chatboxOpen, userId]);

  // Hide notification when chatbox is opened
  useEffect(() => {
    if (chatboxOpen) {
      // Delay hiding notification to allow chatbox to render fully
      setTimeout(() => {
        setShowNotification(false);
        setNewMessageNotification(null);
      }, 100);
    }
  }, [chatboxOpen]);

  // Send viewed notifications for new messages when chatbox is open (simplified)
  useEffect(() => {
    if (chatboxOpen && messages.length > 0) {
      // Simple delay-based approach - send viewed notifications after 2 seconds
      const timeoutId = setTimeout(() => {
        sendViewedNotifications();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [chatboxOpen]); // Only depend on chatboxOpen to prevent loops

  // Send or edit message
  const sendMessage = useCallback(async (msgText) => {
    if (!validateMessage(msgText)) {
      setErrorMessage('Please enter a valid message');
      return;
    }
    
    const userFormDataSubmitted = localStorage.getItem('userFormDataSubmitted');
    if (!userId) return;
    
    setErrorMessage('');
    
    if (!editting) {
      const messagePayload = createSendMessagePayload(userId, msgText);
      
      try {
        const res = await restClient.post('messages', messagePayload);
        
        if (res.status === 200 && res.data.success) {
          // Use the timestamp from the server response if available, otherwise use current time
          const serverTimestamp = res.data.message?.timestamp || res.data.timestamp || Math.floor(Date.now() / 1000);
          const newMessage = {
            messageId: messagePayload.messageId,
            senderId: userId,
            receiverId: 'ALL',
            message: msgText,
            type: 'sent',
            createdAt: serverTimestamp.toString(),
            timestamp: serverTimestamp,
            status: 'SENT',
            senderName: userData.userName || 'You',
            sent: true,
            received: false,
            viewed: false,
            notificationSent: true // Mark as notification sent since we're sending it to backend
          };
          
          const updatedMessages = [
            ...messages.filter(msg => msg.type !== 'bot' && msg.type !== 'card'),
            newMessage
          ];
          
          const receivedMsgsCount = updatedMessages.filter(msg => msg.type === 'received').length;
            // Only add bot message if there are no received messages (user sent first message)
            if (receivedMsgsCount === 0) {
              const botTimestamp = Math.floor(Date.now() / 1000);
              updatedMessages.push({
                messageId: generateMessageId(),
                type: 'bot',
                message: "We'll reply as soon as possible.",
                createdAt: botTimestamp.toString(),
                timestamp: botTimestamp
              });
              
              if (!userFormDataSubmitted) {
                const cardTimestamp = Math.floor(Date.now() / 1000);
                updatedMessages.push({
                  messageId: generateMessageId(),
                  type: 'card',
                  createdAt: cardTimestamp.toString(),
                  timestamp: cardTimestamp
                });
              }
            }
            
            // Sort all messages by timestamp before updating
            const sortedMessages = sortMessagesByTimestamp(updatedMessages);
            updateMessages(sortedMessages);
        } else {
          throw new Error(res.data?.error || 'Failed to send message');
        }
      } catch (error) {
        const errorMsg = handleApiError(error, 'sending message');
        setErrorMessage(errorMsg);
        console.error('Failed to send message:', errorMsg);
      }
    } else {
      const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_EDITED, editedMsgId, msgText);
      
      try {
        const res = await restClient.post('messages/notify', notificationData);
        
        if (res.status === 200 && res.data.success) {
          const updatedMessages = messages.map(msg =>
            msg.messageId === editedMsgId ? { ...msg, message: msgText } : msg
          );
          // Sort messages after editing
          const sortedMessages = sortMessagesByTimestamp(updatedMessages);
          updateMessages(sortedMessages);
        } else {
          throw new Error(res.data?.error || 'Failed to edit message');
        }
      } catch (error) {
        const errorMsg = handleApiError(error, 'editing message');
        setErrorMessage(errorMsg);
        console.error('Failed to edit message:', errorMsg);
      }
      
      setEditedMsgId('');
      setEditting(false);
    }
  }, [userId, editting, editedMsgId, restClient, userData, messages]);

  // Refresh messages
  const handleRefreshMessages = useCallback(async () => {
    if (!userId || isRefreshing || isSyncing) return;
    
    setIsRefreshing(true);
    console.log('🔄 Refreshing messages...');
    
    try {
      // Use the new sync function if available, otherwise fall back to old method
      if (performMessageSync && isConnected) {
        console.log('🔄 Using WebSocket sync for refresh...');
        const syncResult = await syncMessagesOnReconnection(
          restClient,
          userId,
          messages,
          updateMessages
        );
        
        if (syncResult.success) {
          console.log('✅ Message refresh via sync completed:', {
            totalMessages: syncResult.finalMessageCount,
            newMessages: syncResult.newFromBackendCount,
            removedMessages: syncResult.removedLocalCount
          });
        } else {
          throw new Error(syncResult.error || 'Sync failed');
        }
      } else {
        // Fallback to old refresh method
        console.log('🔄 Using fallback refresh method...');
        const res = await restClient.get('messages', { clientId: userId });
        
        if (res.status === 200 && res.data.success) {
          const fetchedMessages = res.data.messages || [];
          console.log(`Refreshed ${fetchedMessages.length} messages`);
          
          // Format and sync with existing messages - remove local messages not in backend
          const formattedMessages = fetchedMessages.map(msg => {
            const formatted = formatMessage(msg, userId);
            
            // Preserve local viewed status if it exists
            const existingLocalMessage = messages.find(localMsg => 
              localMsg.messageId === formatted.messageId
            );
            if (existingLocalMessage && existingLocalMessage.viewed && !formatted.viewed) {
              formatted.viewed = existingLocalMessage.viewed;
              console.log(`🔄 Preserving local viewed status for message ${formatted.messageId}`);
            }
            
            return formatted;
          });
          
          // Sync local messages with backend: remove messages that don't exist in backend
          const backendMessageIds = new Set(formattedMessages.map(m => m.messageId));
          const backendTimestamps = new Set(formattedMessages.map(m => m.createdAt || m.timestamp));
          
          // Filter out local messages that don't exist in backend
          const validLocalMessages = messages.filter(localMsg => {
            const existsById = backendMessageIds.has(localMsg.messageId);
            const existsByTimestamp = backendTimestamps.has(localMsg.createdAt || localMsg.timestamp);
            const isClientSideMessage = localMsg.type === 'bot' || localMsg.type === 'card';
            
            return existsById || existsByTimestamp || isClientSideMessage;
          });
          
          // Merge valid local messages with backend messages
          const existingMessageIds = new Set(validLocalMessages.map(m => m.messageId));
          const existingMessageTimestamps = new Set(validLocalMessages.map(m => m.createdAt || m.timestamp));
          
          // Keep valid local messages and add new ones from backend that don't exist
          const newMessagesFromAPI = formattedMessages.filter(msg => {
            const messageExists = existingMessageIds.has(msg.messageId);
            const timestampExists = existingMessageTimestamps.has(msg.createdAt || msg.timestamp);
            return !messageExists && !timestampExists;
          });

          // Merge valid local messages with backend messages, preserving local state
          const mergedMessages = [...validLocalMessages];
          
          // Update existing messages with backend data while preserving local viewed status
          formattedMessages.forEach(backendMsg => {
            const localIndex = mergedMessages.findIndex(localMsg => 
              localMsg.messageId === backendMsg.messageId
            );
            if (localIndex !== -1) {
              // Preserve local viewed status when updating from backend
              const localMsg = mergedMessages[localIndex];
              mergedMessages[localIndex] = {
                ...backendMsg,
                viewed: localMsg.viewed || backendMsg.viewed, // Keep local viewed status if true
                received: localMsg.received || backendMsg.received // Also preserve received status
              };
            }
          });
          
          // Add completely new messages from backend
          mergedMessages.push(...newMessagesFromAPI);
          
          const finalMessages = mergedMessages;
          const sortedMessages = sortMessagesByTimestamp(finalMessages);
          
          console.log('🔄 Fallback refresh sync results:', {
            localMessages: messages.length,
            backendMessages: formattedMessages.length,
            validLocalAfterSync: validLocalMessages.length,
            removedLocalMessages: messages.length - validLocalMessages.length,
            newFromBackend: newMessagesFromAPI.length,
            finalCount: sortedMessages.length,
            removedMessageIds: messages.filter(m => !validLocalMessages.includes(m)).map(m => m.messageId)
          });
          
          updateMessages(sortedMessages);
        } else {
          throw new Error(res.data?.error || 'Failed to refresh messages');
        }
      }
      
      // Ensure scroll to bottom after refresh only if user intention allows
      setTimeout(() => {
        if (userScrollIntentionRef.current === 'auto') {
          ensureScrollToBottom();
        }
      }, 100);
    } catch (error) {
      const errorMsg = handleApiError(error, 'refreshing messages');
      setErrorMessage(errorMsg);
      console.error('Failed to refresh messages:', errorMsg);
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, isRefreshing, isSyncing, restClient, messages, performMessageSync, isConnected, updateMessages]);

  // Delete message
  const handleMessageDelete = useCallback(async (messageId) => {
    if (!userId) return;
    
    const notificationData = createNotificationPayload(userId, MESSAGE_STATUS.MESSAGE_DELETED, messageId);
    
    try {
      const res = await restClient.post('messages/notify', notificationData);
      
      if (res.status === 200 && res.data.success) {
        const updatedMessages = messages.filter(msg => msg.messageId !== messageId);
        // Sort messages after deletion (though order shouldn't change for deletion)
        const sortedMessages = sortMessagesByTimestamp(updatedMessages);
        updateMessages(sortedMessages);
      } else {
        throw new Error(res.data?.error || 'Failed to delete message');
      }
    } catch (error) {
      const errorMsg = handleApiError(error, 'deleting message');
      setErrorMessage(errorMsg);
      console.error('Failed to delete message:', errorMsg);
    }
  }, [userId, restClient, messages]);

  // Handle user info form submit
  const handleUserDataSubmit = (e) => {
    e.preventDefault();
    if (formData.userEmail && formData.userName) {
      setUserInfo();
      localStorage.setItem('userFormDataSubmitted', 'true');
      
      const updatedMessages = messages.filter(msg => msg.type !== 'card' && msg.type !== 'bot');
      const botTimestamp = Math.floor(Date.now() / 1000);
      updatedMessages.push({
        messageId: generateMessageId(),
        type: 'bot',
        message: 'Thank you for providing your details! We will reach out to you as soon as possible.',
        createdAt: botTimestamp.toString(),
        timestamp: botTimestamp
      });
      
      // Sort messages after adding bot message
      const sortedMessages = sortMessagesByTimestamp(updatedMessages);
      updateMessages(sortedMessages);
      setFormData({});
    }
  };

  // Handle typing in input
  const handleInputChange = (e) => {
    setText(e.target.value);
    
    // Send typing status if not already typing
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      debouncedSendTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing status
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Handle send message form submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!validateMessage(text)) {
      setErrorMessage('Please enter a valid message');
      return;
    }
    
    // Clear typing status
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setSending(true);
  };

  // Handle notification interactions
  const handleOpenChatbox = useCallback(() => {
    setChatboxOpen(true);
    
    // Only auto-scroll to bottom if user intention allows it
    if (userScrollIntentionRef.current === 'auto') {
      // FORCE SCROLL TO BOTTOM IMMEDIATELY AND REPEATEDLY
      const forceScrollToBottom = () => {
        if (scrollAreaRef.current && userScrollIntentionRef.current === 'auto') {
          const scrollArea = scrollAreaRef.current;
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      };
      
      // Try immediately
      forceScrollToBottom();
      
      // Try multiple times with different delays
      [50, 100, 200, 300, 500, 1000].forEach(delay => {
        setTimeout(forceScrollToBottom, delay);
      });
    }
  }, [messages, msgsLoading, chatboxOpen]);

  const handleDismissNotification = useCallback(() => {
    setShowNotification(false);
    setNewMessageNotification(null);
  }, []);

  return (
    <div className="chatbox">
      <Popover open={chatboxOpen} onOpenChange={handleChatboxOpenChange}>
        <PopoverTrigger className="relative bg-highlight-primary hover:bg-highlight-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110">
          <MessageCircleMore className="w-8 h-8" />
          {/* Unread message badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent className="mr-2 sm:mr-5 mb-3 w-[85vw] max-w-[400px] sm:max-w-[450px] md:max-w-[500px] p-3 rounded-lg bg-card-primary border border-border-primary shadow-xl">
          <div className="grid gap-2">
            <div className="space-y-1">
              <div className="flex mt-1 mb-2 ml-2 justify-between items-center">
                <h3 className="font-sans font-bold text-xl text-text-primary">{companyName}</h3>
                <div className="flex items-center gap-2">
                  {isSyncing && (
                    <div className="flex items-center gap-1 text-highlight-primary text-xs">
                      <div className="w-2 h-2 bg-highlight-primary rounded-full animate-pulse"></div>
                      Syncing...
                    </div>
                  )}
                  <button
                    onClick={handleRefreshMessages}
                    disabled={isRefreshing || isSyncing}
                    className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 bg-highlight-primary hover:bg-highlight-primary/80 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isSyncing ? "Syncing Messages..." : "Refresh Messages"}
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing || isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <div 
                ref={scrollAreaRef}
                className="h-[50vh] min-h-[320px] max-h-[480px] sm:h-[45vh] md:h-[40vh] rounded-md border border-border-primary bg-background-secondary p-2 mb-2 overflow-y-scroll scrollbar-thin chatbox-messages"
                style={{
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  overflowY: 'scroll'
                }}
                onScroll={handleScroll}
                onWheel={handleManualScroll}
                onTouchStart={handleManualScroll}
              >
                {errorMessage && (
                  <div className="bg-warning-primary/10 border border-warning-primary/30 rounded-lg p-3 mb-2">
                    <p className="text-warning-primary text-sm font-medium">{errorMessage}</p>
                  </div>
                )}
                {msgsLoading ? (
                  <div className="flex justify-center h-80 items-center">
                    <div className="flex flex-col items-center gap-3">
                      <HashLoader color="var(--color-highlight-primary)" size={50} />
                      <p className="text-text-secondary text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  <div key="messages" className="grid gap-2">
                    {(() => {
                      const filteredMessages = messages.filter(msg => {
                        // Show bot and card messages only if there are sent messages but no received messages
                        if (msg.type === 'bot' || msg.type === 'card') {
                          const hasReceivedMessages = messages.some(message => message.type === 'received');
                          const hasSentMessages = messages.some(message => message.type === 'sent');
                          return !hasReceivedMessages && hasSentMessages;
                        }
                        return true;
                      });

                      if (filteredMessages.length === 0) {
                        return (
                          <div className="flex flex-col justify-center items-center h-full min-h-[280px] text-text-secondary">
                            <MessageCircleMore className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Start a conversation!</p>
                          </div>
                        );
                      }

                      // Group messages by date
                      const groupedMessages = [];
                      let currentDate = null;
                      
                      filteredMessages.forEach((msg, idx) => {
                        const messageDate = new Date(parseInt(msg.createdAt) * 1000 || msg.timestamp * 1000 || Date.now());
                        const messageDateString = messageDate.toDateString();
                        
                        if (currentDate !== messageDateString) {
                          currentDate = messageDateString;
                          
                          // Add date label using Perth timezone
                          const today = getPerthCurrentDateTime().toDateString();
                          const yesterday = new Date(getPerthCurrentDateTime().getTime() - 24 * 60 * 60 * 1000).toDateString();
                          
                          let dateLabel;
                          if (messageDateString === today) {
                            dateLabel = 'Today';
                          } else if (messageDateString === yesterday) {
                            dateLabel = 'Yesterday';
                          } else {
                            // Format as "Mon, Jan 15" for older dates using Perth timezone
                            dateLabel = formatPerthDateTime(messageDate, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            });
                          }
                          
                          groupedMessages.push(
                            <div key={`date-${messageDateString}`} className="flex justify-center my-4">
                              <div className="bg-card-secondary/80 text-text-secondary text-xs px-3 py-1 rounded-full">
                                {dateLabel}
                              </div>
                            </div>
                          );
                        }
                        
                        // Add the message
                        groupedMessages.push(
                          <MessageRow
                            key={msg.messageId || `msg-${idx}`}
                            msg={msg}
                            setText={setText}
                            setEditedMsgId={setEditedMsgId}
                            setEditting={setEditting}
                            handleMessageDelete={handleMessageDelete}
                            formData={formData}
                            setFormData={setFormData}
                            handleUserDataSubmit={handleUserDataSubmit}
                          />
                        );
                      });

                      return groupedMessages;
                    })()}
                    {showTypingIndicatorForMessage(staffUserTyping) && (
                      <div className="grid grid-cols-5 items-center gap-4">
                        <div className="col-span-4 flex justify-start ml-2 mb-2">
                          <div className="bg-card-secondary/60 rounded-lg px-3 py-2">
                            <SyncLoader size={8} color="var(--color-highlight-primary)" />
                          </div>
                        </div>
                        <div className="col-span-1" />
                      </div>
                    )}
                    <div key="ref" ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Scroll to bottom button */}
              {showScrollToBottom && (
                <Button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg z-10 flex items-center justify-center border-2 border-white"
                  size="sm"
                >
                  ↓
                </Button>
              )}
              
              {/* Scroll to top button */}
              {showScrollToTop && (
                <Button
                  onClick={scrollToTop}
                  className="absolute top-4 left-4 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-10 flex items-center justify-center border-2 border-white"
                  size="sm"
                >
                  ↑
                </Button>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex pt-3">
              <div className="flex flex-row items-center w-full gap-2">
                  <Input
                    type="text"
                    placeholder="Write a message..."
                    value={text}
                    onChange={handleInputChange}
                    className="flex-1 bg-background-secondary border-border-secondary text-text-primary placeholder:text-text-secondary focus:border-highlight-primary transition-colors"
                    required
                  />
                  <Button type="submit" className="bg-highlight-primary hover:bg-highlight-primary/90 text-white shadow-md transition-all duration-200">
                    {sending ? <ClipLoader size={20} color="#ffffff" /> : editting ? <Check className="w-4 h-4" /> : <SendHorizontal className="w-4 h-4" />}
                  </Button>
                  {editting && (
                    <Button variant="outline" className="border-border-secondary text-text-primary hover:bg-card-secondary hover:text-text-primary transition-colors" onClick={() => {
                      setText('');
                      setEditedMsgId('');
                      setEditting(false);
                    }}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Message Notification */}
      <MessageNotification
        newMessage={newMessageNotification}
        onOpenChatbox={handleOpenChatbox}
        onDismiss={handleDismissNotification}
        isVisible={showNotification && !chatboxOpen}
      />
    </div>
  );
}

// Helper: Format message into lines
function getMultilineTexts(text) {
  return formatMessageText(text, LINE_CHAR_LIMIT);
}

// Helper: Format timestamp
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
  if (msg.type === 'sent') {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="col-span-1" />
            <div className="col-span-4 flex justify-end">
              <Badge variant="secondary" className="bg-highlight-primary hover:bg-highlight-primary/90 text-white shadow-sm max-w-[85%]">
                <FormattedMessage textsList={getMultilineTexts(msg.message)} timestamp={msg.createdAt} messageType="sent" />
              </Badge>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-card-primary border-border-primary shadow-lg">
          <ContextMenuItem>
            <Button variant="ghost" className="text-text-primary hover:text-text-primary hover:bg-card-secondary transition-colors" onClick={() => {
              setText(msg.message);
              setEditedMsgId(msg.messageId);
              setEditting(true);
            }}>
              ✏️ Edit
            </Button>
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border-primary" />
          <ContextMenuItem>
            <Button variant="ghost" className="text-warning-primary hover:text-warning-primary hover:bg-card-secondary transition-colors" onClick={() => handleMessageDelete(msg.messageId)}>
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
          <Badge variant="default" className="bg-card-secondary hover:bg-card-secondary/90 text-text-primary border border-border-primary shadow-sm max-w-[85%]">
            <FormattedMessage textsList={getMultilineTexts(msg.message)} timestamp={msg.createdAt} messageType="received" />
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
          <Card className="w-full max-w-sm py-4 gap-4 bg-card-primary border-border-primary shadow-md">
            <CardHeader className="px-4 pb-0">
              <CardDescription className="text-text-secondary font-medium">
                Please fill out the form below to help us reach you when you are offline.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <form onSubmit={handleUserDataSubmit}>
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-text-primary font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={formData.userEmail || ''}
                      onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                      className="bg-background-secondary border-border-secondary text-text-primary placeholder:text-text-secondary focus:border-highlight-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-text-primary font-medium">Name</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="John Doe"
                      value={formData.userName || ''}
                      onChange={e => setFormData({ ...formData, userName: e.target.value })}
                      className="bg-background-secondary border-border-secondary text-text-primary placeholder:text-text-secondary focus:border-highlight-primary transition-colors"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-highlight-primary hover:bg-highlight-primary/90 text-white shadow-md transition-all duration-200">
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
function FormattedMessage({ textsList, timestamp, messageType = 'default' }) {
  // Use appropriate timestamp color based on message type
  const timestampColorClass = messageType === 'sent' 
    ? 'text-white/70' // White with opacity for sent messages (green background)
    : 'text-text-secondary'; // Default secondary text color for received messages

  return (
    <div>
      <pre className="text-sm font-sans m-1 whitespace-pre-wrap leading-relaxed">
        {textsList.join('\n')}
      </pre>
      <div className="flex justify-end mt-1">
        <pre className={`text-xs font-sans font-normal ${timestampColorClass}`}>
          {formatTimestamp(timestamp)}
        </pre>
      </div>
    </div>
  );
}
