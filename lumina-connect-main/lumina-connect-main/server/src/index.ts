import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readDb, writeDb, generateId } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];
    // Allow any vercel.app subdomain or onrender.com
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auth & Cold Start Logic

// Mock token generator just for this fix
const generateToken = (id: string) => `jwt-token-${id}-${Date.now()}`;

app.get('/api/debug/faculty-list', (req, res) => {
  try {
    const db = readDb();
    const faculty = db.luminaCampusDB?.faculty || 
                    db.faculty || 
                    [];
    res.json({
      success: true,
      totalFound: faculty.length,
      dbKeys: Object.keys(db),
      nestedKeys: db.luminaCampusDB ? 
                  Object.keys(db.luminaCampusDB) : 'no luminaCampusDB key',
      faculty: faculty.map((f: any) => ({
        name: f.name,
        email: f.email,
        role: f.role,
        hasPassword: !!f.password,
        password: f.password
      }))
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      cwd: process.cwd(),
      dirname: __dirname
    });
  }
});

app.post('/api/debug/test-login', (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDb();
    const faculty = db.faculty.find(
      (f: any) => f.email.toLowerCase() === email.toLowerCase()
    );
    res.json({
      emailProvided: email,
      facultyFound: !!faculty,
      facultyName: faculty?.name || 'NOT FOUND',
      passwordMatch: faculty?.password === password,
      storedPassword: faculty?.password || 'NO PASSWORD STORED',
      totalFaculty: db.faculty.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const db = readDb();
    
    // Try all possible database structures
    const facultyList = 
      db?.luminaCampusDB?.faculty || 
      db?.faculty || 
      [];
    
    console.log('Total faculty in DB:', facultyList.length);
    
    // Case-insensitive email match
    const faculty = facultyList.find(
      (f: any) => 
        f.email.toLowerCase().trim() === 
        email.toLowerCase().trim()
    );
    
    if (!faculty) {
      console.log('Faculty not found for email:', email);
      return res.status(401).json({
        success: false,
        error: 'No account found with email: ' + email
      });
    }
    
    console.log('Found faculty:', faculty.name, 
                'stored password:', faculty.password);
    
    // Check password
    if (faculty.password !== password) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Try: faculty123'
      });
    }
    
    // Generate token
    const token = require('crypto')
      .randomBytes(32).toString('hex');
    
    console.log('Login SUCCESS for:', faculty.name);
    
    return res.json({
      success: true,
      token: token,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        departmentId: faculty.departmentId,
        designation: faculty.designation,
        employeeId: faculty.employeeId,
        mobile: faculty.mobile,
        avatar: faculty.avatar,
        joinedYear: faculty.joinedYear,
        gender: faculty.gender
      }
    });
    
  } catch (err: any) {
    console.error('Login ERROR:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + err.message
    });
  }
});

// Signup - Register new faculty
app.post('/api/auth/signup', (req, res) => {
  const db = readDb();
  const { name, employeeId, email, mobile, department, designation, password, role, subjects } = req.body;

  // Check if email already exists
  const existing = db.faculty.find((f: any) => f.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Generate new faculty ID
  const newId = generateId('FAC', db.faculty);
  const avatar = name.split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).slice(0, 2).join('');
  const joinedYear = new Date().getFullYear().toString();

  const newFaculty = {
    id: newId,
    name,
    email,
    password,
    role: role?.toLowerCase() === 'hod' ? 'HOD' : 'Faculty',
    department: department || 'AIML',
    departmentId: 'DEPT001',
    designation: designation || 'Assistant Professor',
    employeeId: employeeId || newId,
    mobile: mobile || '',
    gender: 'Male',
    dateOfBirth: '',
    joinedYear,
    avatar
  };

  db.faculty.push(newFaculty);

  // Add default leave balance
  db.leaveBalance.push({
    facultyId: newId,
    casualLeave: { total: 10, used: 0, remaining: 10 },
    medicalLeave: { total: 5, used: 0, remaining: 5 },
    dutyLeave: { total: 5, used: 0, remaining: 5 },
    compensatoryLeave: { total: 3, used: 0, remaining: 3 }
  });

  // Add subjects if provided
  if (subjects && Array.isArray(subjects)) {
    subjects.forEach((subj: any) => {
      // Try to find existing subject by code
      let existingSubject = db.subjects.find((s: any) => s.code === subj.code);
      let subjectId: string;

      if (!existingSubject) {
        // Create new subject
        subjectId = generateId('SUB', db.subjects);
        db.subjects.push({
          id: subjectId,
          code: subj.code || subjectId,
          name: subj.name,
          semester: `Sem ${subj.semester}`,
          type: subj.type || 'Theory',
          credits: 3,
          ltp: subj.type === 'Lab' ? '0-0-2' : '3-0-0',
          departmentId: 'DEPT001'
        });
      } else {
        subjectId = existingSubject.id;
      }

      db.facultySubjects.push({
        id: generateId('FS', db.facultySubjects),
        facultyId: newId,
        subjectId,
        section: subj.section ? `AIML-${subj.section}` : 'AIML-A',
        semester: `Sem ${subj.semester}`,
        academicYear: '2025-26',
        room: subj.classroom || 'TBD'
      });
    });
  }

  writeDb(db);
  res.json({ success: true, faculty: newFaculty });
});

// Initialization
app.post('/api/faculty/initialize', (req, res) => {
  const db = readDb();
  const { facultyId, leaveBalances, subjects } = req.body;
  
  if (leaveBalances) {
    db.leaveBalance.push({ facultyId, ...leaveBalances });
  }
  
  if (subjects && Array.isArray(subjects)) {
    subjects.forEach((subj) => {
      db.facultySubjects.push({ 
        id: generateId('FS', db.facultySubjects), 
        facultyId, 
        ...subj 
      });
    });
  }
  
  writeDb(db);
  res.json({ success: true, message: "Faculty initialized successfully" });
});

// Helper for All Faculty
function getAllFaculty(db: any) {
  return db.faculty.map((f: any) => {
    const attRecords = db.attendance.filter((a: any) => a.facultyId === f.id).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const presentCount = attRecords.filter((a: any) => a.status === 'Present').length;
    const workingDays = attRecords.filter((a: any) => ['Present', 'Absent', 'On Leave'].includes(a.status)).length;
    const attPercentage = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 100;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAtt = attRecords.find((a: any) => a.date === todayStr);
    
    return { ...f, attendanceRatio: attPercentage, presentToday: todayAtt?.status === 'Present' };
  });
}

// Faculty specific read routes
app.get('/api/faculty/:id/schedule', (req, res) => {
  const db = readDb();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  
  const schedule = db.timetable.filter((tt: any) => tt.facultyId === req.params.id && tt.day === todayName).map((tt: any) => {
    const subject = db.subjects.find((s: any) => s.id === tt.subjectId);
    return { ...tt, subjectName: subject?.name || 'Unknown', subjectCode: subject?.code || 'Unknown' };
  }).sort((a: any, b: any) => {
    const [aTime, aAmPm] = a.startTime.split(' ');
    const [bTime, bAmPm] = b.startTime.split(' ');
    let [aHr, aMin] = aTime.split(':').map(Number);
    let [bHr, bMin] = bTime.split(':').map(Number);
    if (aAmPm === 'PM' && aHr !== 12) aHr += 12;
    if (bAmPm === 'PM' && bHr !== 12) bHr += 12;
    return (aHr * 60 + aMin) - (bHr * 60 + bMin);
  });
  res.json(schedule);
});

app.get('/api/faculty/:id/subjects', (req, res) => {
  const db = readDb();
  const assignments = db.facultySubjects.filter((fs: any) => fs.facultyId === req.params.id);
  const result = assignments.map((assignment: any) => {
    const subject = db.subjects.find((s: any) => s.id === assignment.subjectId);
    return { ...assignment, subject };
  });
  res.json(result);
});

app.get('/api/faculty/:id/attendance', (req, res) => {
  const db = readDb();
  const records = db.attendance.filter((a: any) => a.facultyId === req.params.id).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(records);
});

app.get('/api/faculty/:id/leaves', (req, res) => {
  const db = readDb();
  const leaves = db.leaveApplications.filter((l: any) => l.facultyId === req.params.id).sort((a: any, b: any) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  res.json(leaves);
});

app.get('/api/faculty/:id/leave-balance', (req, res) => {
  const db = readDb();
  const bal = db.leaveBalance.find((lb: any) => lb.facultyId === req.params.id);
  res.json(bal);
});

app.get('/api/faculty/:id/notifications', (req, res) => {
  const db = readDb();
  const notes = db.notifications.filter((n: any) => n.toFacultyId === req.params.id).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(notes);
});

app.get('/api/faculty', (req, res) => {
  const db = readDb();
  res.json(getAllFaculty(db));
});

// HOD specific routes
app.get('/api/hod/stats', (req, res) => {
  const db = readDb();
  const allFac = getAllFaculty(db);
  const presentTodayCount = allFac.filter((f: any) => f.presentToday).length;
  const leaveTodayCount = db.leaveApplications.filter((l: any) => {
    const today = new Date();
    const from = new Date(l.fromDate);
    const to = new Date(l.toDate);
    return l.status === 'Approved' && today >= from && today <= to;
  }).length;
  
  const pendingRequestsCount = db.leaveApplications.filter((l: any) => l.status === 'Pending').length;
  
  res.json({
    totalFaculty: allFac.length,
    presentToday: presentTodayCount,
    onLeaveToday: leaveTodayCount,
    pendingLeaves: pendingRequestsCount
  });
});

app.get('/api/hod/leaves/pending', (req, res) => {
  const db = readDb();
  const currentLeaves = db.leaveApplications.filter((l: any) => l.status === 'Pending').map((l: any) => {
    const matchedFaculty = db.faculty.find((f: any) => f.id === l.facultyId);
    return { ...l, facultyName: matchedFaculty?.name || 'Unknown', role: matchedFaculty?.designation || 'Unknown' };
  });
  res.json(currentLeaves);
});

app.get('/api/hod/leaves', (req, res) => {
  const db = readDb();
  const currentLeaves = db.leaveApplications.map((l: any) => {
    const matchedFaculty = db.faculty.find((f: any) => f.id === l.facultyId);
    return { ...l, facultyName: matchedFaculty?.name || 'Unknown', designation: matchedFaculty?.designation || 'Unknown' };
  }).sort((a: any, b: any) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  res.json(currentLeaves);
});

// Get HOD for a department
app.get('/api/department/:deptId/hod', (req, res) => {
  const db = readDb();
  const dept = db.departments.find((d: any) => d.id === req.params.deptId);
  if (!dept) return res.status(404).json({ error: 'Department not found' });
  const hod = db.faculty.find((f: any) => f.id === dept.hodId);
  if (!hod) return res.status(404).json({ error: 'HOD not found' });
  res.json({ id: hod.id, name: hod.name, email: hod.email, designation: hod.designation });
});

// Mark Attendance
app.post('/api/attendance/mark', (req, res) => {
  const { facultyId } = req.body;
  const db = readDb();

  // Use IST (Asia/Kolkata) for consistent date/time display
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST
  
  // Check if already marked today
  const existing = db.attendance.find((a: any) => a.facultyId === facultyId && a.date === todayStr);
  if (existing) {
    return res.json({ success: false, already_marked: true, record: existing });
  }

  // Format time in IST for display
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  const newRecord = {
    id: generateId('ATT', db.attendance),
    facultyId,
    date: todayStr,
    status: 'Present',
    markedAt: timeStr
  };

  db.attendance.push(newRecord);
  writeDb(db);
  res.json({ success: true, already_marked: false, record: newRecord });
});

// Leave Management
app.post('/api/leave/request', (req, res) => {
  const db = readDb();
  const newLeave = {
    ...req.body,
    id: generateId('LEAVE', db.leaveApplications),
    status: 'Pending',
    appliedOn: new Date().toISOString()
  };
  db.leaveApplications.push(newLeave);
  writeDb(db);
  res.json(newLeave);
});

app.post('/api/leave/status-update', (req, res) => {
  const db = readDb();
  const { leaveId, status, remarks } = req.body;
  const leaveIndex = db.leaveApplications.findIndex((l: any) => l.id === leaveId);
  if (leaveIndex === -1) return res.status(404).json({ error: 'Not found' });

  db.leaveApplications[leaveIndex].status = status;
  if (remarks) db.leaveApplications[leaveIndex].hodRemarks = remarks;

  const facultyId = db.leaveApplications[leaveIndex].facultyId;

  if (status === 'Approved') {
    const duration = db.leaveApplications[leaveIndex].duration || 1;
    const typeMap: Record<string, string> = {
      'Casual Leave': 'casualLeave',
      'Medical Leave': 'medicalLeave',
      'Duty Leave': 'dutyLeave',
      'Compensatory Leave': 'compensatoryLeave'
    };
    const key = typeMap[db.leaveApplications[leaveIndex].leaveType];
    
    if (key) {
      const balanceIndex = db.leaveBalance.findIndex((b: any) => b.facultyId === facultyId);
      if (balanceIndex !== -1 && db.leaveBalance[balanceIndex][key]) {
        db.leaveBalance[balanceIndex][key].remaining = Math.max(0, db.leaveBalance[balanceIndex][key].remaining - duration);
        db.leaveBalance[balanceIndex][key].used += duration;
      }
    }

    db.notifications.push({
      id: generateId('NOTIF', db.notifications),
      toFacultyId: facultyId,
      fromRole: "HOD",
      title: "Leave Approved",
      body: "Your leave request has been approved.",
      type: "leave_update",
      read: false,
      createdAt: new Date().toISOString()
    });
  } else if (status === 'Rejected') {
    db.notifications.push({
      id: generateId('NOTIF', db.notifications),
      toFacultyId: facultyId,
      fromRole: "HOD",
      title: "Leave Rejected",
      body: "Your leave request has been rejected.",
      type: "leave_update",
      read: false,
      createdAt: new Date().toISOString()
    });
  }
  
  writeDb(db);
  res.json(db.leaveApplications[leaveIndex]);
});

// Automated Attendance System Background Task
const checkAttendance = () => {
    const now = new Date();

    // Convert to IST for accurate time-based logic
    const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const istTimeStr = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }); // HH:MM:SS
    const [istHour, istMin] = istTimeStr.split(':').map(Number);
    const istMinutes = istHour * 60 + istMin;

    // Check if it's past 4:30 PM IST (16:30 = 990 minutes)
    if (istMinutes >= 16 * 60 + 30) {
        const db = readDb();
        const todayStr = istDateStr;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // Get IST day of week
        const istDayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
        let dbChanged = false;

        db.faculty.forEach((fac: any) => {
            // Guard: Only perform if faculty has completed setup
            const hasLeaveBalance = db.leaveBalance.some((lb: any) => lb.facultyId === fac.id);
            if (!hasLeaveBalance) return; 

            // Check if they are scheduled for today
            const hasClassToday = db.timetable.some((tt: any) => tt.facultyId === fac.id && tt.day === istDayName);
            if (hasClassToday) {
                // Verify attendance record exists
                const recordExists = db.attendance.some((a: any) => a.facultyId === fac.id && a.date === todayStr);
                
                // If it doesn't exist, mark as absent and alert
                if (!recordExists) {
                    db.attendance.push({
                        id: generateId('ATT', db.attendance),
                        facultyId: fac.id,
                        date: todayStr,
                        status: "Absent",
                        markedAt: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
                    });
                    
                    db.notifications.push({
                        id: generateId('NOTIF', db.notifications),
                        toFacultyId: fac.id,
                        fromRole: "System",
                        title: "Attendance Alert",
                        body: "You have been marked Absent because you missed marking your attendance.",
                        type: "attendance_alert",
                        read: false,
                        createdAt: now.toISOString()
                    });
                    
                    dbChanged = true;
                }
            }
        });
        
        if (dbChanged) writeDb(db);
    }
};

// Check attendance polling every 15 minutes
setInterval(checkAttendance, 15 * 60 * 1000);

// Health check endpoint (used by keep-alive ping)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Keep-alive ping for Render free-tier (pings every 14 min to prevent sleep)
if (process.env.NODE_ENV === 'production' && process.env.RENDER_URL) {
  setInterval(async () => {
    try {
      const https = await import('https');
      https.get(`${process.env.RENDER_URL}/api/health`, (res) => {
        console.log(`Keep-alive ping: ${res.statusCode}`);
      }).on('error', (e: Error) => {
        console.log('Keep-alive error:', e.message);
      });
    } catch (e: any) {
      console.log('Keep-alive failed:', e.message);
    }
  }, 14 * 60 * 1000);
  console.log('Keep-alive ping scheduled every 14 minutes.');
}

app.listen(port, () => {
  console.log(`Lumina Campus Backend is running on port ${port}`);
});
