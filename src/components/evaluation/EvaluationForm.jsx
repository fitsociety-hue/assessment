import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { API } from '../../services/api';

export default function EvaluationForm() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(null); // Will set to first available tab
    const [currentUser, setCurrentUser] = useState(null);

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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div>
                                    <h4>1. 중요업무 추진내용 및 실적</h4>
                                    <textarea className="input-field" rows="6" placeholder="핵심 성과 위주로 구체적으로 작성해 주세요."></textarea>
                                </div>
                                <div>
                                    <h4>2. 성공 및 실패 사례 분석</h4>
                                    <textarea className="input-field" rows="6" placeholder="성공 요인과 실패 원인을 분석하여 작성해 주세요."></textarea>
                                </div>
                                <div>
                                    <h4>3. 향후 역량 개발 계획</h4>
                                    <textarea className="input-field" rows="6" placeholder="전문성 향상을 위한 구체적인 계획을 작성해 주세요."></textarea>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    if (confirm('보고서를 저장하시겠습니까?')) {
                                        const res = await API.saveEvaluation({
                                            type: 'self_analysis',
                                            evaluator: currentUser.name,
                                            uid: currentUser.id || currentUser.name, // Use ID if available
                                            data: {
                                                content1: document.querySelector('textarea[placeholder*="핵심 성과"]').value,
                                                content2: document.querySelector('textarea[placeholder*="성공 요인"]').value,
                                                content3: document.querySelector('textarea[placeholder*="전문성 향상"]').value
                                            }
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
                                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
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
                                            {[1, 2, 3].map((row) => (
                                                <tr key={row} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: '0.5rem' }}><input className="input-field" type="text" /></td>
                                                    <td style={{ padding: '0.5rem' }}><input className="input-field" type="text" /></td>
                                                    <td style={{ padding: '0.5rem' }}><input className="input-field" type="text" style={{ textAlign: 'center' }} /></td>
                                                    <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" style={{ textAlign: 'center' }} /></td>
                                                    <td style={{ padding: '0.5rem' }}><input className="input-field" type="text" placeholder="00월~00월" style={{ textAlign: 'center' }} /></td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        <select className="input-field" style={{ padding: '0.5rem' }}>
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
                                            data: { score: 85 } // Mock score collection for demo
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
                                {currentUser.role === 'member'
                                    ? '소속 팀장 또는 사무국장의 리더십과 역량을 평가해 주세요.'
                                    : '팀장의 리더십과 중간 관리자로서의 역량을 평가해 주세요.'}
                            </p>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>평가 항목</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', width: '300px' }}>척도 (5점 만점)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { cat: '리더십', q: '부서의 비전을 명확히 제시하고 이끌어간다.' },
                                        { cat: '의사소통', q: '부서원의 의견을 경청하고 합리적으로 의사결정한다.' },
                                        { cat: '직무지원', q: '부서원의 업무 수행을 적극적으로 지원하고 지도한다.' }
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
                                                            <input type="radio" name={`mgr_q${i}`} value={score} /> {score}
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
                                    const res = await API.saveEvaluation({ type: 'manager_eval', evaluator: currentUser.name, target: 'Manager' });
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

                            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                                <p>평가 대상자의 직무 수행 성과 및 태도에 대한 종합 등급을 산정해 주십시오.</p>
                                <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginTop: '1rem', background: 'white' }}>
                                    <h4>종합 등급 산정</h4>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', justifyContent: 'center' }}>
                                        {['S (최우수)', 'A (우수)', 'B (보통)', 'C (미흡)', 'D (부족)'].map(grade => (
                                            <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                                <input type="radio" name="subordinate_grade" /> {grade}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                    <button type="button" className="btn btn-primary" onClick={async () => {
                                        const res = await API.saveEvaluation({ type: 'subordinate_eval', evaluator: currentUser.name, target: 'Subordinate' });
                                        if (res.success) alert('종사자 평가 저장 완료');
                                    }}>
                                        평가 제출 (DB)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
