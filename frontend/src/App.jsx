import React, { useState, useContext } from 'react';
import { 
  Box, Container, Typography, Button, Paper, TextField, 
  Grid, Avatar, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemIcon, ListItemText,
  Drawer, AppBar, Toolbar
} from '@mui/material';
import { 
  CloudUpload, Search, Person, Chat, Assessment, 
  Logout, Dashboard as DashboardIcon, UploadFile, Groups,
  Star, Bolt, AutoFixHigh, History
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeView, setActiveView] = useState('dashboard');
  const [jdText, setJdText] = useState('');
  const [parsedJd, setParsedJd] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('jd_file', file);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/upload-jd`, formData);
      setParsedJd(res.data);
      handleMatchCandidates(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleParseJD = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/parse-jd`, { jd_text: jdText });
      setParsedJd(res.data);
      handleMatchCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCandidates = async (jd_parsed) => {
    try {
      const res = await axios.post(`${API_BASE}/match-candidates`, { jd_parsed });
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenChat = (candidate) => {
    setSelectedCandidate(candidate);
    setMessages([
      { sender: 'bot', text: `Hi ${candidate.name}! I'm TalentScout AI Agent, the AI Scout for this role. Are you open to new opportunities?` }
    ]);
    setChatOpen(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const userMsg = { sender: 'user', text: newMessage };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setNewMessage('');
    
    try {
      const res = await axios.post(`${API_BASE}/simulate-chat`, { 
        candidate: selectedCandidate, 
        messages: updatedMessages 
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting right now. Let's try again." }]);
    }
  };

  const finalizeInterest = async () => {
    try {
      const res = await axios.post(`${API_BASE}/simulate-chat`, { 
        candidate: selectedCandidate, 
        messages: messages 
      });
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate.id ? { ...c, ...res.data } : c
      ).sort((a, b) => (b.final_score || 0) - (a.final_score || 0)));
      setChatOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const DRAWER_WIDTH = 280;

  const renderDashboard = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} lg={4}>
        <Paper className="glass-card animate-fade-up" sx={{ p: 4, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: 'primary.main', mr: 2 }}>
              <UploadFile />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">Upload Job Description</Typography>
          </Box>
          <Button
            variant="outlined" component="label" fullWidth startIcon={<CloudUpload />}
            sx={{ mb: 3, py: 4, borderStyle: 'dashed', borderRadius: 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            UPLOAD PDF / DOCX
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          <Divider sx={{ my: 3, opacity: 0.1 }}>
            <Chip label="OR PASTE TEXT" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }} />
          </Divider>
          <TextField
            fullWidth multiline rows={6} placeholder="Paste the JD content..."
            value={jdText} onChange={(e) => setJdText(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'rgba(0,0,0,0.2)' } }}
          />
          <Button 
            fullWidth variant="contained" onClick={handleParseJD} disabled={loading || !jdText}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} /> : 'ANALYZE JD'}
          </Button>
          {parsedJd && (
            <Box sx={{ mt: 4, p: 3, borderRadius: 4, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography variant="subtitle2" color="primary.main" fontWeight="bold">AI Summary</Typography>
              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', opacity: 0.9 }}>{parsedJd.summary}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {parsedJd.skills.map((skill, idx) => <Chip key={idx} label={skill} size="small" />)}
              </Box>
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Paper className="glass-card animate-fade-up" sx={{ p: 4, height: '100%', animationDelay: '0.2s' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h6" fontWeight="bold">Ranked Talent Pool</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell align="center">Match</TableCell>
                  <TableCell align="center">Interest</TableCell>
                  <TableCell align="center">Final</TableCell>
                  <TableCell align="center">Outreach</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10, opacity: 0.3 }}>No candidates analyzed yet.</TableCell></TableRow>
                ) : candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">{c.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{c.reason}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${c.match_score}%`} color={c.match_score > 70 ? 'success' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {c.interest_score ? <Chip label={`${c.interest_score}%`} color="secondary" size="small" /> : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontWeight: '900' }}>{c.final_score || '—'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="small" onClick={() => handleOpenChat(c)}>Engage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderCandidates = () => (
    <Paper className="glass-card animate-fade-up" sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Full Talent Pipeline</Typography>
      <Grid container spacing={3}>
        {[
          { name: "Pranitha S.", role: "Senior Fullstack Developer", exp: "5 years", match: 92 },
          { name: "John Doe", role: "React Expert", exp: "3 years", match: 85 },
          { name: "Jane Smith", role: "Python Engineer", exp: "4 years", match: 78 }
        ].map((cand, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle1" fontWeight="bold">{cand.name}</Typography>
              <Typography variant="body2" opacity={0.6}>{cand.role}</Typography>
              <Chip label={`${cand.match}% Match`} color="primary" size="small" sx={{ mt: 1 }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  const renderHistory = () => (
    <Paper className="glass-card animate-fade-up" sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>Recent Activity</Typography>
      <List>
        {[{ title: "Frontend Engineer Scan", date: "2 hours ago" }, { title: "Python Developer JD", date: "Yesterday" }].map((item, idx) => (
          <ListItem key={idx} sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 2, borderRadius: 3 }}>
            <ListItemText primary={item.title} secondary={item.date} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const renderAutomations = () => (
    <Paper className="glass-card animate-fade-up" sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>AI Agent Automations</Typography>
      <Grid container spacing={3}>
        {[{ title: "Auto-Engagement", active: true }, { title: "Bias Filtering", active: true }].map((auto, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">{auto.title}</Typography>
              <Chip label={auto.active ? "Active" : "Disabled"} color={auto.active ? "success" : "default"} size="small" />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'rgba(15, 23, 42, 0.8)', color: 'white' } }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="h5" className="gradient-text">TalentScout AI</Typography></Box>
        <List sx={{ px: 2 }}>
          {['dashboard', 'candidates', 'history', 'automations'].map((view) => (
            <ListItem key={view} button onClick={() => setActiveView(view)} className={`sidebar-item ${activeView === view ? 'sidebar-active' : ''}`}>
              <ListItemText primary={view.charAt(0).toUpperCase() + view.slice(1)} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 3 }}><Button fullWidth variant="outlined" color="error" onClick={logout}>Sign Out</Button></Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', mb: 4 }}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name ? user.name[0] : 'U'}</Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'candidates' && renderCandidates()}
          {activeView === 'history' && renderHistory()}
          {activeView === 'automations' && renderAutomations()}
        </Container>

        <Dialog open={chatOpen} onClose={() => setChatOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ textAlign: 'center' }}>Chat with {selectedCandidate?.name}</DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
              {messages.map((m, i) => (
                <Box key={i} sx={{ mb: 2, textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                  <Typography variant="body2" sx={{ p: 2, bgcolor: m.sender === 'user' ? 'primary.main' : 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    {m.text}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type..." />
              <Button variant="contained" onClick={handleSendMessage}>Send</Button>
            </Box>
            <Button fullWidth variant="contained" color="secondary" sx={{ mt: 2 }} onClick={finalizeInterest}>FINALISE & RANK</Button>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

function App() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Box sx={{ height: '100vh', bgcolor: '#020617' }}></Box>;
  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
