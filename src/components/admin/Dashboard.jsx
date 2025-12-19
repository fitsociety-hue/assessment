import React, { useState } from 'react';
import { Upload, Users, BarChart3, AlertCircle, FileText, Settings } from 'lucide-react';
import { DataEngine } from '../../utils/dataEngine';
import { API } from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        progress: 0
    });

    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [uploadType, setUploadType] = useState('employee'); // 'employee' or 'result'
    const [analysisResults, setAnalysisResults] = useState(null);

    // Load Stats from DB on Mount
    React.useEffect(() => {
        const loadStats = async () => {
            const employees = await API.fetchEmployees();
            if (employees && Array.isArray(employees)) {
                // Calculate real stats from DB data
                const total = employees.length;
                setStats({
                    total: total,
                    completed: 0, // Need API to fetch evaluation status
                    progress: 0
                });
            }
        };
        loadStats();
    }, []);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        setUploadType(type);
        if (file) {
            try {
                const data = await DataEngine.parseCSV(file);
                setPreviewData(data); // Store for preview
                setShowPreview(true); // Open Modal
                e.target.value = ''; // Reset input
            } catch (err) {
                alert('CSV 파일 처리 중 오류가 발생했습니다.');
            }
        }
    };

    // Confirm Upload & Sync to DB
    const handleConfirmUpload = async () => {
        alert('처리 중입니다... 잠시만 기다려주세요.');

        if (uploadType === 'employee') {
            // Sync Employee List to Google Sheet
            const res = await API.syncEmployees(previewData);
            if (res.success) {
                setStats(prev => ({ ...prev, total: previewData.length }));
                setShowPreview(false);
                alert(`${previewData.length}명의 직원 데이터가 성공적으로 동기화되었습니다.`);
            } else {
                alert('동기화 실패: ' + res.error);
            }
        } else {
            // Analyze Results
            const analyzedData = analyzeResults(previewData);
            setAnalysisResults(analyzedData);

            // Save to LocalStorage for HR Dashboard to view (Read-Only)
            localStorage.setItem('evaluationResults', JSON.stringify(analyzedData));

            // Update Stats for HR Dashboard
            const newStats = {
                total: stats.total,
                completed: analyzedData.length,
                completedRatio: Math.round((analyzedData.length / (stats.total || 1)) * 100)
            };
            setStats(newStats); // Update local state
            localStorage.setItem('dashboardStats', JSON.stringify({
                totalUsers: newStats.total,
                completedCount: newStats.completed,
                completedRatio: newStats.completedRatio
            }));

            // Sync Results to DB
            const res = await API.syncResults(analyzedData);
            if (res.success) {
                setShowPreview(false);
                alert('평가 결과 및 분석 내용이 동기화되었습니다.');
            } else {
                alert('결과 동기화 실패: ' + res.error);
            }
        }
    };

    const analyzeResults = (data) => {
        // Expected Columns: Name, Role, SelfScore, PeerScore, ManagerScore, SubordinateScore
        // Mock weights (should fetch from Config or use default)
        const weights = { self: 0.2, peer: 0.2, manager: 0.4, sub: 0.2 };

        return data.map(row => {
            const self = parseFloat(row.SelfScore) || 0;
            const peer = parseFloat(row.PeerScore) || 0;
            const mgr = parseFloat(row.ManagerScore) || 0;
            const sub = parseFloat(row.SubordinateScore) || 0;
            const total = (self * weights.self) + (peer * weights.peer) + (mgr * weights.manager) + (sub * weights.sub);
            return { ...row, totalScore: total.toFixed(1) };
        });
    };

    const handleDataChange = (idx, field, val) => {
        const newData = [...previewData];
        newData[idx][field] = val;
        setPreviewData(newData);
    };

    return (
        <div className="dashboard-grid animate-fade-in">
            <div className="card" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>관리자님, 안녕하세요.</h2>
                    <a href="#/admin/config" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                        <Settings size={18} /> 설정
                    </a>
                </div>
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
                        <input type="file" id="csvInput" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'employee')} accept=".csv" />
                        <label htmlFor="csvInput" style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                            <Upload className="text-sub" size={32} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontWeight: 600 }}>직원 명단 업로드</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>CSV 형식 지원</div>
                        </label>
                    </div>

                    <div className="card" style={{
                        border: '2px dashed var(--primary-200)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: '1rem',
                        background: 'var(--primary-50)'
                    }}>
                        <input type="file" id="resultInput" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'result')} accept=".csv" />
                        <label htmlFor="resultInput" style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                            <FileText className="text-primary-600" size={32} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontWeight: 600, color: 'var(--primary-700)' }}>평가 결과 업로드</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>점수 취합 CSV 분석</div>
                        </label>
                    </div>
                </div>

                {analysisResults && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <h3>📊 분석 결과 요약</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'white' }}>
                            <thead>
                                <tr style={{ background: 'var(--primary-100)' }}>
                                    <th style={{ padding: '0.5rem' }}>성명</th>
                                    <th style={{ padding: '0.5rem' }}>직위</th>
                                    <th style={{ padding: '0.5rem' }}>총점</th>
                                    <th style={{ padding: '0.5rem' }}>등급</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysisResults.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                        <td style={{ padding: '0.5rem' }}>{row.Name || row.name}</td>
                                        <td style={{ padding: '0.5rem' }}>{row.Role || row.role}</td>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{row.totalScore}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {row.totalScore >= 90 ? 'S' : row.totalScore >= 80 ? 'A' : 'B'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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

            {/* CSV Review Modal */}
            {showPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '80%', maxHeight: '80%', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                        <h3>데이터 검증 및 수정 ({uploadType === 'employee' ? '직원명부' : '평가결과'})</h3>
                        <p className="text-sub" style={{ marginBottom: '1rem' }}>업로드된 데이터를 검토하고 필요시 직접 수정하세요.</p>

                        <div style={{ overflow: 'auto', flex: 1, border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-input)' }}>
                                        {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                                            <th key={key} style={{ padding: '0.5rem' }}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 100).map((row, idx) => ( // Show first 100 for safety
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            {Object.keys(row).map(key => (
                                                <td key={key} style={{ padding: '0.3rem' }}>
                                                    <input className="input-field" value={row[key] || ''} onChange={(e) => handleDataChange(idx, key, e.target.value)} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowPreview(false)}>취소</button>
                            <button className="btn btn-primary" onClick={handleConfirmUpload}>
                                {uploadType === 'employee' ? 'DB 동기화' : '분석 실행'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
