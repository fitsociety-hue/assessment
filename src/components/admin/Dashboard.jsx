import React, { useState } from 'react';
import { Upload, Users, BarChart3, AlertCircle, FileText } from 'lucide-react';
import { DataEngine } from '../../utils/dataEngine';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 152, // Mock initial data
        completed: 89,
        progress: 58
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const data = await DataEngine.parseCSV(file);
                // Mock processing
                setStats({
                    total: data.length,
                    completed: 0,
                    progress: 0
                });
                alert(`${data.length}명의 직원 데이터가 로드되었습니다.`);
            } catch (err) {
                alert('CSV 파일 처리 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="dashboard-grid animate-fade-in">
            <div className="card" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <h2>관리자님, 안녕하세요.</h2>
                <p className="text-sub">2025년 근무평정 종합 현황입니다.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label="전체 대상자"
                        value={stats.total}
                        sub="평가 대상"
                    />
                    <StatCard
                        icon={<FileText className="text-teal-500" />}
                        label="평가 제출"
                        value={stats.completed}
                        sub="완료 건수"
                    />
                    <StatCard
                        icon={<BarChart3 className="text-indigo-500" />}
                        label="진행률"
                        value={`${stats.progress}%`}
                        sub="전체 평균"
                    />
                    <div className="card" style={{
                        border: '2px dashed var(--border-light)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: '1rem',
                        background: 'rgba(255,255,255,0.5)'
                    }}>
                        <input type="file" id="csvInput" style={{ display: 'none' }} onChange={handleFileUpload} accept=".csv" />
                        <label htmlFor="csvInput" style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                            <Upload className="text-sub" size={32} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontWeight: 600 }}>직원 명단 업로드</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>CSV 형식 지원</div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="card" style={{ minHeight: '400px' }}>
                <h3>부서별 현황</h3>
                <p className="text-sub">실시간 제출 현황 모니터링</p>
                {/* Placeholder for Charts */}
                <div style={{ background: 'var(--bg-input)', height: '200px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
                    차트 영역 (데이터 연동 시 활성화)
                </div>
            </div>

            <div className="card" style={{ minHeight: '400px' }}>
                <h3>주요 알림</h3>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1.5rem' }}>
                    <AlertItem type="weak" msg="미제출 인원 3명 (독촉 필요)" />
                    <AlertItem type="info" msg="운영지원팀: 평가 완료율 90% 달성" />
                    <AlertItem type="info" msg="사업1팀: 평가 완료율 85% 달성" />
                </div>
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

function AlertItem({ type, msg }) {
    const color = type === 'weak' ? '#ef4444' : '#3b82f6';
    return (
        <div style={{ padding: '1rem', borderLeft: `4px solid ${color}`, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={20} color={color} />
            <span>{msg}</span>
        </div>
    );
}
