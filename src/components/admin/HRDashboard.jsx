import React, { useState } from 'react';
import { Users, BarChart3, FileText, Download } from 'lucide-react';

export default function HRDashboard() {
    // Mock Data for HR View (Read Only)
    // Load Stats from LocalStorage (Shared with Admin Dashboard)
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        progress: 0
    });
    const [results, setResults] = useState([]);

    React.useEffect(() => {
        const storedStats = localStorage.getItem('dashboardStats');
        if (storedStats) {
            try {
                const parsed = JSON.parse(storedStats);
                setStats({
                    total: parsed.totalUsers || 0,
                    completed: parsed.completedCount || 0,
                    progress: parsed.completedRatio || 0
                });
            } catch (e) { }
        }

        const storedResults = localStorage.getItem('evaluationResults');
        if (storedResults) {
            try {
                const parsed = JSON.parse(storedResults);
                if (Array.isArray(parsed)) setResults(parsed);
            } catch (e) { }
        }
    }, []);

    const calculateGrade = (score) => {
        const s = parseFloat(score);
        if (s >= 95) return 'S';
        if (s >= 85) return 'A';
        if (s >= 75) return 'B';
        if (s >= 65) return 'C';
        return 'D';
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'S': return '#8b5cf6';
            case 'A': return '#3b82f6';
            case 'B': return '#10b981';
            case 'C': return '#f59e0b';
            case 'D': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    return (
        <div className="dashboard-grid animate-fade-in">
            <div className="card" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>인사담당자 대시보드</h2>
                        <p className="text-sub">2025년 근무평정 진행 현황 (최종 결과 조회 전용)</p>
                    </div>
                    <button className="btn btn-outline" onClick={() => alert('최종 결과 보고서가 다운로드됩니다.')}>
                        <Download size={16} style={{ marginRight: '0.5rem' }} /> 결과 보고서 다운로드
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label="전체 대상자"
                        value={stats.total}
                        sub="명"
                    />
                    <StatCard
                        icon={<FileText className="text-teal-500" />}
                        label="평가 완료"
                        value={stats.completed}
                        sub="건"
                    />
                    <StatCard
                        icon={<BarChart3 className="text-indigo-500" />}
                        label="진행률"
                        value={`${stats.progress}%`}
                        sub="전체 평균"
                    />
                </div>
            </div>

            <div className="card" style={{ minHeight: '400px', gridColumn: '1 / -1' }}>
                <h3>최종 평가 결과 (인사팀 조회용)</h3>
                <p className="text-sub">각 직원의 최종 점수와 등급만 표시됩니다. 상세 평가 내역은 보호됩니다.</p>

                {results.length > 0 ? (
                    <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-light)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>이름</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>부서</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>총점</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>최종 등급</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '1rem' }}>{row.이름 || row.Name || row.name}</td>
                                        <td style={{ padding: '1rem' }}>{row.부서 || row.Team || row.team}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{row.totalScore}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                                                background: getGradeColor(row.grade || calculateGrade(row.totalScore)),
                                                color: 'white'
                                            }}>
                                                {row.grade || calculateGrade(row.totalScore)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{
                        marginTop: '2rem',
                        height: '300px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'var(--text-sub)'
                    }}>
                        <BarChart3 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>현재 확정된 평가 결과가 없습니다.</p>
                        <p style={{ fontSize: '0.8rem' }}>(관리자가 결과 처리를 완료하면 여기에 표시됩니다)</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }) {
    return (
        <div style={{ padding: '1.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                {label}
                {icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{sub}</div>
        </div>
    );
}
