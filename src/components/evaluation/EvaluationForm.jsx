import React from 'react';
import { useParams } from 'react-router-dom';

export default function EvaluationForm() {
    const { id } = useParams();

    return (
        <div className="container">
            <div className="card">
                <h1>근무평정(자가보고서)</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                    <div><strong>성명:</strong> 홍길동</div>
                    <div><strong>소속:</strong> 운영지원팀</div>
                    <div><strong>직위:</strong> 선임</div>
                    <div><strong>생년월일:</strong> 1990.01.01</div>
                    <div><strong>현업무 배치일:</strong> 2023.01.01</div>
                    <div><strong>평가기간:</strong> 2025.01 ~ 2025.12</div>
                </div>

                <form style={{ marginTop: '2rem' }}>
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
                        <button type="button" className="btn btn-primary" onClick={() => alert('저장되었습니다.')}>
                            자가보고서 제출하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
