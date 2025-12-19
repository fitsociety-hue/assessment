import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { API } from '../../services/api';

export default function EvaluationConfig() {
    // Default weights based on the provided requirements matrix
    const defaultWeights = {
        'secgen': { director: 30, secgen: 0, leader: 50, member: 0, self: 20 },
        'leader': { director: 20, secgen: 20, leader: 20, member: 20, self: 20 },
        'member': { director: 0, secgen: 20, leader: 35, member: 25, self: 20 }
    };

    const [weights, setWeights] = useState(defaultWeights);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            const data = await API.fetchConfig();
            if (data && data.secgen && data.secgen.director !== undefined) {
                setWeights(data);
            }
            setLoading(false);
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        // Validation: Check if all rows sum to 100
        for (const [role, w] of Object.entries(weights)) {
            const sum = (w.director || 0) + (w.secgen || 0) + (w.leader || 0) + (w.member || 0) + (w.self || 0);
            if (sum !== 100) {
                alert(`[${getRoleName(role)}]의 평가 비율 합계가 100%가 아닙니다. (현재: ${sum}%)`);
                return;
            }
        }

        if (confirm('설정을 저장하시겠습니까?')) {
            const res = await API.saveConfig(weights);
            if (res.success) alert('설정이 저장되었습니다.');
            else alert('저장 실패');
        }
    };

    const updateWeight = (targetRole, evaluatorRole, val) => {
        const numVal = parseInt(val) || 0;
        setWeights(prev => ({
            ...prev,
            [targetRole]: { ...prev[targetRole], [evaluatorRole]: numVal }
        }));
    };

    const getRoleName = (key) => {
        const map = { 'secgen': '사무국장', 'leader': '팀장', 'member': '팀원 (선임)' };
        return map[key] || key;
    };

    const getSum = (w) => (w.director || 0) + (w.secgen || 0) + (w.leader || 0) + (w.member || 0) + (w.self || 0);

    return (
        <div className="card animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    평가 비율 설정
                </h3>
                <button className="btn btn-primary flex items-center gap-2" onClick={handleSave} disabled={loading}>
                    <Save size={16} /> {loading ? '저장 중...' : '저장하기'}
                </button>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="mt-1 shrink-0" />
                <div>
                    <p className="font-semibold">설정 안내</p>
                    <p className="text-sm mt-1">
                        각 직책별(행)로 평가자(열)의 반영 비율을 설정할 수 있습니다.<br />
                        모든 항목의 합계는 반드시 <span className="font-bold text-red-600">100%</span>가 되어야 합니다.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
                            <th className="p-3 border-r min-w-[100px]">평가 대상</th>
                            <th className="p-3 border-r min-w-[80px]">관장</th>
                            <th className="p-3 border-r min-w-[80px]">사무국장</th>
                            <th className="p-3 border-r min-w-[80px]">팀장</th>
                            <th className="p-3 border-r min-w-[80px]">팀원</th>
                            <th className="p-3 border-r min-w-[80px] text-blue-600">본인</th>
                            <th className="p-3 min-w-[80px] font-bold">합계</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['secgen', 'leader', 'member'].map((role) => {
                            const w = weights[role];
                            const sum = getSum(w);
                            const isValid = sum === 100;

                            return (
                                <tr key={role} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-semibold bg-gray-50 border-r">{getRoleName(role)}</td>
                                    <td className="p-2 border-r">
                                        <InputCell value={w.director} onChange={(v) => updateWeight(role, 'director', v)} />
                                    </td>
                                    <td className="p-2 border-r">
                                        <InputCell value={w.secgen} onChange={(v) => updateWeight(role, 'secgen', v)} />
                                    </td>
                                    <td className="p-2 border-r">
                                        <InputCell value={w.leader} onChange={(v) => updateWeight(role, 'leader', v)} />
                                    </td>
                                    <td className="p-2 border-r">
                                        <InputCell value={w.member} onChange={(v) => updateWeight(role, 'member', v)} />
                                    </td>
                                    <td className="p-2 border-r bg-blue-50/50">
                                        <InputCell value={w.self} onChange={(v) => updateWeight(role, 'self', v)} />
                                    </td>
                                    <td className={`p-3 font-bold ${isValid ? 'text-green-600' : 'text-red-500'}`}>
                                        {sum}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InputCell({ value, onChange }) {
    return (
        <div className="relative">
            <input
                type="number"
                min="0"
                max="100"
                className={`w-full text-center p-2 rounded border focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all ${value > 0 ? 'border-gray-300 bg-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={(e) => e.target.select()}
            />
            {value > 0 && <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>}
        </div>
    );
}
