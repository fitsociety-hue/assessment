import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Users } from 'lucide-react';

export default function Login({ onLogin }) {
    const [role, setRole] = useState('admin'); // 'admin' or 'hr'
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

        if (role === 'admin') {
            if (password === storedPassword) {
                onLogin('admin');
                navigate('/admin');
            } else {
                setError('비밀번호가 올바르지 않습니다.');
            }
        } else if (role === 'hr') {
            // HR has no password for this demo, or simple check
            onLogin('hr');
            navigate('/hr');
        }
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
            <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-700)' }}>
                    {role === 'admin' ? '관리자 로그인' : '인사담당자 접속'}
                </h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button
                        className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setRole('admin')}
                        style={{ flex: 1 }}
                    >
                        <User size={18} style={{ marginRight: '0.5rem' }} /> 관리자
                    </button>
                    <button
                        className={`btn ${role === 'hr' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setRole('hr')}
                        style={{ flex: 1 }}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem' }} /> 인사팀
                    </button>
                </div>

                <form onSubmit={handleLogin}>
                    {role === 'admin' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="비밀번호 입력"
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                        로그인
                    </button>
                </form>

                {role === 'admin' && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setShowChangePw(true)}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                )}
            </div>

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
    );
}
