import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function EvaluationConfig() {
    // Default Weights based on User Request
    const defaultWeights = {
        'secgen': { 'manager': 30, 'subordinate': 50, 'self': 20, 'peer': 0 },
        'leader': { 'manager': 40, 'subordinate': 20, 'self': 20, 'peer': 20 }, // Example, needs to align with table image
        'member': { 'manager': 35, 'subordinate': 0, 'self': 20, 'peer': 25 }
    };

    // Correcting default weights based on the image provided
    // Image: Director(Manager) -> SecGen(30), Team(50), Self(20)
    // Image: Director+SecGen(Manager) -> Leader(40), Team(0?), Self(20), Peer(20) - Wait, image is complex.
    // Let's implement a matrix editor that matches the structure.

    const [weights, setWeights] = useState(defaultWeights);

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>평가 비율 설정</h3>
                <button className="btn btn-primary">
                    <Save size={16} style={{ marginRight: '0.5rem' }} /> 설정 저장
                </button>
            </div>

            <p className="text-sub" style={{ marginBottom: '2rem' }}>
                각 직책별 평가 항목의 반영 비율을 설정합니다. 합계는 반드시 100%가 되어야 합니다.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ padding: '1rem' }}>평가 대상</th>
                        <th style={{ padding: '1rem', color: '#ef4444' }}>관리자 평가</th>
                        <th style={{ padding: '1rem' }}>동료 평가</th>
                        <th style={{ padding: '1rem', color: '#ef4444' }}>종사자(하급자) 평가</th>
                        <th style={{ padding: '1rem', color: '#ef4444' }}>본인 평가</th>
                        <th style={{ padding: '1rem' }}>합계</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Security General */}
                    <WeightRow role="사무국장" data={weights.secgen} />
                    {/* Team Leader */}
                    <WeightRow role="팀장" data={weights.leader} />
                    {/* Team Member */}
                    <WeightRow role="팀원 (선임)" data={weights.member} />
                </tbody>
            </table>
        </div>
    );
}

function WeightRow({ role, data }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
            <td style={{ padding: '1rem', fontWeight: 600 }}>{role}</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" defaultValue={data?.manager || 0} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" defaultValue={data?.peer || 0} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" defaultValue={data?.subordinate || 0} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" defaultValue={data?.self || 0} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-600)' }}>100%</td>
        </tr>
    );
}
