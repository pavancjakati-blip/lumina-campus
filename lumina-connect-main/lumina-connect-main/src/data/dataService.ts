const API_BASE = '/api';

export async function getAuthenticatedFaculty(email: string, password: string, role: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function getFacultyTodaySchedule(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/schedule`);
  return await res.json();
}

export async function getFacultySubjects(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/subjects`);
  return await res.json();
}

export async function getFacultyAttendance(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/attendance`);
  return await res.json();
}

export async function getFacultyLeaves(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/leaves`);
  return await res.json();
}

export async function getFacultyLeaveBalance(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/leave-balance`);
  return await res.json();
}

export async function getFacultyNotifications(facultyId: string) {
  const res = await fetch(`${API_BASE}/faculty/${facultyId}/notifications`);
  return await res.json();
}

export async function getAllFaculty() {
  const res = await fetch(`${API_BASE}/faculty`);
  return await res.json();
}

export async function getPendingLeaves() {
  const res = await fetch(`${API_BASE}/hod/leaves/pending`);
  return await res.json();
}

export async function getDepartmentStats() {
  const res = await fetch(`${API_BASE}/hod/stats`);
  return await res.json();
}

export async function getAllLeaveApplications() {
  const res = await fetch(`${API_BASE}/hod/leaves`);
  return await res.json();
}

// Added async methods for mutations
export async function createLeaveApplication(data: any) {
  const res = await fetch(`${API_BASE}/leave/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function reviewLeaveApplication(id: string, status: string, remarks: string) {
  const res = await fetch(`${API_BASE}/leave/status-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leaveId: id, status, remarks })
  });
  return await res.json();
}

export async function markAttendance(facultyId: string) {
  const res = await fetch(`${API_BASE}/attendance/mark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facultyId })
  });
  return await res.json();
}

export async function getDepartmentHOD(deptId: string) {
  const res = await fetch(`${API_BASE}/department/${deptId}/hod`);
  if (!res.ok) return null;
  return await res.json();
}
