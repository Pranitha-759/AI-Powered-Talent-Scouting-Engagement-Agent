const express = require('express');
const router = express.Router();
const { parseJD } = require('../../ai-engine/parser');
const { calculateMatchScore } = require('../../ai-engine/matcher');
const { simulateChatInteraction } = require('../../ai-engine/chat_agent');
const { detectBias } = require('../../ai-engine/bias_detector');
const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const auth = require('../middleware/auth');

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Mock Candidate DB
const mockCandidates = [
    { id: 1, name: "John Doe", skills: ["React", "Node.js", "MongoDB"], experience: 3, projects: ["E-commerce App", "Real-time Chat"] },
    { id: 2, name: "Jane Smith", skills: ["Python", "Django", "AWS"], experience: 5, projects: ["Data Analytics Pipeline"] },
    { id: 3, name: "Alice Johnson", skills: ["React", "TypeScript", "Tailwind"], experience: 2, projects: ["Portfolio Site"] },
    { id: 4, name: "Bob Wilson", skills: ["Node.js", "Express", "MySQL", "Docker"], experience: 4, projects: ["Scalable Microservices"] },
    { id: 5, name: "Charlie Brown", skills: ["Java", "Spring Boot", "Kubernetes"], experience: 6, projects: ["Banking System"] }
];

// 1. JD Parsing Endpoint
router.post('/parse-jd', async (req, res) => {
    try {
        const { jd_text } = req.body;
        if (!jd_text) return res.status(400).json({ error: "JD text is required" });

        const parsedData = await parseJD(jd_text);
        const biasReport = detectBias(jd_text);
        
        res.json({
            ...parsedData,
            bias_report: biasReport,
            summary: `This role seeks a ${parsedData.role} with expertise in ${parsedData.skills.slice(0, 3).join(', ')}.`
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// 2. Candidate Matching & Ranking Endpoint
router.post('/match-candidates', async (req, res) => {
    try {
        const { jd_parsed } = req.body;
        if (!jd_parsed) return res.status(400).json({ msg: "Parsed JD is required" });

        // In a real scenario, we'd fetch from MySQL
        // For now, use mockCandidates
        const candidates = mockCandidates;

        const results = candidates.map(candidate => {
            const matchInfo = calculateMatchScore(jd_parsed, candidate);
            return {
                ...candidate,
                ...matchInfo,
                interest_score: 0, // Initial
                final_score: 0    // Initial
            };
        });

        // Sort by match score
        results.sort((a, b) => b.match_score - a.match_score);

        res.json(results);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// 3. Chat Simulation & Final Scoring
router.post('/simulate-chat', async (req, res) => {
    try {
        const { candidate, messages } = req.body;
        if (!candidate || !messages) return res.status(400).json({ msg: "Candidate and messages required" });

        const chatResult = simulateChatInteraction(candidate, messages);
        
        // Compute final score: 0.6 * Match + 0.4 * Interest
        const final_score = Math.round((0.6 * candidate.match_score) + (0.4 * chatResult.interest_score));
        
        const status = final_score > 80 ? "High Priority" : (final_score > 60 ? "Interested" : "Low Priority");

        res.json({
            ...chatResult,
            final_score,
            status
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// --- Auth Routes ---

// Register User
router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const pool = getPool();
        
        // --- Demo Mode Support ---
        if (!pool) {
            console.log('Using Demo Mode for Register');
            const payload = { user: { id: 999 } };
            return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
                res.json({ token, name: name || 'Demo User' });
            });
        }

        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const payload = { user: { id: result.insertId } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, name });
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// Login User
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = getPool();

        // --- Demo Mode Support ---
        if (!pool) {
            console.log('Using Demo Mode for Login');
            const payload = { user: { id: 999 } };
            return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
                res.json({ token, name: 'Demo Recruiter' });
            });
        }

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ msg: 'Invalid Credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, name: user.name });
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ msg: err.message });
    }
});

// File Upload Endpoint
router.post('/upload-jd', upload.single('jd_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        let jdText = '';
        const filePath = req.file.path;

        if (!fs.existsSync(filePath)) {
            throw new Error(`Uploaded file not found at: ${filePath}`);
        }
        
        if (req.file.mimetype === 'application/pdf') {
            try {
                const dataBuffer = fs.readFileSync(filePath);
                const parser = new PDFParse({ data: dataBuffer });
                const result = await parser.getText();
                jdText = result.text;
                await parser.destroy();
            } catch (pdfErr) {
                console.error('PDF Parse Error:', pdfErr);
                throw new Error(`Failed to parse PDF: ${pdfErr.message}`);
            }
        } else {
            jdText = fs.readFileSync(filePath, 'utf8');
        }

        if (!jdText || jdText.trim().length < 5) {
            jdText = `Content from file: ${req.file.originalname}. (Note: Minimal text extracted)`;
        }
        
        const parsedData = await parseJD(jdText);
        const biasReport = detectBias(jdText);
        
        res.json({
            ...parsedData,
            bias_report: biasReport,
            summary: `Extracted from ${req.file.originalname}: This role seeks a ${parsedData.role} with skills in ${parsedData.skills.slice(0, 3).join(', ')}.`
        });
    } catch (err) {
        console.error('Extraction Error:', err);
        res.status(500).json({ msg: err.message || "Failed to extract text from file" });
    }
});

module.exports = router;
