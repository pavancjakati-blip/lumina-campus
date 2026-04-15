import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readDb, writeDb, generateId } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth & Cold Start Logic
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = readDb();
  const targetRole = role?.toLowerCase() === 'hod' ? 'HOD' : 'Faculty';
  // Match by email + password + role
  const user = db.faculty.find((f: any) => f.email === email && f.password === password && f.role === targetRole);
  
  if (user) {
    // Check if facultyId exists in leaveBalance and facultySubjects
    const hasLeaveBalance = db.leaveBalance.some((lb: any) => lb.facultyId === user.id);
    const hasSubjects = db.facultySubjects.some((fs: any) => fs.facultyId === user.id);
    
    if (!hasLeaveBalance && !hasSubjects) {
      return res.json({ ...user, setup_required: true });
    }
    
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
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
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Check if already marked today
  const existing = db.attendance.find((a: any) => a.facultyId === facultyId && a.date === todayStr);
  if (existing) {
    return res.json({ success: false, already_marked: true, record: existing });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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
    const hours = now.getHours();
    
    // Check if it's past 10:00 AM
    if (hours >= 10) {
        const db = readDb();
        const todayStr = now.toISOString().split('T')[0];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[now.getDay()];
        let dbChanged = false;

        db.faculty.forEach((fac: any) => {
            // Guard: Only perform if faculty has completed setup
            const hasLeaveBalance = db.leaveBalance.some((lb: any) => lb.facultyId === fac.id);
            if (!hasLeaveBalance) return; 

            // Check if they are scheduled for today
            const hasClassToday = db.timetable.some((tt: any) => tt.facultyId === fac.id && tt.day === todayName);
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
                        markedAt: now.toISOString()
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

app.listen(port, () => {
  console.log(`Lumina Campus Backend is running on port ${port}`);
});
