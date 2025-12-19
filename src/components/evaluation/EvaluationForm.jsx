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
    const [selfAnalysis, setSelfAnalysis] = useState({
        rows: [
            { id: 1, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5', remarks: '' },
            { id: 2, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5', remarks: '' },
            { id: 3, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5', remarks: '' }
        ],
        q1: '', q2: '', q3: '', q4: '',
        q5: '', q5_reason: '',
        q6: '', q6_reason: '',
        q7_dept: '', q7_job: '', q7_reason: ''
    });

    const [selfEvalScores, setSelfEvalScores] = useState({});
    const [selfEvalBonus, setSelfEvalBonus] = useState([
        { id: 1, item: '외부지원사업(프로포절 선정 등)', content: '', score: '' },
        { id: 2, item: '신규기획사업(시범사업 등 수행)', content: '', score: '' },
        { id: 3, item: '위원회 등 네트워크 활동', content: '', score: '' },
        { id: 4, item: '연구실적(논문, 사례집, 발표 등)', content: '', score: '' },
        { id: 5, item: '자원개발(후원, 자원봉사 등)', content: '', score: '' }
    ]);

    // Constants for Self Eval
    const SELF_EVAL_ITEMS = [
        { id: 1, cat: '직무수행태도', q: '조직이해: 기관의 미션, 비전, 인재상을 충분히 이해하고 실천하기 위해 노력한다.' },
        { id: 2, cat: '직무수행태도', q: '성실성: 출퇴근 등 복무규정을 준수하고 업무에 성실히 임한다.' },
        { id: 3, cat: '직무수행태도', q: '협조성: 동료 및 타 팀과 협력하며 공동목표 달성을 위해 적극 협조한다.' },
        { id: 4, cat: '직무수행태도', q: '책임감: 맡은 업무를 회피하지 않고 끝까지 완수한다.' },
        { id: 5, cat: '직무수행태도', q: '보안의식: 개인정보보호 등 보안관리를 철저히 이행한다.' },
        { id: 6, cat: '직무수행능력', q: '전문성: 업무수행에 필요한 전문지식과 기술을 보유하고 활용한다.' },
        { id: 7, cat: '직무수행능력', q: '업무숙련도: 업무관련 지침, 예산, 법규, 매뉴얼 등을 충분히 숙지하고 있다.' },
        { id: 8, cat: '직무수행능력', q: '문제해결력: 문제의 핵심을 정확히 이해하고 적절한 해결방안을 제시한다.' },
        { id: 9, cat: '직무수행능력', q: '정보활용력: 필요한 정보를 효과적으로 수집하고 체계적으로 기록·활용한다.' },
        { id: 10, cat: '직무수행능력', q: '의사소통: 상사, 동료, 이용자와 효과적으로 소통한다.' },
        { id: 11, cat: '업무적합도', q: '자기개발: 업무의 질적 향상을 위해 교육, 슈퍼비전 등 자기개발에 노력한다.' },
        { id: 12, cat: '업무적합도', q: '업무량: 본인의 직급과 역량에 적합한 업무량을 수행한다.' },
        { id: 13, cat: '업무적합도', q: '업무수준: 본인의 직급과 경력에 상응하는 수준의 업무를 수행한다.' },
        { id: 14, cat: '업무적합도', q: '업무적합도: 본인의 능력을 발휘할 수 있는 적합한 업무를 수행한다.' },
        { id: 15, cat: '근무실적', q: '업무실적: 담당 사업/업무의 목표를 달성했다. (평균 %)' },
        { id: 16, cat: '근무실적', q: '예산집행: 계획된 예산을 효율적으로 집행했다. (평균 %)' },
        { id: 17, cat: '근무실적', q: '자원관리: 업무 수행에 필요한 내·외부 자원을 확보하거나 효율적으로 활용하는 데 기여했다.' },
        { id: 18, cat: '근무실적', q: '품질관리: 서비스 품질 향상을 위해 이용자 만족도 향상을 위해 노력했다.' },
        { id: 19, cat: '근무실적', q: '기록관리: 업무 관련 기록과 문서를 체계적이고 정확하게 관리했다.' },
        { id: 20, cat: '근무실적', q: '기한준수: 업무 보고 및 제출 기한을 철저히 준수했다.' }
    ];
    const [managerEvalScores, setManagerEvalScores] = useState({});
    const [managerEvalOpinion, setManagerEvalOpinion] = useState({ strength: '', weakness: '', support: '', thanks: '' });
    const [workerEvalScores, setWorkerEvalScores] = useState({});
    const [workerEvalOpinion, setWorkerEvalOpinion] = useState({ strength: '', weakness: '', training: '', placement: '' });
    const [peerEvalScores, setPeerEvalScores] = useState({});
    const [peerEvalOpinion, setPeerEvalOpinion] = useState({ strength: '', improvement: '', message: '' });

    // Constants for Questions
    const PEER_EVAL_ITEMS = [
        { id: 1, cat: '직무수행태도', q: '미션비전 이해: 복지관의 미션과 비전을 이해하고 실천하려 노력한다.' },
        { id: 2, cat: '직무수행태도', q: '이용자 존중: 복지관 이용 장애인 및 지역주민을 존중하고 친절하게 응대하는가?' },
        { id: 3, cat: '직무수행태도', q: '동료 신뢰: 원만한 대인관계로 신뢰할 수 있는 동료이며, 자신의 업무 외에도 적극 협조하는가?' },
        { id: 4, cat: '직무수행태도', q: '근무 태도: 규율을 준수하고 공사 구별이 분명하며 긍정적 자세로 업무에 임하는가?' },
        { id: 5, cat: '직무수행태도', q: '피드백 수용: 동료나 상사의 조언(피드백)을 감정적으로 받아들이지 않고, 자신의 성장을 위한 기회로 긍정적으로 수용하는가?' },
        { id: 6, cat: '직무수행능력', q: '도전 의식: 새롭고 어려운 업무도 두려워하지 않고 도전의식을 갖고 수행하는가?' },
        { id: 7, cat: '직무수행능력', q: '역활 수용: 자신이 원하는 업무에 제한하지 않고 맡은 직무를 성실히 수행하는가?' },
        { id: 8, cat: '직무수행능력', q: '지식 공유: 자신이 습득한 정보, 전문지식, 경험을 동료 및 팀에게 적극 공유하는가?' },
        { id: 9, cat: '직무수행능력', q: '책임 완수: 어려운 일에도 스스로 나서며 맡은 업무를 끝까지 완수하는가?' },
        { id: 10, cat: '직무수행능력', q: '전문성: 업무 수행에 필요한 전문지식 수준이 우수한가?' },
        { id: 11, cat: '직무수행능력', q: '창의성: 독창적 기획능력과 새로운 사고로 변화와 개선을 추구하는가?' },
        { id: 12, cat: '직무수행능력', q: '위기 대처: 돌발 상황이나 위기 상황 발생 시 당황하지 않고 지혜롭고 침착하게 대처하여 문제를 해결하는가?' },
        { id: 13, cat: '직무수행능력', q: '소통 역량: 동료의 의견을 경청하며, 갈등 상황에서 유연하게 소통하여 합리적인 결과를 도출하는가?' },
        { id: 14, cat: '직무수행능력', q: '인권 감수성: 장애인 당사자의 관점에서 생각하고, 업무 수행 과정에서 인권 침해 요소를 예방하며 존중의 가치를 실현하는가?' },
        { id: 15, cat: '직무수행능력', q: '안전 관리: 시설 안전 및 이용자 안전 수칙을 명확히 숙지하고 준수하여, 안전한 복지관 환경 조성에 기여하는가?' },
        { id: 16, cat: '직무수행능력', q: '행정 역량: 문서 작성, 시스템 입력 등 수반되는 행정 업무를 기한 내에 정확하고 꼼꼼하게 처리하는가?' },
        { id: 17, cat: '근무실적', q: '업무 성과: 효과적인 업무운영으로 목표를 달성하고 부서에 긍정적으로 기여하는가?' },
        { id: 18, cat: '근무실적', q: '품질향상: 담당 사업의 서비스 질과 이용자 만족도 향상을 위해 노력하는가?' },
        { id: 19, cat: '근무실적', q: '협업 기여: 팀 프로젝트나 협업 과제 수행 시 적극적으로 기여하는가?' },
        { id: 20, cat: '근무실적', q: '내부지원 및 외부연계: 기관 운영에 필요한 인적·물적 자원을 효율적으로 관리하거나, 업무 개선을 위한 새로운 정보 및 외부 자원을 적극적으로 도입하는가?' }
    ];

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

    // CSV for Peer Eval
    const handlePeerEvalCSV = async (e) => {
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
                setPeerEvalScores(newScores);
                alert('동료 평가 점수가 로드되었습니다.');
            }
        } catch (err) { alert('CSV 파싱 오류'); }
    };

    const downloadPeerTemplate = () => {
        const data = PEER_EVAL_ITEMS.map(i => ({ '번호': i.id, '평가항목': i.q, '점수': '' }));
        DataEngine.exportCSV(data, '동료평가_템플릿.csv');
    };

    // CSV Handlers
    const handleSelfAnalysisCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                // Determine if it's the rows part or questions part (simplified: assume merged or multiple CSVs, but for now just load rows if columns match)
                // Actually, let's just support 'Rows' via CSV for the table part. Questions usually typed.

                const newRows = [];
                data.forEach((row, idx) => {
                    if (row['사업명'] || row['사업내용']) {
                        newRows.push({
                            id: idx + 1,
                            name: row['사업명'] || '',
                            content: row['사업내용'] || '',
                            goal: row['목표'] || '',
                            achievement: row['달성도'] || '',
                            period: row['사업기간'] || '',
                            satisfaction: row['자기만족도'] || '5',
                            remarks: row['특이사항'] || ''
                        });
                    }
                });

                if (newRows.length > 0) {
                    setSelfAnalysis(prev => ({ ...prev, rows: newRows }));
                    alert('주요업무 실적 데이터가 로드되었습니다.');
                } else {
                    alert('유효한 데이터가 없습니다.');
                }
            }
        } catch (err) {
            alert('CSV 파싱 오류');
        }
    };

    const downloadSelfAnalysisTemplate = () => {
        const data = [
            { '사업명': '예시 사업', '사업내용': '내용 입력', '목표': '100명', '달성도': '100', '사업기간': '01월~12월', '자기만족도': '5', '특이사항': '' }
        ];
        DataEngine.exportCSV(data, '자기분석_실적_템플릿.csv');
    };

    const handleSelfEvalCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await DataEngine.parseCSV(file);
            if (data && data.length > 0) {
                const newScores = {};
                const newBonus = [...selfEvalBonus];

                data.forEach(row => {
                    // Try to detect columns
                    const type = row['구분'] || (parseInt(row['번호']) > 20 ? '가산점' : '일반'); // Fallback logic
                    const id = parseInt(row['번호']);
                    const score = parseInt(row['점수']);
                    const content = row['내용'] || '';

                    if (type === '일반' && id && score) {
                        newScores[id] = score;
                    } else if (type === '가산점' && id) {
                        // Bonus items 1-5
                        const idx = newBonus.findIndex(b => b.id === id);
                        if (idx !== -1) {
                            if (!isNaN(score)) newBonus[idx].score = score;
                            if (content) newBonus[idx].content = content;
                        }
                    } else if (id && score) {
                        // Simple fallback: 1-20 is standard
                        if (id <= 20) newScores[id] = score;
                    }
                });

                if (Object.keys(newScores).length > 0) setSelfEvalScores(prev => ({ ...prev, ...newScores }));
                setSelfEvalBonus(newBonus);
                alert('본인 평가 데이터(점수 및 가산점)가 로드되었습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('CSV 파싱 오류');
        }
    };

    const downloadSelfEvalTemplate = () => {
        // Standard Items
        const mainData = SELF_EVAL_ITEMS.map(i => ({
            '구분': '일반',
            '번호': i.id,
            '평가항목': i.q.split(':')[0], // Short name or full Q
            '내용': '', // No content for standard
            '점수': ''
        }));

        // Bonus Items
        const bonusData = selfEvalBonus.map(i => ({
            '구분': '가산점',
            '번호': i.id,
            '평가항목': i.item,
            '내용': '', // User fills this
            '점수': ''
        }));

        DataEngine.exportCSV([...mainData, ...bonusData], '본인평가_템플릿.csv');
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
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>지난 한 해 동안의 업무 수행 내용과 성과, 향후 계획을 상세히 기술해 주세요.</p>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0 }}>주요업무 추진내용 및 실적</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={downloadSelfAnalysisTemplate} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Download size={14} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                            <Upload size={14} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={handleSelfAnalysisCSV} />
                                        </label>
                                        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => {
                                            setSelfAnalysis(prev => ({
                                                ...prev,
                                                rows: [...prev.rows, { id: prev.rows.length + 1, name: '', content: '', goal: '', achievement: '', period: '', satisfaction: '5', remarks: '' }]
                                            }));
                                        }}>+ 행 추가</button>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-light)' }}>
                                                <th style={{ padding: '0.8rem', minWidth: '150px' }}>사업명</th>
                                                <th style={{ padding: '0.8rem', minWidth: '200px' }}>사업내용 (추진실적)</th>
                                                <th style={{ padding: '0.8rem', width: '80px' }}>목표</th>
                                                <th style={{ padding: '0.8rem', width: '60px' }}>달성도(%)</th>
                                                <th style={{ padding: '0.8rem', width: '120px' }}>사업기간</th>
                                                <th style={{ padding: '0.8rem', width: '80px' }}>만족도</th>
                                                <th style={{ padding: '0.8rem', minWidth: '100px' }}>특이사항</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selfAnalysis.rows.map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.name} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].name = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.content} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].content = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.goal} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].goal = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.achievement} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].achievement = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.period} style={{ textAlign: 'center' }} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].period = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <select className="input-field" value={row.satisfaction} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].satisfaction = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }}>
                                                            <option value="5">5</option>
                                                            <option value="4">4</option>
                                                            <option value="3">3</option>
                                                            <option value="2">2</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <input className="input-field" value={row.remarks} onChange={(e) => {
                                                            const newRows = [...selfAnalysis.rows]; newRows[idx].remarks = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: newRows });
                                                        }} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '1.5rem' }}>자기개발 및 전문성 향상</h4>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>1. 2025년 중 복지관의 미션, 비전, 핵심가치 달성에 기여한 구체적 사례는?</label>
                                        <textarea className="input-field" rows="3" value={selfAnalysis.q1} onChange={e => setSelfAnalysis({ ...selfAnalysis, q1: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>2. 2025년 중 업무와 관련하여 이수한 외부교육, 연수, 자격취득 등?</label>
                                        <textarea className="input-field" rows="3" value={selfAnalysis.q2} onChange={e => setSelfAnalysis({ ...selfAnalysis, q2: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>3. 2025년 중 직무수행 시 가장 도전적이었던 과제와 이를 극복하기 위해 시도한 방법은?</label>
                                        <textarea className="input-field" rows="3" value={selfAnalysis.q3} onChange={e => setSelfAnalysis({ ...selfAnalysis, q3: e.target.value })}></textarea>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>4. 2026년 기관(팀)의 발전을 위하여 바라는 점과 건의하고 싶은 사항은?</label>
                                        <textarea className="input-field" rows="3" value={selfAnalysis.q4} onChange={e => setSelfAnalysis({ ...selfAnalysis, q4: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '1.5rem' }}>만족도 및 직무순환</h4>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>5. 2025년 근무부서 만족도는?</label>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            {['아주 만족한다', '만족한다', '보통이다', '불만스럽다'].map(opt => (
                                                <label key={opt} style={{ cursor: 'pointer' }}>
                                                    <input type="radio" name="q5_sat" value={opt} checked={selfAnalysis.q5 === opt} onChange={e => setSelfAnalysis({ ...selfAnalysis, q5: e.target.value })} /> {opt}
                                                </label>
                                            ))}
                                        </div>
                                        <input className="input-field" placeholder="이유 :" value={selfAnalysis.q5_reason} onChange={e => setSelfAnalysis({ ...selfAnalysis, q5_reason: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>6. 2025년 복지관 근무 만족도는?</label>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            {['아주 만족한다', '만족한다', '보통이다', '불만스럽다'].map(opt => (
                                                <label key={opt} style={{ cursor: 'pointer' }}>
                                                    <input type="radio" name="q6_sat" value={opt} checked={selfAnalysis.q6 === opt} onChange={e => setSelfAnalysis({ ...selfAnalysis, q6: e.target.value })} /> {opt}
                                                </label>
                                            ))}
                                        </div>
                                        <input className="input-field" placeholder="이유 :" value={selfAnalysis.q6_reason} onChange={e => setSelfAnalysis({ ...selfAnalysis, q6_reason: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>7. 직무순환을 할 경우 희망부서와 관심직무는?</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input className="input-field" placeholder="희망부서 (1순위)" value={selfAnalysis.q7_dept} onChange={e => setSelfAnalysis({ ...selfAnalysis, q7_dept: e.target.value })} />
                                            <input className="input-field" placeholder="관심직무" value={selfAnalysis.q7_job} onChange={e => setSelfAnalysis({ ...selfAnalysis, q7_job: e.target.value })} />
                                        </div>
                                        <input className="input-field" placeholder="이유 :" value={selfAnalysis.q7_reason} onChange={e => setSelfAnalysis({ ...selfAnalysis, q7_reason: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    if (confirm('자기분석 보고서를 저장하시겠습니까?')) {
                                        const res = await API.saveEvaluation({
                                            type: 'self_analysis',
                                            evaluator: currentUser.name,
                                            uid: currentUser.id || currentUser.name,
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
                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>본인 평가</h3>
                            <p className="text-sub" style={{ marginBottom: '2rem' }}>본인의 업무 성과와 역량을 객관적으로 평가해 주세요.</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={downloadSelfEvalTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Download size={16} /> 템플릿
                                </button>
                                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <Upload size={16} /> CSV 업로드
                                    <input type="file" hidden accept=".csv" onChange={handleSelfEvalCSV} />
                                </label>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '50px' }}>No</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '80px' }}>구분</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>평가 항목</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'center', width: '250px' }}>평가 (5점)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SELF_EVAL_ITEMS.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.id}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-600)' }}>{item.cat}</td>
                                            <td style={{ padding: '0.8rem' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.q.split(':')[0]}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{item.q.split(':')[1]}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                    {[5, 4, 3, 2, 1].map(score => (
                                                        <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: selfEvalScores[item.id] === score ? 'var(--primary-600)' : 'white', color: selfEvalScores[item.id] === score ? 'white' : 'black' }}>
                                                            <input
                                                                type="radio"
                                                                name={`self_${item.id}`}
                                                                checked={selfEvalScores[item.id] === score}
                                                                onChange={() => setSelfEvalScores({ ...selfEvalScores, [item.id]: score })}
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
                                <h4 style={{ marginBottom: '1rem' }}>가산점 항목 (해당 사항이 있는 경우만 작성)</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid var(--border-light)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-light)', background: '#f9fafb' }}>
                                            <th style={{ padding: '0.8rem', width: '200px', textAlign: 'left' }}>구분</th>
                                            <th style={{ padding: '0.8rem', textAlign: 'left' }}>내용 (사업명, 금액, 건수 등)</th>
                                            <th style={{ padding: '0.8rem', width: '150px', textAlign: 'center' }}>배점 (4~1점)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selfEvalBonus.map((item, idx) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '0.8rem', fontWeight: 600 }}>{item.item}</td>
                                                <td style={{ padding: '0.8rem' }}>
                                                    <input className="input-field" placeholder="내용을 입력하세요" value={item.content} onChange={(e) => {
                                                        const newBonus = [...selfEvalBonus]; newBonus[idx].content = e.target.value; setSelfEvalBonus(newBonus);
                                                    }} />
                                                </td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                        {[4, 3, 2, 1].map(score => (
                                                            <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: item.score == score ? 'var(--primary-600)' : 'white', color: item.score == score ? 'white' : 'black' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`bonus_${item.id}`}
                                                                    checked={item.score == score}
                                                                    onChange={() => {
                                                                        const newBonus = [...selfEvalBonus]; newBonus[idx].score = score; setSelfEvalBonus(newBonus);
                                                                    }}
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
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-primary" onClick={async () => {
                                    if (confirm('본인 평가를 제출하시겠습니까?')) {
                                        const res = await API.saveEvaluation({
                                            type: 'self_eval',
                                            evaluator: currentUser.name,
                                            uid: currentUser.id || currentUser.name,
                                            data: { scores: selfEvalScores, bonus: selfEvalBonus }
                                        });
                                        if (res.success) alert('본인 평가가 제출되었습니다.');
                                        else alert('제출 실패: ' + res.error);
                                    }
                                }}>
                                    평가 제출 (DB)
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Tab 2: Peer Evaluation */}
                    {
                        activeTab === 2 && (
                            <div>
                                <h3 style={{ borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>동료 평가</h3>
                                <p className="text-sub" style={{ marginBottom: '2rem' }}>협업하는 동료의 직무 수행 태도와 능력을 객관적으로 평가해 주세요.</p>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-outline" onClick={downloadPeerTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> 템플릿
                                    </button>
                                    <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <Upload size={16} /> CSV 업로드
                                        <input type="file" hidden accept=".csv" onChange={handlePeerEvalCSV} />
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
                                        {PEER_EVAL_ITEMS.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.id}</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-600)' }}>{item.cat}</td>
                                                <td style={{ padding: '0.8rem' }}>{item.q.split(':')[1]}</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                                        {[5, 4, 3, 2, 1].map(score => (
                                                            <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: peerEvalScores[item.id] === score ? 'var(--primary-600)' : 'white', color: peerEvalScores[item.id] === score ? 'white' : 'black' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`peer_${item.id}`}
                                                                    checked={peerEvalScores[item.id] === score}
                                                                    onChange={() => setPeerEvalScores({ ...peerEvalScores, [item.id]: score })}
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>동료로서 평가대상자의 가장 큰 강점</label>
                                            <textarea className="input-field" rows="3" value={peerEvalOpinion.strength} onChange={e => setPeerEvalOpinion({ ...peerEvalOpinion, strength: e.target.value })}></textarea>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>함께 일하며 개선되면 좋겠다고 생각하는 부분</label>
                                            <textarea className="input-field" rows="3" value={peerEvalOpinion.improvement} onChange={e => setPeerEvalOpinion({ ...peerEvalOpinion, improvement: e.target.value })}></textarea>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>동료에게 전하고 싶은 격려나 응원의 메시지</label>
                                            <textarea className="input-field" rows="3" value={peerEvalOpinion.message} onChange={e => setPeerEvalOpinion({ ...peerEvalOpinion, message: e.target.value })}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                    <button type="button" className="btn btn-primary" onClick={async () => {
                                        const res = await API.saveEvaluation({
                                            type: 'peer_eval',
                                            evaluator: currentUser.name,
                                            target: 'Peer',
                                            data: { scores: peerEvalScores, opinion: peerEvalOpinion } // Send structured data
                                        });
                                        if (res.success) alert('동료 평가 저장 완료');
                                    }}>
                                        평가 제출 (DB)
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {/* Tab 3: Manager Evaluation */}
                    {
                        activeTab === 3 && (
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
                        )
                    }

                    {/* Tab 4: Subordinate Evaluation */}
                    {
                        activeTab === 4 && (
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
                        )
                    }

                </div >
            </div >
        </div >
    );
}
