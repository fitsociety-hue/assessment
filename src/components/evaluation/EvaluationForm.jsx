import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EvaluationForm() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="container">
            <div className="card">
                <h1>근무평정 시스템</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    <div><strong>성명:</strong> 홍길동</div>
                    <div><strong>부서:</strong> 운영지원팀</div>
                    <div><strong>직위:</strong> 선임</div>
                    <div><strong>평가기간:</strong> 2025년</div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
                    {['자가평가(본인)', '동료평가', '관리자평가'].map((tab, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            style={{
                                padding: '1rem 2rem',
                                borderBottom: activeTab === idx ? '2px solid var(--primary-600)' : 'none',
                                color: activeTab === idx ? 'var(--primary-700)' : 'var(--text-sub)',
                                fontWeight: activeTab === idx ? '600' : '400',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content 1: Self Evaluation */}
                {activeTab === 0 && (
                    <form className="animate-fade-in">
                        {/* Section 1: Major Performance */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                1. 중요업무 추진내용 및 실적
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
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

                        {/* Section 2: Qualitative Questions */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                2. 자기개발 및 전문성 향상
                            </h3>
                            {[
                                "1. 2025년 중 복지관의 미션, 비전, 핵심가치 및 5대 사업목표 달성에 본인이 기여한 구체적 사례는?",
                                "2. 2025년 중 업무와 관련하여 이수한 외부교육, 연수, 자격취득 등?",
                                "3. 2025년 중 직무수행 시 가장 도전적이었던 과제와 이를 극복하기 위해 시도한 방법은?",
                                "4. 2026년 기관(팀)의 발전을 위하여 바라는 점과 건의하고 싶은 사항은?"
                            ].map((q, idx) => (
                                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{q}</label>
                                    <textarea className="input-field" rows="3"></textarea>
                                </div>
                            ))}
                        </section>

                        {/* Section 3: Satisfaction */}
                        <section style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                3. 근무 만족도
                            </h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>5. 2025년 근무부서(근무기간: N개월) 만족도는?</p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['아주 만족한다', '만족한다', '보통이다', '불만스럽다'].map(opt => (
                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                            <input type="radio" name="sat_dept" /> {opt}
                                        </label>
                                    ))}
                                </div>
                                <input className="input-field" type="text" placeholder="이유 (선택사항)" style={{ marginTop: '0.5rem' }} />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>6. 2025년 복지관 근무 만족도는?</p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['아주 만족한다', '만족한다', '보통이다', '불만스럽다'].map(opt => (
                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                            <input type="radio" name="sat_org" /> {opt}
                                        </label>
                                    ))}
                                </div>
                                <input className="input-field" type="text" placeholder="이유 (선택사항)" style={{ marginTop: '0.5rem' }} />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>7. 직무순환을 할 경우 희망부서와 관심직무는?</p>
                                <input className="input-field" type="text" placeholder="1순위" style={{ marginBottom: '0.5rem' }} />
                                <input className="input-field" type="text" placeholder="2순위" />
                            </div>
                        </section>

                        <div style={{ textAlign: 'right' }}>
                            <button type="button" className="btn btn-primary" onClick={() => alert('자가보고서가 저장되었습니다.')}>
                                자가보고서 제출하기
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab Content 2: Peer Evaluation */}
                {activeTab === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>동료 평가 (Peer Review)</h3>
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
                            <button type="button" className="btn btn-primary" onClick={() => alert('동료 평가가 저장되었습니다.')}>
                                평가 제출하기
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab Content 3: Manager Evaluation */}
                {activeTab === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>관리자 평가 (Manager Review)</h3>
                        <p className="text-sub" style={{ marginBottom: '2rem' }}>팀원의 성과와 역량을 종합적으로 평가해 주세요.</p>

                        {/* Simple List for Manager */}
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ color: 'var(--primary-700)' }}>종합 의견</h4>
                                <textarea className="input-field" rows="5" placeholder="해당 직원의 강점, 보완할 점, 종합적인 의견을 기술해 주세요."></textarea>
                            </div>

                            <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                <h4>종합 등급 산정</h4>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                    {['S (최우수)', 'A (우수)', 'B (보통)', 'C (미흡)', 'D (부족)'].map(grade => (
                                        <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                            <input type="radio" name="manager_grade" /> {grade}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                            <button type="button" className="btn btn-primary" onClick={() => alert('관리자 평가가 저장되었습니다.')}>
                                최종 평가 완료
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
