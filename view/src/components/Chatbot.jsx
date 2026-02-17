import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, TextField, IconButton, Paper, Typography, 
  Avatar, Tooltip, Chip, Stack, CircularProgress, Collapse, Fade 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Import your centralized API service
import API from '../services/api'; 

const SUGGESTIONS = [
  "How do I register for an event?",
  "Find hackathons next month",
  "How to download my certificate?",
  "Who won the last competition?",
];

export default function Chatbot() {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      text: "Hi! I'm your Campus AI. 🤖\nAsk me about events, rules, or certificates!" 
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowGuide(false);
    setLoading(true);

    try {
      // ✅ FIX: Use '/events/ask' instead of '/bot/ask'
      const res = await API.post('/events/ask', { 
        question: textToSend 
      });
      
      // 3. Add Bot Response
      const answer = res.data.answer || "I'm not sure, but I can check with the organizers.";
      setMessages(prev => [...prev, { role: 'system', text: answer }]);
    } catch (err) {
      console.error("Bot Error:", err);
      setMessages(prev => [...prev, { role: 'system', text: "⚠️ I'm having trouble connecting to the brain. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{ role: 'system', text: "Chat cleared! How can I help now?" }]);
  };

  return (
    <>
      {/* --- 1. FLOATING ACTION BUTTON --- */}
      <Tooltip title={isOpen ? "Close Chat" : "Ask AI Assistant"} placement="left">
        <IconButton 
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            position: 'fixed', 
            bottom: 30, 
            right: 30,
            width: 60, 
            height: 60,
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 9999,
            '&:hover': { 
              transform: 'scale(1.1)', 
              bgcolor: theme.palette.primary.dark 
            }
          }}
        >
          {isOpen ? <CloseRoundedIcon fontSize="medium" /> : <SmartToyRoundedIcon fontSize="large" />}
        </IconButton>
      </Tooltip>

      {/* --- 2. CHAT WINDOW --- */}
      <Fade in={isOpen} mountOnEnter unmountOnExit>
        <Paper 
          elevation={24}
          sx={{
            position: 'fixed', 
            bottom: 100, 
            right: 30,
            width: { xs: 'calc(100% - 60px)', sm: 360 }, 
            height: 550,
            maxHeight: '80vh',
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 4, 
            overflow: 'hidden', 
            zIndex: 9999,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: '#ffffff'
          }}
        >
          {/* HEADER */}
          <Box sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <SmartToyRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>Event Bot</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Online</Typography>
              </Box>
            </Stack>
            <Stack direction="row">
               <Tooltip title="Clear Chat">
                <IconButton size="small" onClick={handleClearChat} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Help / Guide">
                <IconButton size="small" onClick={() => setShowGuide(!showGuide)} sx={{ color: 'white' }}>
                  <HelpOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* MESSAGES AREA */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8f9fa' }}>
            
            {/* USER GUIDE OVERLAY */}
            <Collapse in={showGuide}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', border: '1px dashed #2196f3', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary" gutterBottom textTransform="uppercase">
                  Try asking...
                </Typography>
                <Stack spacing={1} mt={1}>
                  {SUGGESTIONS.map((s, i) => (
                    <Chip 
                      key={i} 
                      label={s} 
                      onClick={() => handleSend(s)} 
                      clickable 
                      size="small"
                      color="primary" 
                      variant="outlined"
                      icon={<SmartToyRoundedIcon fontSize="small" />}
                      sx={{ justifyContent: 'flex-start', py: 0.5 }}
                    />
                  ))}
                </Stack>
              </Paper>
            </Collapse>

            {/* MESSAGE BUBBLES */}
            {messages.map((msg, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                {msg.role === 'system' && (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', mr: 1, mt: 0.5 }}>
                    <SmartToyRoundedIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                )}
                
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    maxWidth: '80%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: msg.role === 'system' ? 0 : 2,
                    borderTopRightRadius: msg.role === 'user' ? 0 : 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {/* LOADING INDICATOR */}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mb: 2 }}>
                 <Avatar sx={{ width: 24, height: 24, bgcolor: 'transparent', mr: 1 }}>
                    <SmartToyRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  </Avatar>
                <Paper sx={{ px: 2, py: 1, borderRadius: 2 }}>
                  <Stack direction="row" spacing={0.5}>
                    <Box sx={{ width: 6, height: 6, bgcolor: 'primary.light', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                    <Box sx={{ width: 6, height: 6, bgcolor: 'primary.light', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
                    <Box sx={{ width: 6, height: 6, bgcolor: 'primary.light', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* INPUT AREA */}
          <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1}>
              <TextField 
                fullWidth 
                size="small" 
                placeholder="Type your question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4, 
                    bgcolor: '#f8f9fa' 
                  } 
                }}
              />
              <IconButton 
                color="primary" 
                onClick={() => handleSend()} 
                disabled={loading || !input.trim()}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  width: 40, height: 40,
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: '#e0e0e0' }
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Fade>

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}