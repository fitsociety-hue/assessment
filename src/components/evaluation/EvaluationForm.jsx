import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../services/api';
import { DataEngine } from '../../utils/dataEngine';
import { EMPLOYEES } from '../../data/employees';
import { Upload, Download, User, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

// Helper for safe comparison
const normalizeTeam = (t) => {
    if (!t) return '';
    return t.replace(/\s+/g, '').replace(/팀$/, ''); // Remove spaces and trailing 'Team'/'팀'
};

export default function EvaluationForm() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [employeesList, setEmployeesList] = useState([]); // Dynamic list from API

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

    const [evalScores, setEvalScores] = useState({});
    const [evalOpinion, setEvalOpinion] = useState({ strength: '', weakness: '', support: '', thanks: '', improvement: '', message: '', training: '', placement: '' });

    // Constants
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

    const PEER_EVAL_ITEMS = [
        { id: 1, cat: '직무수행태도', q: '미션비전 이해: 복지관의 미션과 비전을 이해하고 실천하려 노력한다.' },
        { id: 2, cat: '직무수행태도', q: '이용자 존중: 복지관 이용 장애인 및 지역주민을 존중하고 친절하게 응대하는가?' },
        { id: 3, cat: '직무수행태도', q: '동료 신뢰: 원만한 대인관계로 신뢰할 수 있는 동료이며, 자신의 업무 외에도 적극 협조하는가?' },
        { id: 4, cat: '직무수행태도', q: '근무 태도: 규율을 준수하고 공·사 구별이 분명하며 긍정적 자세로 업무에 임하는가?' },
        { id: 5, cat: '직무수행태도', q: '피드백 수용: 동료나 상사의 조언(피드백)을 감정적으로 받아들이지 않고, 자신의 성장을 위한 기회로 긍정적으로 수용하는가?' },
        { id: 6, cat: '직무수행능력', q: '도전 의식: 새롭고 어려운 업무도 두려워하지 않고 도전의식을 갖고 수행하는가?' },
        { id: 7, cat: '직무수행능력', q: '역할 수용: 자신이 원하는 업무에 제한하지 않고 맡은 직무를 성실히 수행하는가?' },
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

    // CSV Handlers
    const handleCSV = async (e, setScoreFunc) => {
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
                setScoreFunc(newScores);
                alert('점수가 로드되었습니다.');
            }
        } catch (err) { alert('CSV 파싱 오류'); }
    };

    const downloadTemplate = (items, filename, bonus = []) => {
        const data = items.map(i => ({ '번호': i.id, '평가항목': i.q, '점수': '' }));
        if (bonus.length > 0) {
            bonus.forEach(b => data.push({ '번호': b.id + 100, '평가항목': b.item, '점수': '' }));
        }
        DataEngine.exportCSV(data, filename);
    };

    const downloadSelfAnalysisTemplate = () => {
        // Create template with correct headers for Self Analysis
        const data = [
            { '사업명': '예시 사업 A', '내용': '사업 내용 예시', '달성도(%)': '100', '만족도': '5' },
            { '사업명': '', '내용': '', '달성도(%)': '', '만족도': '' }
        ];
        DataEngine.exportCSV(data, '자기분석보고서_템플릿.csv');
    };


    // Initial Load & Role Check
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
            } catch (e) {
                console.error("Failed to parse user info", e);
            }
        }

        // Fetch Employees from API to ensure consistent data with Login
        const loadEmployees = async () => {
            try {
                const allEmployees = await API.fetchEmployees();
                if (allEmployees && Array.isArray(allEmployees) && allEmployees.length > 0) {
                    // Map generic API data to application Model (add 'role', 'id')
                    const mapped = allEmployees.map((e, idx) => ({
                        ...e,
                        id: 1000 + idx, // Generate temporary ID
                        role: mapPositionToRole(e.position)
                    }));
                    setEmployeesList(mapped);
                } else {
                    console.warn("API employees empty, falling back to static");
                    setEmployeesList(EMPLOYEES);
                }
            } catch (e) {
                console.error("Failed to fetch employees, using fallback", e);
                setEmployeesList(EMPLOYEES);
            }
        };
        loadEmployees();

    }, []);

    const mapPositionToRole = (pos) => {
        if (!pos) return 'member';
        const p = pos.trim();
        if (p === '관장') return 'director';
        if (p === '사무국장') return 'secgen';
        if (p === '팀장') return 'leader';
        return 'member';
    };

    // Tab Logic
    const TAB_SELF_ANALYSIS = { id: 0, label: '자기분석 보고서' };
    const TAB_SELF_EVAL = { id: 1, label: '본인평가' };
    const TAB_PEER_EVAL = { id: 2, label: '동료평가' };
    const TAB_MANAGER_EVAL = { id: 3, label: '관리자 평가' };
    const TAB_SUBORDINATE_EVAL = { id: 4, label: '종사자(팀원) 평가' };

    const getTabsForRole = (role) => {
        if (!role) return [];
        if (role === 'director') return [TAB_MANAGER_EVAL];
        if (role === 'secgen') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_MANAGER_EVAL, TAB_SUBORDINATE_EVAL];
        if (role === 'leader') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_MANAGER_EVAL, TAB_SUBORDINATE_EVAL, TAB_PEER_EVAL];
        if (role === 'member') return [TAB_SELF_ANALYSIS, TAB_SELF_EVAL, TAB_MANAGER_EVAL, TAB_PEER_EVAL];
        return [];
    };

    const visibleTabs = currentUser ? getTabsForRole(currentUser.role) : [];

    useEffect(() => {
        if (visibleTabs.length > 0 && activeTab === null) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [visibleTabs, activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setSelectedTarget(null); // Reset target on tab change
        setShowPreview(false);
        setEvalScores({}); // Reset scores
        setEvalOpinion({ strength: '', weakness: '', support: '', thanks: '', improvement: '', message: '', training: '', placement: '' });
    };

    // Target Selection Logic
    // Target Selection Logic
    const getTargets = () => {
        if (!currentUser) return [];
        const role = currentUser.role;
        // ALWAYS use the full static employee list for finding targets to ensure everyone is evaluable
        // (API might only return registered users)
        const sourceData = EMPLOYEES;

        const currentTeam = currentUser.team ? currentUser.team.trim() : '';
        const currentTeamNormalized = normalizeTeam(currentTeam);

        const isSameTeam = (u) => {
            return normalizeTeam(u.team) === currentTeamNormalized;
        };

        // --- Director Logic ---
        if (role === 'director' && activeTab === 3) {
            return sourceData.filter(e => e.role === 'secgen' || e.role === 'leader');
        }

        // --- Secretary General Logic ---
        if (role === 'secgen') {
            if (activeTab === 3) return sourceData.filter(e => e.role === 'leader'); // Manager Eval: Team Leaders
            if (activeTab === 4) return sourceData.filter(e => e.role === 'member'); // Subordinate Eval: All Members (Excl. Leaders)
        }

        // --- Team Leader Logic ---
        if (role === 'leader') {
            if (activeTab === 3) return sourceData.filter(e => e.role === 'secgen'); // Manager: SecGen
            if (activeTab === 4) return sourceData.filter(e => e.role === 'member' && isSameTeam(e)); // Subordinate: Own Members
            if (activeTab === 2) return sourceData.filter(e => e.role === 'leader' && e.name !== currentUser.name); // Peer: Other Team Leaders
        }

        // --- Team Member Logic ---
        if (role === 'member') {
            if (activeTab === 3) return sourceData.filter(e => e.role === 'leader' && isSameTeam(e)); // Manager: Own Leader
            if (activeTab === 2) return sourceData.filter(e => e.role === 'member' && isSameTeam(e) && e.name !== currentUser.name); // Peer: Own Team Members
        }

        return [];
    };

    const targetList = getTargets();

    // Preview Logic
    const handlePreview = () => {
        setShowPreview(true);
    };

    const submitEvaluation = async () => {
        let type = '';
        let data = {};

        if (activeTab === 0) { type = 'self_analysis'; data = selfAnalysis; }
        else if (activeTab === 1) { type = 'self_eval'; data = { scores: selfEvalScores, bonus: selfEvalBonus }; }
        else if (activeTab === 2) { type = 'peer_eval'; data = { scores: evalScores, opinion: evalOpinion }; }
        else if (activeTab === 3) { type = 'manager_eval'; data = { scores: evalScores, opinion: evalOpinion }; }
        else if (activeTab === 4) { type = 'subordinate_eval'; data = { scores: evalScores, opinion: evalOpinion }; }

        const res = await API.saveEvaluation({
            type,
            evaluator: currentUser.name,
            target: selectedTarget ? selectedTarget.name : 'Self',
            data
        });

        if (res.success) {
            alert('제출이 완료되었습니다.');
            setShowPreview(false);
            if (selectedTarget) setSelectedTarget(null); // Go back to list
        } else {
            alert('저장 실패: ' + res.error);
        }
    };

    // Render Components
    const renderQuestionTable = (items, scores, setScores) => (
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
                {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.id}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-600)' }}>{item.cat}</td>
                        <td style={{ padding: '0.8rem' }}>{item.q.split(':')[1] || item.q}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                {[5, 4, 3, 2, 1].map(score => (
                                    <label key={score} style={{ cursor: 'pointer', padding: '0.2rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: scores[item.id] === score ? 'var(--primary-600)' : 'white', color: scores[item.id] === score ? 'white' : 'black' }}>
                                        <input
                                            type="radio"
                                            name={`q_${item.id}`}
                                            checked={scores[item.id] === score}
                                            onChange={() => setScores({ ...scores, [item.id]: score })}
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
    );

    if (!currentUser) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="card" id="evaluation-content">
                <Header title="근무평정 시스템" user={currentUser} />

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
                                background: 'none', border: 'none', cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Target Selection Logic (for non-self tabs) */}
                {(activeTab !== 0 && activeTab !== 1) && !selectedTarget && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1rem' }}>평가 대상자 선택</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-sub)' }}>평가를 진행할 대상자를 선택해주세요.</p>
                        {targetList.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '8px' }}>평가 가능한 대상자가 없습니다.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {targetList.map((target, idx) => (
                                    <div key={target.id || idx} onClick={() => setSelectedTarget(target)}
                                        style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'white', textAlign: 'center' }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                                    >
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{target.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{target.team} {target.position}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Evaluation Form Content */}
                {((activeTab === 0 || activeTab === 1) || selectedTarget) && (
                    <div className="animate-fade-in">
                        {(activeTab !== 0 && activeTab !== 1) && (
                            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button onClick={() => setSelectedTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-sub)' }}>
                                    <ArrowLeft size={16} /> 목록으로
                                </button>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}> &gt; {selectedTarget?.name} ({selectedTarget?.team}) 평가 진행중</span>
                            </div>
                        )}

                        {activeTab === 0 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>자기분석 보고서</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={downloadSelfAnalysisTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={16} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <Upload size={16} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={(e) => handleCSV(e, (data) => {
                                                alert('Not fully implemented for complex rows in this demo');
                                            })} />
                                        </label>
                                    </div>
                                </div>
                                <p className="text-sub">지난 한 해 성과를 기술해주세요.</p>

                                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. 주요업무 추진실적</h4>
                                <table style={{ width: '100%', marginBottom: '1rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-input)' }}>
                                            <th style={{ padding: '0.5rem', border: '1px solid #eee' }}>사업명</th>
                                            <th style={{ padding: '0.5rem', border: '1px solid #eee' }}>내용</th>
                                            <th style={{ padding: '0.5rem', border: '1px solid #eee', width: '80px' }}>달성도(%)</th>
                                            <th style={{ padding: '0.5rem', border: '1px solid #eee', width: '60px' }}>만족도</th>
                                        </tr>
                                    </thead>
                                    <tbody>{selfAnalysis.rows.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '0.5rem', border: '1px solid #eee' }}><input className="input-field" value={r.name} onChange={e => { const n = [...selfAnalysis.rows]; n[i].name = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: n }) }} placeholder="사업명" /></td>
                                            <td style={{ padding: '0.5rem', border: '1px solid #eee' }}><input className="input-field" value={r.content} onChange={e => { const n = [...selfAnalysis.rows]; n[i].content = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: n }) }} placeholder="추진내용" /></td>
                                            <td style={{ padding: '0.5rem', border: '1px solid #eee' }}><input className="input-field" value={r.achievement} onChange={e => { const n = [...selfAnalysis.rows]; n[i].achievement = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: n }) }} style={{ textAlign: 'center' }} /></td>
                                            <td style={{ padding: '0.5rem', border: '1px solid #eee' }}>
                                                <select className="input-field" value={r.satisfaction} onChange={e => { const n = [...selfAnalysis.rows]; n[i].satisfaction = e.target.value; setSelfAnalysis({ ...selfAnalysis, rows: n }) }}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                                <button className="btn btn-primary" onClick={() => setSelfAnalysis(p => ({ ...p, rows: [...p.rows, { id: p.rows.length + 1, name: '', content: '', achievement: '', satisfaction: '5' }] }))}>+ 행 추가</button>

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>2. 자기개발 및 전문성 향상</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div><label style={{ fontWeight: 'bold' }}>1) 복지관 미션/비전 기여 사례</label><textarea className="input-field" rows="3" value={selfAnalysis.q1} onChange={e => setSelfAnalysis({ ...selfAnalysis, q1: e.target.value })} /></div>
                                        <div><label style={{ fontWeight: 'bold' }}>2) 외부교육 및 자격취득</label><textarea className="input-field" rows="3" value={selfAnalysis.q2} onChange={e => setSelfAnalysis({ ...selfAnalysis, q2: e.target.value })} /></div>
                                        <div><label style={{ fontWeight: 'bold' }}>3) 가장 도전적이었던 과제와 극복</label><textarea className="input-field" rows="3" value={selfAnalysis.q3} onChange={e => setSelfAnalysis({ ...selfAnalysis, q3: e.target.value })} /></div>
                                        <div><label style={{ fontWeight: 'bold' }}>4) 기관 발전을 위한 제언</label><textarea className="input-field" rows="3" value={selfAnalysis.q4} onChange={e => setSelfAnalysis({ ...selfAnalysis, q4: e.target.value })} /></div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>3. 만족도 및 직무순환</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold' }}>5) 현재 부서 만족도</label>
                                            <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                                                {['아주 만족', '만족', '보통', '불만'].map(o => <label key={o}><input type="radio" checked={selfAnalysis.q5 === o} onChange={() => setSelfAnalysis({ ...selfAnalysis, q5: o })} /> {o}</label>)}
                                            </div>
                                            <input className="input-field" placeholder="이유" value={selfAnalysis.q5_reason} onChange={e => setSelfAnalysis({ ...selfAnalysis, q5_reason: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold' }}>6) 복지관 근무 만족도</label>
                                            <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                                                {['아주 만족', '만족', '보통', '불만'].map(o => <label key={o}><input type="radio" checked={selfAnalysis.q6 === o} onChange={() => setSelfAnalysis({ ...selfAnalysis, q6: o })} /> {o}</label>)}
                                            </div>
                                            <input className="input-field" placeholder="이유" value={selfAnalysis.q6_reason} onChange={e => setSelfAnalysis({ ...selfAnalysis, q6_reason: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold' }}>7) 희망 부서/직무</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <input className="input-field" placeholder="희망부서" value={selfAnalysis.q7_dept} onChange={e => setSelfAnalysis({ ...selfAnalysis, q7_dept: e.target.value })} />
                                                <input className="input-field" placeholder="희망직무" value={selfAnalysis.q7_job} onChange={e => setSelfAnalysis({ ...selfAnalysis, q7_job: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', marginTop: '2rem' }}><button className="btn btn-primary" onClick={handlePreview}>저장 및 미리보기</button></div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>본인 평가</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={() => downloadTemplate(SELF_EVAL_ITEMS, '본인평가_템플릿.csv', selfEvalBonus)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={16} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <Upload size={16} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={(e) => handleCSV(e, setSelfEvalScores)} />
                                        </label>
                                    </div>
                                </div>
                                {renderQuestionTable(SELF_EVAL_ITEMS, selfEvalScores, setSelfEvalScores)}

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
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
                                <div style={{ textAlign: 'right', marginTop: '2rem' }}><button className="btn btn-primary" onClick={handlePreview}>저장 및 미리보기</button></div>
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>동료 평가 ({selectedTarget?.name})</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={() => downloadTemplate(PEER_EVAL_ITEMS, '동료평가_템플릿.csv', [])} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={16} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <Upload size={16} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={(e) => handleCSV(e, setEvalScores)} />
                                        </label>
                                    </div>
                                </div>

                                {renderQuestionTable(PEER_EVAL_ITEMS, evalScores, setEvalScores)}

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>종합의견 및 제안</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>동료로서 평가대상자의 가장 큰 강점</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.strength} onChange={e => setEvalOpinion({ ...evalOpinion, strength: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>함께 일하며 개선되면 좋겠다고 생각하는 부분</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.improvement} onChange={e => setEvalOpinion({ ...evalOpinion, improvement: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>동료에게 전하고 싶은 격려나 응원의 메시지</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.message} onChange={e => setEvalOpinion({ ...evalOpinion, message: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '2rem' }}><button className="btn btn-primary" onClick={handlePreview}>저장 및 미리보기</button></div>
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>관리자 평가 ({selectedTarget?.name})</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={() => downloadTemplate(MANAGER_EVAL_ITEMS, '관리자평가_템플릿.csv', [])} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={16} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <Upload size={16} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={(e) => handleCSV(e, setEvalScores)} />
                                        </label>
                                    </div>
                                </div>

                                {renderQuestionTable(MANAGER_EVAL_ITEMS, evalScores, setEvalScores)}

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>종합의견 및 제안</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>관리자로서 가장 우수한 점</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.strength} onChange={e => setEvalOpinion({ ...evalOpinion, strength: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>개선이 필요하다고 생각되는 부분</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.weakness} onChange={e => setEvalOpinion({ ...evalOpinion, weakness: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>관리자에게 바라는 지원 및 협력</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.support} onChange={e => setEvalOpinion({ ...evalOpinion, support: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>관리자에게 감사한 점</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.thanks} onChange={e => setEvalOpinion({ ...evalOpinion, thanks: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '2rem' }}><button className="btn btn-primary" onClick={handlePreview}>저장 및 미리보기</button></div>
                            </div>
                        )}

                        {activeTab === 4 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>종사자(팀원) 평가 ({selectedTarget?.name})</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" onClick={() => downloadTemplate(WORKER_EVAL_ITEMS, '종사자(팀원)평가_템플릿.csv', [])} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Download size={16} /> 템플릿
                                        </button>
                                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <Upload size={16} /> CSV 업로드
                                            <input type="file" hidden accept=".csv" onChange={(e) => handleCSV(e, setEvalScores)} />
                                        </label>
                                    </div>
                                </div>

                                {renderQuestionTable(WORKER_EVAL_ITEMS, evalScores, setEvalScores)}

                                <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>종합의견 및 제안</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>직원의 주요 강점 및 우수한 점</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.strength} onChange={e => setEvalOpinion({ ...evalOpinion, strength: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>개선이 필요한 부분 및 발전방향</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.weakness} onChange={e => setEvalOpinion({ ...evalOpinion, weakness: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>향후 교육·훈련 필요사항</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.training} onChange={e => setEvalOpinion({ ...evalOpinion, training: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>적합한 업무 및 배치 의견</label>
                                            <textarea className="input-field" rows="3" value={evalOpinion.placement} onChange={e => setEvalOpinion({ ...evalOpinion, placement: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', marginTop: '2rem' }}><button className="btn btn-primary" onClick={handlePreview}>저장 및 미리보기</button></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card animate-fade-in" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>평가 제출 확인</h2>
                        <div style={{ margin: '2rem 0', lineHeight: '1.6' }}>
                            <p><strong>평가 종류:</strong> {visibleTabs.find(t => t.id === activeTab)?.label}</p>
                            <p><strong>평가 대상:</strong> {selectedTarget ? `${selectedTarget.name} (${selectedTarget.position})` : '본인'}</p>
                            <p><strong>작성자:</strong> {currentUser.name}</p>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: '8px' }}>
                                <p>작성하신 내용으로 평가를 제출하시겠습니까?</p>
                                <p style={{ fontSize: '0.9rem', color: '#ef4444' }}>제출 후에는 수정이 불가능할 수 있습니다.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setShowPreview(false)}>취소 (계속작성)</button>
                            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={submitEvaluation}>
                                <CheckCircle size={18} /> 확정 및 제출
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Header = ({ title, user }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{title}</h1>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{user.name} {user.position} | {user.team}</div>
    </div>
);
