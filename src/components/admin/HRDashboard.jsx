import React, { useState } from 'react';
import { Users, BarChart3, FileText, Download } from 'lucide-react';

export default function HRDashboard() {
    // Mock Data for HR View (Read Only)
    const stats = {
        total: 120,
        completed: 45,
        progress: 37
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
                <h3>부서별 최종 등급 현황</h3>
                <p className="text-sub">각 부서의 평가 등급 분포 현황입니다.</p>

                {/* Visual Placeholder for HR Analytics */}
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
                    <p>부서별 S/A/B/C/D 등급 분포 차트</p>
                    <p style={{ fontSize: '0.8rem' }}>(데이터가 취합되면 표시됩니다)</p>
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
