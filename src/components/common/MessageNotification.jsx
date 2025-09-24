import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircleMore, X, Reply, Bell, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { companyName } from '../../meta/companyData';
import { playNotificationSound, isNotificationSoundEnabled, toggleNotificationSound } from '../../utils/notificationUtils';

export default function MessageNotification({ 
  newMessage, 
  onOpenChatbox, 
  onDismiss,
  isVisible 
}) {
  const [show, setShow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isNotificationSoundEnabled());

  useEffect(() => {
    if (isVisible && newMessage) {
      setShow(true);
      
      // Play notification sound if enabled
      if (soundEnabled) {
        // Small delay to ensure component is visible first
        setTimeout(() => {
          playNotificationSound();
        }, 200);
      }
      
      // Auto-dismiss after 8 seconds (increased from 5 for better UX)
      const timer = setTimeout(() => {
        if (!isHovered) { // Don't auto-dismiss if user is hovering
          setShow(false);
          setTimeout(onDismiss, 400);
        }
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, newMessage, onDismiss, isHovered, soundEnabled]);

  const handleReply = (e) => {
    e?.stopPropagation();
    onOpenChatbox();
    setShow(false);
    setTimeout(onDismiss, 400);
  };

  const handleDismiss = (e) => {
    e?.stopPropagation();
    setShow(false);
    setTimeout(onDismiss, 400);
  };

  const handleToggleSound = (e) => {
    e?.stopPropagation();
    const newSoundState = toggleNotificationSound();
    setSoundEnabled(newSoundState);
    
    // Play a quick sound to confirm the action if enabling
    if (newSoundState) {
      setTimeout(() => playNotificationSound(), 100);
    }
  };

  if (!newMessage) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed top-20 left-1/2 z-50 w-[90%] max-w-sm"
          initial={{ x: '-50%', y: -100, opacity: 0, scale: 0.8 }}
          animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-50%', y: -100, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            mass: 0.8
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Notification glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-highlight-primary/20 to-blue-500/20 rounded-xl blur-lg -z-10"
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main notification card */}
            <div className="bg-gradient-to-br from-card-primary via-card-primary to-card-secondary border border-highlight-primary/30 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
              {/* Header with icon and company name */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-highlight-primary/10 to-blue-500/10 border-b border-highlight-primary/20">
                <motion.div
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-highlight-primary to-blue-500 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Bell className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex-1">
                  <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
                    New Message
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-xs text-text-secondary opacity-75">
                    From {companyName}
                  </div>
                </div>
                
                {/* Sound toggle and close buttons */}
                <div className="flex items-center gap-1">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={handleToggleSound}
                      variant="ghost"
                      size="sm"
                      className="text-text-secondary hover:text-text-primary hover:bg-card-secondary/50 p-1.5 h-auto w-auto rounded-full transition-all duration-200"
                      title={soundEnabled ? "Disable notification sounds" : "Enable notification sounds"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="text-text-secondary hover:text-text-primary hover:bg-card-secondary/50 p-1.5 h-auto w-auto rounded-full transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Message content */}
              <div className="px-4 py-3">
                <motion.div 
                  className="text-text-primary text-sm leading-relaxed mb-4 p-3 bg-background-secondary/50 rounded-lg border-l-4 border-highlight-primary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {newMessage.message?.length > 80 
                    ? `${newMessage.message.substring(0, 80)}...` 
                    : newMessage.message
                  }
                </motion.div>

                {/* Action buttons */}
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleReply}
                      className="w-full bg-gradient-to-r from-highlight-primary to-blue-500 hover:from-highlight-primary/90 hover:to-blue-500/90 text-white text-sm font-medium py-2.5 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom accent bar with progress indicator */}
              <motion.div className="relative h-1 bg-background-secondary/30 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-highlight-primary via-blue-500 to-highlight-primary"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                {/* Auto-dismiss progress bar */}
                {!isHovered && (
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-60"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 8, delay: 0.5, ease: "linear" }}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
