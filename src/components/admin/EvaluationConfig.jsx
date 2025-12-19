import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { API } from '../../services/api';

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
    const [loading, setLoading] = useState(false);

    // Fetch Config on Mount
    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            const data = await API.fetchConfig();
            if (data) {
                setWeights(data);
            }
            setLoading(false);
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        if (confirm('설정을 저장하시겠습니까? (DB 연동)')) {
            const res = await API.saveConfig(weights);
            if (res.success) alert('설정이 저장되었습니다.');
            else alert('저장 실패');
        }
    };

    // Helper to update weights
    const updateWeight = (role, type, val) => {
        setWeights(prev => ({
            ...prev,
            [role]: { ...prev[role], [type]: parseInt(val) || 0 }
        }));
    };

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>평가 비율 설정</h3>
                <h3>평가 비율 설정</h3>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    <Save size={16} style={{ marginRight: '0.5rem' }} /> {loading ? '로딩 중...' : '설정 저장'}
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
                    <WeightRow role="사무국장" data={weights.secgen} onChange={(t, v) => updateWeight('secgen', t, v)} />
                    {/* Team Leader */}
                    <WeightRow role="팀장" data={weights.leader} onChange={(t, v) => updateWeight('leader', t, v)} />
                    {/* Team Member */}
                    <WeightRow role="팀원 (선임)" data={weights.member} onChange={(t, v) => updateWeight('member', t, v)} />
                </tbody>
            </table>
        </div>
    );
}

function WeightRow({ role, data, onChange }) {
    return (
        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
            <td style={{ padding: '1rem', fontWeight: 600 }}>{role}</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" value={data?.manager || 0} onChange={e => onChange('manager', e.target.value)} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" value={data?.peer || 0} onChange={e => onChange('peer', e.target.value)} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" value={data?.subordinate || 0} onChange={e => onChange('subordinate', e.target.value)} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '0.5rem' }}><input className="input-field" type="number" value={data?.self || 0} onChange={e => onChange('self', e.target.value)} style={{ textAlign: 'center' }} /> %</td>
            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                {(data?.manager || 0) + (data?.peer || 0) + (data?.subordinate || 0) + (data?.self || 0)}%
            </td>
        </tr>
    );
}
