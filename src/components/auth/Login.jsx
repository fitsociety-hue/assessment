import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Users } from 'lucide-react';

export default function Login({ onLogin }) {
    const [loginType, setLoginType] = useState('staff'); // 'staff' or 'admin'

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

    // Mock Database for Password (In a real app, this would be a backend)
    const [storedPassword, setStoredPassword] = useState('0741');
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);
    const [newPw, setNewPw] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (loginType === 'staff') {
            if (!staffInfo.name || !staffInfo.team) {
                setError('이름과 부서를 입력해주세요.');
                return;
            }
            // Pass full staff info as the user object
            onLogin({ ...staffInfo, role: mapPositionToRole(staffInfo.position) });
            navigate('/eval/dashboard'); // Redirect to personal evaluation dashboard (New Route)
        } else {
            // Admin/HR Logic
            if (adminRole === 'admin') {
                if (password === storedPassword) {
                    onLogin({ role: 'admin', name: '관리자' });
                    navigate('/admin');
                } else {
                    setError('비밀번호가 올바르지 않습니다.');
                }
            } else if (adminRole === 'hr') {
                onLogin({ role: 'hr', name: '인사담당자' });
                navigate('/hr');
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
        if (newPw.length < 4) {
            alert('비밀번호는 4자리 이상이어야 합니다.');
            return;
        }
        setStoredPassword(newPw);
        setIsPasswordChanged(true);
        setShowChangePw(false);
        setNewPw('');
        alert('비밀번호가 변경되었습니다. 새로운 비밀번호로 로그인해주세요.');
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
                            <select
                                className="input-field"
                                value={staffInfo.position}
                                onChange={e => setStaffInfo({ ...staffInfo, position: e.target.value })}
                            >
                                <option value="팀원">팀원 (사회복지사 등)</option>
                                <option value="팀장">팀장</option>
                                <option value="사무국장">사무국장</option>
                                <option value="관장">관장</option>
                            </select>
                            <input
                                className="input-field" placeholder="직군 (예: 사회복지사)"
                                value={staffInfo.jobGroup} onChange={e => setStaffInfo({ ...staffInfo, jobGroup: e.target.value })}
                            />
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.5rem' }}>
                                * 본인의 인사 정보를 정확히 입력해 주세요.
                            </div>
                        </div>
                    )}

                    {loginType === 'admin' && (
                        <>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                                <button type="button" className={`btn ${adminRole === 'admin' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAdminRole('admin')} style={{ flex: 1 }}>
                                    <User size={18} style={{ marginRight: '0.5rem' }} /> 관리자
                                </button>
                                <button type="button" className={`btn ${adminRole === 'hr' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAdminRole('hr')} style={{ flex: 1 }}>
                                    <Users size={18} style={{ marginRight: '0.5rem' }} /> 인사팀
                                </button>
                            </div>

                            {adminRole === 'admin' && (
                                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                                    <input
                                        type="password" className="input-field" placeholder="비밀번호 입력"
                                        style={{ paddingLeft: '2.8rem' }}
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            )}
                            {adminRole === 'admin' && (
                                <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
                                    <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => setShowChangePw(true)}
                                    >
                                        비밀번호 변경
                                    </button>
                                </div>
                            )}
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
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div className="card" style={{ width: '300px' }}>
                            <h3>비밀번호 변경</h3>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="새 비밀번호"
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)}
                                style={{ margin: '1rem 0' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={() => setShowChangePw(false)}>취소</button>
                                <button className="btn btn-primary" onClick={handleChangePassword}>변경</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
