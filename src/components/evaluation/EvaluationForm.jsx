import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { API } from '../../services/api';
import { DataEngine } from '../../utils/dataEngine';
import { Upload, Download } from 'lucide-react';

export default function EvaluationForm() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(null); // Will set to first available tab

    const [currentUser, setCurrentUser] = useState(null);

    // Form States
    const [selfAnalysis, setSelfAnalysis] = useState({ content1: '', content2: '', content3: '' });
    const [selfEvalRows, setSelfEvalRows] = useState([
        { id: 1, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5' },
        { id: 2, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5' },
        { id: 3, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5' }
    ]);
    const [managerEvalScores, setManagerEvalScores] = useState({});
    const [managerEvalOpinion, setManagerEvalOpinion] = useState({ strength: '', weakness: '', support: '', thanks: '' });
    const [workerEvalScores, setWorkerEvalScores] = useState({});
    const [workerEvalOpinion, setWorkerEvalOpinion] = useState({ strength: '', weakness: '', training: '', placement: '' });

    // Constants for Questions
    const MANAGER_EVAL_ITEMS = [
        { id: 1, cat: '직무수행태도', q: '근태관리: 출퇴근 시간을 준수하고 근무시간에 업무에 집중하는가?' },
        { id: 2, cat: '직무수행태도', q: '조직가치: 기관의 미션, 비전, 인재상을 이해하고 실천하기 위해 노력하는가?' },
        { id: 3, cat: '직무수행태도', q: '협조성: 타 팀과의 업무협조가 원활하고 전체 조직 관점에서 협력하는가?' },
        { id: 4, cat: '직무수행태도', q: '책임감: 팀의 업무와 성과에 대해 책임감을 가지고 완수하는가?' },
        { id: 5, cat: '직무수행태도', q: '자기개발: 관리자로서 전문성 향상을 위해 지속적으로 자기개발에 힘쓰는가?' },
        { id: 6, cat: '직무수행능력', q: '전문성: 담당 업무 분야의 전문지식과 기술을 충분히 보유하고 있는가?' },
        { id: 7, cat: '직무수행능력', q: '업무추진력: 업무 추진과정에서 우선순위를 정하고 장애요소를 극복하며 신속히 처리하는가?' },
        { id: 8, cat: '직무수행능력', q: '자원개발: 인적·물적 자원개발에 적극적으로 노력하고 성과를 창출하는가?' },
        { id: 9, cat: '직무수행능력', q: '보고체계: 업무 수행과정과 결과를 상급자에게 적절하게 보고하는가?' },
        { id: 10, cat: '직무수행능력', q: '업무이해: 기관 방침과 업무방향을 정확하게 이해하고 판단하는가?' },
        { id: 11, cat: '직무수행능력', q: '기록능력: 객관적이고 체계적인 방법으로 업무를 기록·관리하는가?' },
        { id: 12, cat: '직무수행능력', q: '적응력: 새로운 업무 및 변화하는 상황에 순발력 있게 적응하고 대처하는가?' },
        { id: 13, cat: '리더십', q: '소통능력: 팀원의 의견을 경청하고 효과적으로 소통하는가?' },
        { id: 14, cat: '리더십', q: '업무지도: 업무수행에 필요한 조언과 슈퍼비전을 적절히 제공하는가?' },
        { id: 15, cat: '리더십', q: '업무배분: 업무를 공정하고 효율적으로 배분하며 적절히 관리하는가?' },
        { id: 16, cat: '리더십', q: '팀 분위기: 팀의 긍정적이고 협력적인 분위기 조성을 위해 노력하는가?' },
        { id: 17, cat: '근무실적', q: '목표달성: 팀의 업무목표를 효과적으로 달성했는가?' },
        { id: 18, cat: '근무실적', q: '예산관리: 팀의 예산을 효율적으로 관리하고 집행했는가?' },
        { id: 19, cat: '근무실적', q: '기한준수: 보고서 등 제출기한을 철저히 준수했는가?' },
        { id: 20, cat: '근무실적', q: '혁신노력: 신규 프로그램 개발이나 업무개선을 위해 적극 노력했는가?' }
    ];

    const WORKER_EVAL_ITEMS = [
        { id: 1, cat: '직무수행태도', q: '성실성: 지각, 근무시간 엄수, 근무시간 집중 등 근태관리가 성실한가?' },
        { id: 2, cat: '직무수행태도', q: '조직이해: 기관의 미션과 비전을 이해하고 인재상에 부합되도록 노력하는가?' },
        { id: 3, cat: '직무수행태도', q: '협조성: 팀 내 원활한 업무협조가 이루어지며 타 팀과도 적극 협력하는가?' },
        { id: 4, cat: '직무수행태도', q: '책임감: 주어진 사항에 대해 끝까지 책임감 있게 처리하여 완수하는가?' },
        { id: 5, cat: '직무수행태도', q: '자기개발: 업무의 질적 향상을 위해 자기개발에 노력하고 업무에 반영하는가?' },
        { id: 6, cat: '직무수행능력', q: '전문성: 업무 수행에 필요한 전문지식 및 기술을 충분히 보유하고 활용하는가?' },
        { id: 7, cat: '직무수행능력', q: '업무추진력: 업무 추진과정에서 장애요소를 극복하고 우선순위에 따라 실행하는가?' },
        { id: 8, cat: '직무수행능력', q: '자원개발: 지역사회 인·물적 자원을 개발하고 활용하며 연계하는가?' },
        { id: 9, cat: '직무수행능력', q: '보고능력: 업무수행 과정과 결과를 적절하게 보고하는가?' },
        { id: 10, cat: '직무수행능력', q: '업무이해: 기관방침이나 업무방향을 정확하게 이해하고 판단하는가?' },
        { id: 11, cat: '직무수행능력', q: '기록관리: 객관적이고 체계적인 방법으로 업무를 기록하는 기술능력이 우수한가?' },
        { id: 12, cat: '직무수행능력', q: '적응력: 새로운 업무 및 변화하는 상황에 무리 없이 순발력 있게 적응하는가?' },
        { id: 13, cat: '직무수행능력', q: '문제해결: 문제 발생 시 원인을 분석하고 적절한 해결방안을 제시하는가?' },
        { id: 14, cat: '근무실적', q: '업무실적: 업무실적 및 사업실적이 현저한 성과가 있는가?' },
        { id: 15, cat: '근무실적', q: '예산집행: 계획한 예산을 효율적으로 사용하는가?' },
        { id: 16, cat: '근무실적', q: '기한준수: 정해진 기한 내에 문서와 보고서를 제출하는가?' },
        { id: 17, cat: '근무실적', q: '혁신노력: 신규 프로그램 개발과 업무개선을 적극 제안하고 성과가 있는가?' },
        { id: 18, cat: '서비스품질', q: '이용자 만족: 장애인 및 지역주민 이용자의 만족도가 높은가?' },
        { id: 19, cat: '서비스품질', q: '친절성: 이용자를 존중하고 친절하게 응대하는가?' },
        { id: 20, cat: '서비스품질', q: '윤리성: 사회복지사 윤리강령을 준수하고 인권을 존중하는가?' }
    ];

    // CSV for Manager Eval
    const handleManagerEvalCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                const newScores = {};
                data.forEach(row => {
                    const id = parseInt(row['번호'] || row['No']);
                    const score = parseInt(row['점수'] || row['Score']);
                    if (id && score) newScores[id] = score;
                });
                setManagerEvalScores(newScores);
                alert('관리자 평가 점수가 로드되었습니다.');
            }
        } catch (err) { alert('CSV 파싱 오류'); }
    };

    const downloadManagerTemplate = () => {
        const data = MANAGER_EVAL_ITEMS.map(i => ({ '번호': i.id, '평가항목': i.q, '점수': '' }));
        DataEngine.exportCSV(data, '관리자평가_템플릿.csv');
    };

    // CSV for Worker Eval
    const handleWorkerEvalCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                const newScores = {};
                data.forEach(row => {
                    const id = parseInt(row['번호'] || row['No']);
                    const score = parseInt(row['점수'] || row['Score']);
                    if (id && score) newScores[id] = score;
                });
                setWorkerEvalScores(newScores);
                alert('종사자 평가 점수가 로드되었습니다.');
            }
        } catch (err) { alert('CSV 파싱 오류'); }
    };

    const downloadWorkerTemplate = () => {
        const data = WORKER_EVAL_ITEMS.map(i => ({ '번호': i.id, '평가항목': i.q, '점수': '' }));
        DataEngine.exportCSV(data, '종사자평가_템플릿.csv');
    };

    // CSV Handlers
    const handleSelfAnalysisCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                // Expecting CSV with headers: Question, Answer OR just mapping rows
                // Let's assume a simple format or mapping by index
                setSelfAnalysis({
                    content1: data[0]?.Answer || data[0]?.content1 || '',
                    content2: data[1]?.Answer || data[1]?.content2 || '',
                    content3: data[2]?.Answer || data[2]?.content3 || ''
                });
                alert('자기분석 보고서 데이터가 로드되었습니다.');
            }
        } catch (err) {
            alert('CSV 파싱 오류');
        }
    };

    const downloadSelfAnalysisTemplate = () => {
        const data = [
            { Question: '1. 중요업무 추진내용 및 실적', Answer: '내용을 입력하세요' },
            { Question: '2. 성공 및 실패 사례 분석', Answer: '내용을 입력하세요' },
            { Question: '3. 향후 역량 개발 계획', Answer: '내용을 입력하세요' }
        ];
        DataEngine.exportCSV(data, '자기분석보고서_템플릿.csv');
    };

    const handleSelfEvalCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                // Map CSV fields to state
                const newRows = data.map((row, idx) => ({
                    id: idx + 1,
                    name: row['사업명'] || '',
                    content: row['사업내용'] || '',
                    goal: row['목표'] || '',
                    achievement: row['달성도'] || '',
                    period: row['사업기간'] || '',
                    satisfaction: row['자기만족도'] || '5'
                }));
                setSelfEvalRows(newRows);
                alert('본인평가 데이터가 로드되었습니다.');
            }
        } catch (err) {
            alert('CSV 파싱 오류');
        }
    };

    const downloadSelfEvalTemplate = () => {
        const data = [
            { '사업명': '', '사업내용': '', '목표': '', '달성도': '', '사업기간': '', '자기만족도': '' }
        ];
        DataEngine.exportCSV(data, '본인평가_실적_템플릿.csv');
    };

    // Initial Load & Role Check
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to parse user info from localStorage", e);
            }
        }
    }, []);

    // Role Visibility Logic
    const getTabsForRole = (role) => {
        if (!role) return [];

        // Tab Definitions
        const TAB_SELF_ANALYSIS = { id: 0, label: '자기분석 보고서' };
        const TAB_SELF_EVAL = { id: 1, label: '본인평가' };
        // "Manager Eval" = Evaluating Upper Level (or specific target defined by user)
        // User Request: "관리자(팀장) 평가" -> Evaluating Team Leader
        const TAB_EVAL_LEADER = { id: 3, label: '관리자(팀장) 평가' };

        const TAB_PEER_EVAL = { id: 2, label: '동료평가' };

        // "Subordinate Eval" = Evaluating Lower Level
        // User Request: "종사자(팀원) 평가" -> Evaluating Team Member
        const TAB_EVAL_MEMBER = { id: 4, label: '종사자(팀원) 평가' };

        // 1. Team Leader (팀장)
        // Request: 자기분석 보고서, 본인평가, 종사자(팀원) 평가, 동료평가
        if (role === 'leader') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_EVAL_MEMBER, TAB_PEER_EVAL];

        // 2. Team Member (팀원)
        // Request: 자기분석 보고서, 본인평가, 관리자(팀장, 사무국장) 평가, 동료평가
        // Note: Label might need to be generic "Manager Eval" if they eval SecGen too.
        // Let's keep it as TAB_EVAL_LEADER but label it dynamically if needed, or just "관리자 평가"
        const TAB_EVAL_MANAGER_GENERIC = { id: 3, label: '관리자 평가' };
        if (role === 'member') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_EVAL_MANAGER_GENERIC, TAB_PEER_EVAL];

        // 3. Secretary General (사무국장)
        // Request: 자기분석 보고서, 본인평가, 관리자(팀장) 평가, 종사자(팀원) 평가
        if (role === 'secgen') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_EVAL_LEADER, TAB_EVAL_MEMBER];

        // 4. Director (관장)
        // Request: 본인 평가 없음, 관리자(팀장) 평가 진행
        if (role === 'director') return [TAB_EVAL_LEADER];

        return [];
    };

    const visibleTabs = currentUser ? getTabsForRole(currentUser.role) : [];

    // Set initial active tab
    useEffect(() => {
        if (visibleTabs.length > 0 && activeTab === null) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [visibleTabs, activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleExportPDF = async () => {
        const input = document.getElementById('evaluation-content');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('evaluation_report.pdf');
        } catch (err) {
            console.error('PDF Export Error:', err);
            alert('PDF 생성 중 오류가 발생했습니다.');
        }
    };

    if (!currentUser) {
        return <div className="container"><div className="loading">사용자 정보를 불러오는 중입니다...</div></div>;
    }

    return (
        <div className="container">
            <div className="card" id="evaluation-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1>근무평정 시스템</h1>
                    <button onClick={handleExportPDF} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        PDF 다운로드
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    <div><strong>성명:</strong> {currentUser.name || '홍길동'}</div>
                    <div><strong>부서:</strong> {currentUser.team || '운영지원팀'}</div>
                    <div><strong>직위:</strong> {currentUser.position || '팀원'}</div>
                    <div><strong>평가기간:</strong> 2025년</div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            style={{
                                padding: '1rem 1.5rem',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary-600)' : 'none',
                                color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--text-sub)',
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                    {visibleTabs.length === 0 && <div style={{ padding: '1rem', color: 'var(--text-sub)' }}>표시할 평가 항목이 없습니다.</div>}
                </div>

                <div className="animate-fade-in">

                    {/* Tab 0: Self Analysis Report */}
                    {activeTab === 0 && (
                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>자기분석 보고서</h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>지난 한 해 동안의 업무 수행 내용과 성과를 상세히 기술해 주세요.</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={downloadSelfAnalysisTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> 템플릿 다운로드
                                </button>
                                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <Upload size={16} /> CSV 업로드
                                    <input type="file" hidden accept=".csv" onChange={handleSelfAnalysisCSV} />
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <h4>1. 중요업무 추진내용 및 실적</h4>
                                    <textarea
                                        className="input-field"
                                        rows="6"
                                        placeholder="핵심 성과 위주로 구체적으로 작성해 주세요."
                                        value={selfAnalysis.content1}
                                        onChange={(e) => setSelfAnalysis({ ...selfAnalysis, content1: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <h4>2. 성공 및 실패 사례 분석</h4>
                                    <textarea
                                        className="input-field"
                                        rows="6"
                                        placeholder="성공 요인과 실패 원인을 분석하여 작성해 주세요."
                                        value={selfAnalysis.content2}
                                        onChange={(e) => setSelfAnalysis({ ...selfAnalysis, content2: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <h4>3. 향후 역량 개발 계획</h4>
                                    <textarea
                                        className="input-field"
                                        rows="6"
                                        placeholder="전문성 향상을 위한 구체적인 계획을 작성해 주세요."
                                        value={selfAnalysis.content3}
                                        onChange={(e) => setSelfAnalysis({ ...selfAnalysis, content3: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    if (confirm('보고서를 저장하시겠습니까?')) {
                                        const res = await API.saveEvaluation({
                                            type: 'self_analysis',
                                            evaluator: currentUser.name,
                                            uid: currentUser.id || currentUser.name, // Use ID if available
                                            data: selfAnalysis
                                        });
                                        if (res.success) alert('저장되었습니다.');
                                        else alert('저장 실패: ' + res.error);
                                    }
                                }}>
                                    보고서 저장 (DB)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 1: Self Evaluation */}
                    {activeTab === 1 && (
                        <form>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>본인 평가</h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>본인의 업무 성과와 역량을 객관적으로 평가해 주세요.</p>

                            <section style={{ marginBottom: '2.5rem' }}>
                                <h4>1. 중요업무 추진내용 및 실적</h4>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                    <button type="button" className="btn btn-outline" onClick={downloadSelfEvalTemplate} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Download size={14} /> 템플릿
                                    </button>
                                    <label className="btn btn-outline" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                        <Upload size={14} /> 업로드
                                        <input type="file" hidden accept=".csv" onChange={handleSelfEvalCSV} />
                                    </label>
                                </div>
                                <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-100)' }}>
                                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>사업명</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'left' }}>사업내용 (추진실적)</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center', width: '60px' }}>목표</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center', width: '80px' }}>달성도(%)</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center', width: '120px' }}>사업기간</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center', width: '100px' }}>자기만족도</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selfEvalRows.map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" type="text" value={row.name} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].name = e.target.value; setSelfEvalRows(newRows);
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" type="text" value={row.content} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].content = e.target.value; setSelfEvalRows(newRows);
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" type="text" value={row.goal} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].goal = e.target.value; setSelfEvalRows(newRows);
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" type="number" value={row.achievement} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].achievement = e.target.value; setSelfEvalRows(newRows);
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" type="text" placeholder="00월~00월" value={row.period} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].period = e.target.value; setSelfEvalRows(newRows);
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        <select className="input-field" value={row.satisfaction} style={{ padding: '0.5rem' }} onChange={(e) => {
                                                            const newRows = [...selfEvalRows]; newRows[idx].satisfaction = e.target.value; setSelfEvalRows(newRows);
                                                        }}>
                                                            <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    if (confirm('본인 평가를 제출하시겠습니까?')) {
                                        // Collect form data logic would go here
                                        const res = await API.saveEvaluation({
                                            type: 'self_eval',
                                            evaluator: currentUser.name,
                                            data: selfEvalRows
                                        });
                                        if (res.success) alert('제출되었습니다.');
                                        else alert('실패');
                                    }
                                }}>
                                    본인 평가 제출 (DB)
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Peer Evaluation */}
                    {activeTab === 2 && (
                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>동료 평가</h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>협업하는 동료의 직무 수행 태도와 능력을 객관적으로 평가해 주세요.</p>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>평가 항목</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', width: '300px' }}>척도 (5점 만점)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { cat: '직무태도', q: '조직가치: 기관의 미션과 비전을 이해하고 실천하려 노력한다.' },
                                        { cat: '직무태도', q: '협조성: 타 팀과의 업무협조가 원활하고 적극 협력한다.' },
                                        { cat: '직무능력', q: '전문성: 업무 수행에 필요한 전문 지식과 기술을 보유하고 있다.' },
                                        { cat: '직무능력', q: '소통역량: 동료의 의견을 경청하며 합리적인 결과를 도출한다.' },
                                        { cat: '근무실적', q: '협업기여: 팀 프로젝트나 협업 과제 수행 시 적극적으로 기여하는가?' }
                                    ].map((item, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--primary-600)', marginBottom: '0.3rem' }}>{item.cat}</div>
                                                <div>{item.q}</div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    {[5, 4, 3, 2, 1].map(score => (
                                                        <label key={score} style={{ background: 'white', border: '1px solid var(--border-light)', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <input type="radio" name={`peer_q${i}`} value={score} /> {score}
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    const res = await API.saveEvaluation({ type: 'peer_eval', evaluator: currentUser.name, target: 'Peer' });
                                    if (res.success) alert('동료 평가 저장 완료');
                                }}>
                                    평가 제출 (DB)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Manager Evaluation */}
                    {activeTab === 3 && (
                        <div>

                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                {currentUser.role === 'member' ? '관리자(상급자) 평가' : '관리자(팀장) 평가'}
                            </h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>
                                소속 팀장 또는 사무국장의 리더십과 역량을 평가해 주세요.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={downloadManagerTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> 템플릿
                                </button>
                                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <Upload size={16} /> CSV 업로드
                                    <input type="file" hidden accept=".csv" onChange={handleManagerEvalCSV} />
                                </label>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '50px' }}>No</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '80px' }}>구분</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>평가 내용</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '250px' }}>평가 (5점)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MANAGER_EVAL_ITEMS.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.id}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-600)' }}>{item.cat}</td>
                                            <td style={{ padding: '0.8rem' }}>{item.q.split(':')[1]}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                    {[5, 4, 3, 2, 1].map(score => (
                                                        <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: managerEvalScores[item.id] === score ? 'var(--primary-600)' : 'white', color: managerEvalScores[item.id] === score ? 'white' : 'black' }}>
                                                            <input
                                                                type="radio"
                                                                name={`mgr_${item.id}`}
                                                                checked={managerEvalScores[item.id] === score}
                                                                onChange={() => setManagerEvalScores({ ...managerEvalScores, [item.id]: score })}
                                                                style={{ display: 'none' }}
                                                            />
                                                            {score}
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '1rem' }}>종합의견 및 제안</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>관리자로서 가장 우수한 점</label>
                                        <textarea className="input-field" rows="3" value={managerEvalOpinion.strength} onChange={e => setManagerEvalOpinion({ ...managerEvalOpinion, strength: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>개선이 필요한 부분</label>
                                        <textarea className="input-field" rows="3" value={managerEvalOpinion.weakness} onChange={e => setManagerEvalOpinion({ ...managerEvalOpinion, weakness: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>관리자에게 바라는 지원</label>
                                        <textarea className="input-field" rows="3" value={managerEvalOpinion.support} onChange={e => setManagerEvalOpinion({ ...managerEvalOpinion, support: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>관리자에게 감사한 점</label>
                                        <textarea className="input-field" rows="3" value={managerEvalOpinion.thanks} onChange={e => setManagerEvalOpinion({ ...managerEvalOpinion, thanks: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    const res = await API.saveEvaluation({
                                        type: 'manager_eval',
                                        evaluator: currentUser.name,
                                        target: 'Manager',
                                        data: { scores: managerEvalScores, opinion: managerEvalOpinion }
                                    });
                                    if (res.success) alert('관리자 평가 저장 완료');
                                }}>
                                    평가 제출 (DB)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Subordinate Evaluation */}
                    {activeTab === 4 && (
                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>종사자(하급자) 평가</h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>하급자의 직무 수행 능력과 태도를 평가해 주세요.</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={downloadWorkerTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> 템플릿
                                </button>
                                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <Upload size={16} /> CSV 업로드
                                    <input type="file" hidden accept=".csv" onChange={handleWorkerEvalCSV} />
                                </label>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '50px' }}>No</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '80px' }}>구분</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>평가 내용</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '250px' }}>평가 (5점)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {WORKER_EVAL_ITEMS.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.id}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-600)' }}>{item.cat}</td>
                                            <td style={{ padding: '0.8rem' }}>{item.q.split(':')[1]}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                    {[5, 4, 3, 2, 1].map(score => (
                                                        <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: workerEvalScores[item.id] === score ? 'var(--primary-600)' : 'white', color: workerEvalScores[item.id] === score ? 'white' : 'black' }}>
                                                            <input
                                                                type="radio"
                                                                name={`wkr_${item.id}`}
                                                                checked={workerEvalScores[item.id] === score}
                                                                onChange={() => setWorkerEvalScores({ ...workerEvalScores, [item.id]: score })}
                                                                style={{ display: 'none' }}
                                                            />
                                                            {score}
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '1rem' }}>종합의견 및 제안</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>직원의 주요 강점 및 우수한 점</label>
                                        <textarea className="input-field" rows="3" value={workerEvalOpinion.strength} onChange={e => setWorkerEvalOpinion({ ...workerEvalOpinion, strength: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>개선이 필요한 부분 및 발전방향</label>
                                        <textarea className="input-field" rows="3" value={workerEvalOpinion.weakness} onChange={e => setWorkerEvalOpinion({ ...workerEvalOpinion, weakness: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>향후 교육·훈련 필요사항</label>
                                        <textarea className="input-field" rows="3" value={workerEvalOpinion.training} onChange={e => setWorkerEvalOpinion({ ...workerEvalOpinion, training: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>적합한 업무 및 배치 의견</label>
                                        <textarea className="input-field" rows="3" value={workerEvalOpinion.placement} onChange={e => setWorkerEvalOpinion({ ...workerEvalOpinion, placement: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    const res = await API.saveEvaluation({
                                        type: 'subordinate_eval',
                                        evaluator: currentUser.name,
                                        target: 'Subordinate',
                                        data: { scores: workerEvalScores, opinion: workerEvalOpinion }
                                    });
                                    if (res.success) alert('종사자 평가 저장 완료');
                                }}>
                                    평가 제출 (DB)
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
