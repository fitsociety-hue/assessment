
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, ChevronRight, UserCircle, Building2, Briefcase, User, UserPlus } from 'lucide-react';
import { API } from '../../services/api';

export default function Login({ onLogin }) {
    // Top Level Mode: 'staff' (Default) or 'admin'
    const [accessMode, setAccessMode] = useState('staff');

    // Staff Sub-Mode: 'login' or 'signup'
    const [staffMode, setStaffMode] = useState('login');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- Staff Login States ---
    const [loginInfo, setLoginInfo] = useState({ name: '', password: '' });

    // --- Staff Signup States ---
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        team: '',
        position: '팀원', // Default
        jobGroup: '',    // Text Input (e.g. 사회복지사)
        password: ''
    });

    // --- Admin States ---
    const [adminRole, setAdminRole] = useState('admin'); // 'admin' or 'hr'
    const [adminPwInput, setAdminPwInput] = useState('');

    // Mock Database for Passwords (Admin Only)
    const [adminPw, setAdminPw] = useState(() => localStorage.getItem('adminPassword') || '0000');
    const [hrPw, setHrPw] = useState(() => localStorage.getItem('hrPassword') || '0741');

    const [showChangePw, setShowChangePw] = useState(false);
    const [currentPwInput, setCurrentPwInput] = useState('');
    const [newPw, setNewPw] = useState('');

    // --- Handlers ---

    const mapPositionToRole = (pos) => {
        if (pos === '관장') return 'director';
        if (pos === '사무국장') return 'secgen';
        if (pos === '팀장') return 'leader';
        return 'member';
    };

    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!loginInfo.name || !loginInfo.password) {
            setError('이름과 비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        const res = await API.loginUser(loginInfo);
        setIsLoading(false);

        if (res.success && res.user) {
            // Success
            // Map role based on position
            const role = mapPositionToRole(res.user.position);
            onLogin({
                ...res.user,
                role: role
            });
            navigate('/eval/dashboard');
        } else {
            setError(res.message || '로그인에 실패했습니다.');
        }
    };

    const handleStaffSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!signupInfo.name || !signupInfo.team || !signupInfo.password || !signupInfo.jobGroup) {
            setError('모든 항목을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        const res = await API.registerUser(signupInfo);
        setIsLoading(false);

        if (res.success) {
            alert('회원가입이 완료되었습니다.\n로그인 화면으로 이동합니다.');
            setStaffMode('login');
            // Pre-fill name for convenience
            setLoginInfo({ name: signupInfo.name, password: '' });
        } else {
            setError(res.message || '회원가입에 실패했습니다.');
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        setError('');
        const targetPw = adminRole === 'admin' ? adminPw : hrPw;

        if (adminPwInput === targetPw) {
            onLogin({ role: adminRole, name: adminRole === 'admin' ? '관리자' : '인사담당자' });
            navigate(adminRole === 'admin' ? '/admin' : '/hr');
        } else {
            setError('비밀번호가 올바르지 않습니다.');
        }
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

                {/* Top Level Tabs: Staff vs Admin */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
                    <button
                        style={{ flex: 1, padding: '1rem', borderBottom: accessMode === 'staff' ? '2px solid var(--primary-600)' : 'none', fontWeight: accessMode === 'staff' ? 700 : 400, color: accessMode === 'staff' ? 'var(--primary-700)' : 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setAccessMode('staff')}
                    >
                        직원 접속
                    </button>
                    <button
                        style={{ flex: 1, padding: '1rem', borderBottom: accessMode === 'admin' ? '2px solid var(--primary-600)' : 'none', fontWeight: accessMode === 'admin' ? 700 : 400, color: accessMode === 'admin' ? 'var(--primary-700)' : 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setAccessMode('admin')}
                    >
                        관리자 접속
                    </button>
                </div>

                {/* STAFF MODE */}
                {accessMode === 'staff' && (
                    <>
                        {/* Sub Tabs: Login vs Signup */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            <button
                                className={`btn ${staffMode === 'login' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setStaffMode('login'); setError(''); }}
                                style={{ flex: 1 }}
                            >
                                로그인
                            </button>
                            <button
                                className={`btn ${staffMode === 'signup' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setStaffMode('signup'); setError(''); }}
                                style={{ flex: 1 }}
                            >
                                회원가입
                            </button>
                        </div>

                        {staffMode === 'login' && (
                            <form onSubmit={handleStaffLogin}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                                        <input
                                            className="input-field" placeholder="이름 (예: 홍길동)"
                                            style={{ paddingLeft: '2.8rem' }}
                                            value={loginInfo.name} onChange={e => setLoginInfo({ ...loginInfo, name: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                                        <input
                                            type="password"
                                            className="input-field" placeholder="비밀번호"
                                            style={{ paddingLeft: '2.8rem' }}
                                            value={loginInfo.password} onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', margin: '1rem 0', textAlign: 'center' }}>{error}</div>}
                                <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
                                    {isLoading ? '확인 중...' : '평가 시작하기'}
                                </button>
                            </form>
                        )}

                        {staffMode === 'signup' && (
                            <form onSubmit={handleStaffSignup}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input className="input-field" placeholder="이름 (예: 홍길동)" value={signupInfo.name} onChange={e => setSignupInfo({ ...signupInfo, name: e.target.value })} />
                                    <input className="input-field" placeholder="부서 (예: 전략기획팀)" value={signupInfo.team} onChange={e => setSignupInfo({ ...signupInfo, team: e.target.value })} />
                                    <select className="input-field" value={signupInfo.position} onChange={e => setSignupInfo({ ...signupInfo, position: e.target.value })}>
                                        <option value="팀원">팀원</option>
                                        <option value="팀장">팀장</option>
                                        <option value="사무국장">사무국장</option>
                                        <option value="관장">관장</option>
                                    </select>
                                    <input className="input-field" placeholder="직종 (예: 사회복지사)" value={signupInfo.jobGroup} onChange={e => setSignupInfo({ ...signupInfo, jobGroup: e.target.value })} />
                                    <input type="password" className="input-field" placeholder="비밀번호 설정" value={signupInfo.password} onChange={e => setSignupInfo({ ...signupInfo, password: e.target.value })} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.5rem' }}>
                                    * 기존 직원은 이름과 부서가 일치하면 자동으로 연동됩니다.
                                </div>
                                {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', margin: '1rem 0', textAlign: 'center' }}>{error}</div>}
                                <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
                                    {isLoading ? '처리 중...' : '가입하기'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {/* ADMIN MODE */}
                {accessMode === 'admin' && (
                    <form onSubmit={handleAdminLogin}>
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
                                value={adminPwInput} onChange={(e) => setAdminPwInput(e.target.value)}
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

                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', margin: '1rem 0', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}>
                            로그인
                        </button>
                    </form>
                )}

                {/* Change Password Modal (Admin) */}
                {showChangePw && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="card" style={{ width: '350px', background: 'white' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>{adminRole === 'hr' ? '인사 비밀번호 변경' : '관리자 비밀번호 변경'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="password" className="input-field" placeholder="현재 비밀번호" value={currentPwInput} onChange={(e) => setCurrentPwInput(e.target.value)} />
                                <input type="password" className="input-field" placeholder="새 비밀번호 (4자리 이상)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
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
