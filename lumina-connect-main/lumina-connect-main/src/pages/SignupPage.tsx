import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Shield, ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  section: string;
  classroom: string;
  type: 'Theory' | 'Lab';
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1 State
  const [role, setRole] = useState<'faculty' | 'hod'>('faculty');
  const [personalDetails, setPersonalDetails] = useState({
    name: "", id: "", email: "", mobile: "", dob: "", gender: "Male", department: "Computer Science", designation: "", password: "", confirm: ""
  });

  // Password strength (simple 0-4)
  const passwordStrength = personalDetails.password.length === 0 ? 0 : Math.min(4, Math.floor(personalDetails.password.length / 3));

  // Step 2 State
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Data Structures', code: 'CS201', semester: '3', section: 'A', classroom: 'L201', type: 'Theory' }
  ]);

  const updatePersonal = (field: string, val: string) => setPersonalDetails(p => ({ ...p, [field]: val }));

  const addSubject = () => {
    setSubjects(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      name: '', code: '', semester: '', section: '', classroom: '', type: 'Theory'
    }]);
  };

  const updateSubject = (id: string, field: keyof Subject, val: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      setSubmitError('');
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: personalDetails.name,
            employeeId: personalDetails.id,
            email: personalDetails.email,
            mobile: personalDetails.mobile,
            department: personalDetails.department,
            designation: personalDetails.designation,
            password: personalDetails.password,
            role,
            subjects
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }
        setLoading(false);
        setSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } catch {
        setSubmitError('Could not connect to server. Make sure the backend is running.');
        setLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-x-hidden">
      {/* Dynamic Background Mesh Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center py-10 px-4 sm:px-6 relative z-10 w-full max-w-4xl mx-auto min-h-[100vh]">
        {!success && (
          <div className="w-full flex items-center justify-between mb-8 animate-fade-in">
            <Link to="/" className="text-primary font-bold text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              Lumina
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Already have an account?</span>
              <Link to="/" className="text-sm font-medium text-primary hover:underline">Log in</Link>
            </div>
          </div>
        )}

        <div className="w-full max-w-3xl flex-1 flex flex-col justify-center">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)] animate-checkmark">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Welcome to Lumina!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Your account has been created successfully. Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <div className="bg-card rounded-2xl p-6 sm:p-10 card-3d w-full shadow-[0_20px_60px_rgba(40,40,60,0.1)]">
              {/* Progress Stepper */}
              <div className="relative mb-8 sm:mb-12">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${((step - 1) / 2) * 100}%` }} 
                    transition={{ duration: 0.4, ease: "easeInOut" }} 
                  />
                </div>
                <div className="flex justify-between relative z-10">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                        step >= s ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "bg-card border-2 border-muted text-muted-foreground"
                      )}>
                        {step > s ? <CheckCircle size={16} /> : s}
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground absolute -bottom-5 sm:-bottom-6 whitespace-nowrap">
                        {s === 1 ? 'Personal Info' : s === 2 ? 'Subjects' : 'Review'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col min-h-[400px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Personnel Registration</h2>
                        <p className="text-sm text-muted-foreground mt-1">Please provide accurate academic identity details.</p>
                      </div>

                      <div className="p-1 bg-muted rounded-xl flex">
                        {[
                          { val: 'faculty', label: 'Faculty Member', icon: GraduationCap },
                          { val: 'hod', label: 'Head of Department', icon: Shield }
                        ].map(({ val, label, icon: Icon }) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setRole(val as any)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                              role === val ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon size={18} /> {label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Full Name</label>
                          <Input required placeholder="Dr. Ananya Sharma" value={personalDetails.name} onChange={e => updatePersonal('name', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Employee / Staff ID</label>
                          <Input required placeholder="EMP-2023-45" value={personalDetails.id} onChange={e => updatePersonal('id', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Official Email</label>
                          <Input required type="email" placeholder="ananya@lumina.edu" value={personalDetails.email} onChange={e => updatePersonal('email', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Mobile No (+91)</label>
                          <Input required type="tel" placeholder="9876543210" value={personalDetails.mobile} onChange={e => updatePersonal('mobile', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Department</label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-3d" value={personalDetails.department} onChange={e => updatePersonal('department', e.target.value)}>
                            <option value="AIML">Artificial Intelligence &amp; Machine Learning (AIML)</option>
                            <option value="EC">Electronics &amp; Communication Engineering (EC)</option>
                            <option value="EEE">Electrical &amp; Electronics Engineering (EEE)</option>
                            <option value="Chemical">Chemical Engineering</option>
                            <option value="ISE">Information Science Engineering (ISE)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Designation</label>
                          <Input required placeholder="Assistant Professor" value={personalDetails.designation} onChange={e => updatePersonal('designation', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Password</label>
                          <Input required type="password" placeholder="Create robust password" value={personalDetails.password} onChange={e => updatePersonal('password', e.target.value)} />
                          <div className="flex gap-1 mt-2 h-1.5">
                            {[1, 2, 3, 4].map(s => (
                              <div key={s} className={cn("flex-1 rounded-full transition-all duration-300", passwordStrength >= s ? (passwordStrength < 2 ? "bg-destructive" : passwordStrength < 4 ? "bg-warning" : "bg-success") : "bg-muted")} />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium pl-1">Confirm Password</label>
                          <Input required type="password" placeholder="Re-enter password" value={personalDetails.confirm} onChange={e => updatePersonal('confirm', e.target.value)} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Subjects Mapping</h2>
                          <p className="text-sm text-muted-foreground mt-1">Assign the batches and courses you will be handling.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addSubject} className="flex-shrink-0">
                          <Plus size={16} /> Add Subject
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-4">
                        <AnimatePresence>
                          {subjects.map((sub, idx) => (
                            <motion.div 
                              key={sub.id} 
                              initial={{ opacity: 0, height: 0, y: -10 }} 
                              animate={{ opacity: 1, height: 'auto', y: 0 }} 
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="bg-card border border-border p-4 rounded-xl shadow-sm relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-sm">Subject {idx + 1}</span>
                                {subjects.length > 1 && (
                                  <button type="button" onClick={() => removeSubject(sub.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <Input placeholder="Subject Name (e.g. DBMS)" value={sub.name} onChange={e => updateSubject(sub.id, 'name', e.target.value)} required className="col-span-2 sm:col-span-1" />
                                <Input placeholder="Code" value={sub.code} onChange={e => updateSubject(sub.id, 'code', e.target.value)} required />
                                <Input placeholder="Sem" value={sub.semester} onChange={e => updateSubject(sub.id, 'semester', e.target.value)} required />
                                <Input placeholder="Section" value={sub.section} onChange={e => updateSubject(sub.id, 'section', e.target.value)} required />
                                <Input placeholder="Room" value={sub.classroom} onChange={e => updateSubject(sub.id, 'classroom', e.target.value)} required />
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm input-3d" value={sub.type} onChange={e => updateSubject(sub.id, 'type', e.target.value)}>
                                  <option value="Theory">Theory</option>
                                  <option value="Lab">Lab</option>
                                </select>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {subjects.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                            No subjects added. Click 'Add Subject' to map your courses.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1">
                       <div>
                        <h2 className="text-2xl font-bold text-foreground">Review & Submit</h2>
                        <p className="text-sm text-muted-foreground mt-1">Verify your details before final submission.</p>
                      </div>

                      <div className="bg-muted/50 rounded-xl p-5 border border-border">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase">
                            {personalDetails.name.slice(0,2) || 'NA'}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{personalDetails.name || 'Not provided'}</h3>
                            <p className="text-sm text-muted-foreground uppercase">{role} • {personalDetails.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                          <div><span className="text-muted-foreground block text-xs">Department</span>{personalDetails.department || '-'}</div>
                          <div><span className="text-muted-foreground block text-xs">Designation</span>{personalDetails.designation || '-'}</div>
                          <div><span className="text-muted-foreground block text-xs">Email</span>{personalDetails.email || '-'}</div>
                          <div><span className="text-muted-foreground block text-xs">Mobile</span>+91 {personalDetails.mobile || '-'}</div>
                        </div>
                      </div>

                      <div>
                         <h4 className="font-semibold text-sm mb-3">Mapped Subjects ({subjects.length})</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {subjects.map((sub, i) => (
                             <div key={i} className="bg-card border border-border rounded-lg p-3 text-sm flex justify-between items-center">
                               <div>
                                 <strong className="block">{sub.name || 'Subject'} ({sub.code})</strong>
                                 <span className="text-muted-foreground text-xs">Sem {sub.semester} • Sec {sub.section}</span>
                               </div>
                               <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase">{sub.type}</span>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary-foreground/80 mt-4">
                        <Info className="text-primary flex-shrink-0" size={20} />
                        <label className="text-foreground text-sm cursor-pointer flex-1">
                          <input type="checkbox" required className="mr-2 rounded border-border text-primary focus:ring-primary w-4 h-4 translate-y-0.5 float-left" />
                          I declare that the information provided is completely accurate and corresponds to official institutional data.
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {submitError && (
                  <p className="text-sm text-destructive mt-4 text-center animate-fade-in">{submitError}</p>
                )}

                <div className="mt-8 flex justify-between pt-6 border-t border-border">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} disabled={loading} className="px-6 btn-3d">
                      <ChevronLeft size={16} /> Back
                    </Button>
                  ) : <div></div>}
                  
                  <Button type="submit" disabled={loading || (step === 2 && subjects.length === 0)} className="px-8 btn-3d">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                      </span>
                    ) : step === 3 ? (
                      <>Complete Setup</>
                    ) : (
                      <>Continue <ChevronRight size={16} /></>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
