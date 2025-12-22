
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, ChevronRight, UserCircle, Building2, Briefcase, User } from 'lucide-react';
import { API } from '../../services/api';
import { EMPLOYEES } from '../../data/employees';

export default function Login({ onLogin }) {
    const [loginType, setLoginType] = useState('staff'); // 'staff' or 'admin'
    const [dbEmployees, setDbEmployees] = useState([]); // Store fetched employees
    const [isLoading, setIsLoading] = useState(false);

    // Load employees from DB on mount
    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await API.fetchEmployees();
                if (data && Array.isArray(data) && data.length > 0) {
                    setDbEmployees(data);
                } else {
                    console.log("Using local employee data");
                    setDbEmployees(EMPLOYEES);
                }
            } catch (e) {
                console.error("API Error, using fallback", e);
                setDbEmployees(EMPLOYEES);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Staff State
    const [staffInfo, setStaffInfo] = useState({
        name: '',
        team: '',
        position: 'Team Member', // Default
        jobGroup: ''
    });

    // Admin State
    const [adminRole, setAdminRole] = useState('admin'); // 'admin' or 'hr'
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Mock Database for Passwords
    const [adminPw, setAdminPw] = useState(() => localStorage.getItem('adminPassword') || '0000');
    const [hrPw, setHrPw] = useState(() => localStorage.getItem('hrPassword') || '0741');

    const [isPasswordChanged, setIsPasswordChanged] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);
    const [currentPwInput, setCurrentPwInput] = useState('');
    const [newPw, setNewPw] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (loginType === 'staff') {
            if (!staffInfo.name || !staffInfo.team) {
                setError('이름과 부서를 입력해주세요.');
                return;
            }

            // Strict Validation against DB
            let found = false;
            let foundEmp = null;

            if (dbEmployees.length > 0) {
                foundEmp = dbEmployees.find(emp =>
                    emp.name === staffInfo.name &&
                    emp.team === staffInfo.team
                );
                if (foundEmp) found = true;
            }

            if (!found) {
                // Strict denial
                alert(`'${staffInfo.name}'님은 '${staffInfo.team}' 소속으로 등록되어 있지 않습니다.\n정보를 다시 확인해주세요.`);
                return;
            }

            // Auto-fill position if found (optional but good for UX)
            // const role = mapPositionToRole(foundEmp.position); 
            // Better to trust the User's input OR the DB? User request says "Name/Dept match -> Start".
            // We should use the DB role ideally, but let's stick to the mapped role from DB info to be safe.
            const role = mapPositionToRole(foundEmp.position); // Use strict DB position

            onLogin({
                ...foundEmp, // Use DB data to ensure role is correct
                role: role
            });
            navigate('/eval/dashboard');

        } else {
            // Admin/HR Logic
            if (adminRole === 'admin') {
                if (password === adminPw) {
                    onLogin({ role: 'admin', name: '관리자' });
                    navigate('/admin');
                } else {
                    setError('비밀번호가 올바르지 않습니다.');
                }
            } else if (adminRole === 'hr') {
                if (password === hrPw) {
                    onLogin({ role: 'hr', name: '인사담당자' });
                    navigate('/hr');
                } else {
                    setError('비밀번호가 올바르지 않습니다.');
                }
            }
        }
    };

    const mapPositionToRole = (pos) => {
        if (pos === '관장') return 'director';
        if (pos === '사무국장') return 'secgen';
        if (pos === '팀장') return 'leader';
        return 'member';
    };

    const handleChangePassword = () => {
        const targetPw = adminRole === 'admin' ? adminPw : hrPw;

        if (currentPwInput !== targetPw) {
            alert('현재 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPw.length < 4) {
            alert('비밀번호는 4자리 이상이어야 합니다.');
            return;
        }

        if (adminRole === 'admin') {
            setAdminPw(newPw);
            localStorage.setItem('adminPassword', newPw);
        } else {
            setHrPw(newPw);
            localStorage.setItem('hrPassword', newPw);
        }

        setIsPasswordChanged(true);
        setShowChangePw(false);
        setNewPw('');
        setCurrentPwInput('');
        alert('비밀번호가 변경되었습니다.');
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <div className="card animate-fade-in" style={{ width: '450px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-700)' }}>
                    HR Insight Pro
                </h2>

                {/* Login Type Toggles */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
                    <button
                        style={{ flex: 1, padding: '1rem', borderBottom: loginType === 'staff' ? '2px solid var(--primary-600)' : 'none', fontWeight: loginType === 'staff' ? 700 : 400, color: loginType === 'staff' ? 'var(--primary-700)' : 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setLoginType('staff')}
                    >
                        직원 접속
                    </button>
                    <button
                        style={{ flex: 1, padding: '1rem', borderBottom: loginType === 'admin' ? '2px solid var(--primary-600)' : 'none', fontWeight: loginType === 'admin' ? 700 : 400, color: loginType === 'admin' ? 'var(--primary-700)' : 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setLoginType('admin')}
                    >
                        관리자 접속
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    {loginType === 'staff' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="input-field" placeholder="이름 (예: 홍길동)"
                                value={staffInfo.name} onChange={e => setStaffInfo({ ...staffInfo, name: e.target.value })}
                            />
                            <input
                                className="input-field" placeholder="부서 (예: 전략기획팀)"
                                value={staffInfo.team} onChange={e => setStaffInfo({ ...staffInfo, team: e.target.value })}
                            />
                            {/* Position Select removed as we auto-detect from DB or keep it read-only? 
                                User Request: "Name, Dept match -> Start". 
                                The user might NOT want to select Position if we know it. 
                                But if DB fallback fails, they might need it. 
                                Let's keep it but maybe it's less critical if we enforce DB match.
                                Actually, if we enforce DB match, we don't need them to select 'Position' or 'JobGroup' if it's in DB.
                                But let's keep the existing UI logic for now, just enforce the MATCH.
                            */}
                            {/* We will hide the Position/JobGroup inputs if we are strictly matching against DB anyway, 
                                BUT simplifying the UI to just Name/Team as per request "Name, Dept match -> Page". 
                            */}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.5rem' }}>
                                * 이름과 부서를 정확히 입력해주세요. (등록된 정보와 일치해야 합니다)
                            </div>
                        </div>
                    )}

                    {loginType === 'admin' && (
                        <>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                                <button type="button" className={`btn ${adminRole === 'admin' ? 'btn-primary' : 'btn-outline'} `} onClick={() => setAdminRole('admin')} style={{ flex: 1 }}>
                                    <User size={18} style={{ marginRight: '0.5rem' }} /> 관리자
                                </button>
                                <button type="button" className={`btn ${adminRole === 'hr' ? 'btn-primary' : 'btn-outline'} `} onClick={() => setAdminRole('hr')} style={{ flex: 1 }}>
                                    <Users size={18} style={{ marginRight: '0.5rem' }} /> 인사팀
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                                <input
                                    type="password" className="input-field" placeholder="비밀번호 입력"
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => setShowChangePw(true)}
                                >
                                    {adminRole === 'hr' ? '인사팀 비밀번호 변경' : '관리자 비밀번호 변경'}
                                </button>
                            </div>
                        </>
                    )}

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', margin: '1rem 0', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
                        {loginType === 'staff' ? '평가 시작하기' : '로그인'}
                    </button>
                </form>

                {/* Change Password Modal */}
                {showChangePw && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '350px', background: 'white' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>{adminRole === 'hr' ? '인사팀 비밀번호 변경' : '관리자 비밀번호 변경'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="현재 비밀번호"
                                    value={currentPwInput}
                                    onChange={(e) => setCurrentPwInput(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="새 비밀번호 (4자리 이상)"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button className="btn btn-outline" onClick={() => { setShowChangePw(false); setCurrentPwInput(''); setNewPw(''); }}>취소</button>
                                <button className="btn btn-primary" onClick={handleChangePassword}>변경하기</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
