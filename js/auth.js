/**
 * 인증 및 세션 관리
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.SESSION_KEY = 'assessment_session';
    }
    /**
     * 로그인
     * @param {string} identifier - 이름 또는 아이디
     * @param {string} password - 비밀번호
     * @param {string} loginType - 'name' (이름) 또는 'id' (아이디)
     */
    async login(identifier, password, loginType = 'name') {
        try {
            if (CONFIG.DEBUG) console.log(`🔐 로그인 시도: ${identifier} (${loginType})`);

            // 1. 관리자 하드코딩 로그인 (비상용/초기설정용)
            if (identifier === 'admin') {
                if (password === 'gde1107!') {
                    this.currentUser = {
                        employeeId: 'admin',
                        name: '시스템 관리자',
                        department: '행정관리팀',
                        position: '관장',
                        role: 'admin',
                        email: 'admin@dongul.or.kr',
                        loginTime: new Date().toISOString()
                    };
                    this._saveSession();
                    if (CONFIG.DEBUG) console.log('✅ 관리자 로그인 성공 (Fallback)');
                    return this.currentUser;
                } else {
                    throw new Error('비밀번호가 일치하지 않습니다.');
                }
            }

            // Google Sheets에서 직원 정보 조회
            // loginType에 따라 검색 컬럼 결정
            const searchColumn = loginType === 'id' ? 'employee_id' : 'name';

            const employee = await api.findRow(
                CONFIG.SHEET_NAMES.EMPLOYEES,
                searchColumn,
                identifier
            );

            if (!employee) {
                throw new Error('존재하지 않는 사용자입니다.');
            }

            // 비밀번호 검증
            const passwordHash = this._hashPassword(password);
            if (employee.password_hash !== passwordHash) {
                throw new Error('비밀번호가 일치하지 않습니다.');
            }

            // 세션 정보 생성
            this.currentUser = {
                employeeId: employee.employee_id,
                name: employee.name,
                department: employee.department,
                position: employee.position,
                role: employee.role,
                email: employee.email,
                loginTime: new Date().toISOString()
            };

            // localStorage에 세션 저장
            this._saveSession();

            if (CONFIG.DEBUG) {
                console.log('✅ 로그인 성공:', this.currentUser.name);
            }

            return this.currentUser;

        } catch (error) {
            console.error('❌ 로그인 실패:', error);
            throw error;
        }
    }

    /**
     * 로그아웃
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.SESSION_KEY);
        if (CONFIG.DEBUG) console.log('👋 로그아웃');
        this._redirectToLogin();
    }

    /**
     * 로그인 페이지로 리다이렉트
     */
    _redirectToLogin() {
        const path = window.location.pathname;
        // admin이나 evaluation 등 하위 디렉토리에 있는 경우 상위 경로로 이동
        if (path.includes('/admin/') || path.includes('/evaluation/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * 세션 복원 (페이지 새로고침 시)
     */
    restoreSession() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
            try {
                this.currentUser = JSON.parse(sessionData);

                // 세션 만료 확인 (24시간)
                const loginTime = new Date(this.currentUser.loginTime);
                const now = new Date();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

                if (hoursDiff > 24) {
                    if (CONFIG.DEBUG) console.log('⏰ 세션 만료');
                    this.logout();
                    return false;
                }

                if (CONFIG.DEBUG) {
                    console.log('✅ 세션 복원:', this.currentUser.name);
                }
                return true;

            } catch (error) {
                console.error('❌ 세션 복원 실패:', error);
                localStorage.removeItem(this.SESSION_KEY);
                return false;
            }
        }
        return false;
    }

    /**
     * 로그인 여부 확인
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * 현재 사용자 정보 가져오기
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 권한 확인
     * @param {string} requiredRole - 필요한 역할 (admin, director, manager, staff)
     */
    hasRole(requiredRole) {
        if (!this.currentUser) return false;

        const roleHierarchy = {
            'admin': 4,
            'director': 3,
            'manager': 2,
            'staff': 1
        };

        const userRoleLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        return userRoleLevel >= requiredRoleLevel;
    }

    /**
     * 관리자 여부 (시스템 관리자)
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    /**
     * 관장/사무국장급 여부 (전체 열람 가능)
     */
    isDirector() {
        return this.hasRole('director');
    }

    /**
     * 팀장급 여부 (팀 열람 가능)
     */
    isManager() {
        return this.hasRole('manager');
    }

    /**
     * 특정 직원의 평가를 볼 수 있는지 확인
     * @param {Object} targetUser - 대상 직원 정보 (employee_id, department 등)
     * @param {string} evaluationType - 평가 유형 ('comprehensive', 'performance', 'competency', etc.)
     */
    canViewEvaluation(targetUser, evaluationType = null) {
        if (!this.currentUser) return false;

        // 1. 본인인 경우
        if (this.currentUser.employeeId === targetUser.employee_id) {
            // 종합평가는 본인도 볼 수 없음
            if (evaluationType === 'comprehensive') {
                return false;
            }
            return true;
        }

        // 2. 관리자 또는 관장/사무국장인 경우 (전체 열람)
        if (this.isAdmin() || this.isDirector()) {
            return true;
        }

        // 3. 팀장인 경우 (같은 부서 팀원 열람)
        if (this.isManager() && this.currentUser.department === targetUser.department) {
            return true;
        }

        return false;
    }

    /**
     * 종합평가 조회 권한 확인
     * @param {Object} targetUser - 대상 직원 정보
     */
    canViewComprehensiveEvaluation(targetUser) {
        if (!this.currentUser) return false;

        // 본인의 종합평가는 절대 볼 수 없음
        if (this.currentUser.employeeId === targetUser.employee_id) {
            return false;
        }

        // 관리자, 관장, 사무국장만 타인의 종합평가 조회 가능
        if (this.isAdmin() || this.isDirector()) {
            return true;
        }

        // 팀장은 본인 팀원의 종합평가 조회 가능
        if (this.isManager() && this.currentUser.department === targetUser.department) {
            return true;
        }

        return false;
    }

    /**
     * 비밀번호 재설정 권한 확인 (관리자만)
     */
    canResetPassword() {
        return this.isAdmin();
    }

    /**
     * 권한 관리 권한 확인 (관리자만)
     */
    canManagePermissions() {
        return this.isAdmin();
    }

    /**
     * 페이지 접근 권한 확인 (페이지 로드 시 호출)
     * @param {string} requiredRole - 필요한 역할
     */
    checkPageAccess(requiredRole = null) {
        // 로그인 확인
        if (!this.restoreSession()) {
            // 현재 페이지가 index.html이 아니면 리다이렉트
            if (!window.location.pathname.endsWith('index.html') &&
                !window.location.pathname.endsWith('/')) {
                this._redirectToLogin();
                return false;
            }
        }

        // 역할 확인
        if (requiredRole && !this.hasRole(requiredRole)) {
            alert('접근 권한이 없습니다.');
            window.location.href = 'dashboard.html';
            return false;
        }

        return true;
    }

    /**
     * 비밀번호 해시 (SHA-256)
     */
    async _hashPassword(password) {
        // 간단한 해시 함수 (실제 운영 환경에서는 더 강력한 해싱 필요)
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'assessment_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * 비밀번호 해시 (동기 버전 - 호환성용)
     */
    _hashPassword(password) {
        // 간단한 해시 (Base64 인코딩)
        // 주의: 실제 운영 환경에서는 더 강력한 해싱 알고리즘 사용 필요
        const salt = 'assessment_salt_2024';
        const combined = password + salt;
        return btoa(combined);
    }

    /**
     * 세션 저장
     */
    _saveSession() {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentUser));
    }

    /**
     * 비밀번호 변경
     * @param {string} oldPassword - 현재 비밀번호
     * @param {string} newPassword - 새 비밀번호
     */
    async changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 현재 비밀번호 확인
            const employee = await api.findRow(
                CONFIG.SHEET_NAMES.EMPLOYEES,
                'employee_id',
                this.currentUser.employeeId
            );

            const oldPasswordHash = this._hashPassword(oldPassword);
            if (employee.password_hash !== oldPasswordHash) {
                throw new Error('현재 비밀번호가 일치하지 않습니다.');
            }

            // 새 비밀번호 해시
            const newPasswordHash = this._hashPassword(newPassword);

            // 업데이트
            await api.updateRow(
                CONFIG.SHEET_NAMES.EMPLOYEES,
                'employee_id',
                this.currentUser.employeeId,
                { password_hash: newPasswordHash }
            );

            if (CONFIG.DEBUG) console.log('✅ 비밀번호 변경 성공');
            return true;

        } catch (error) {
            console.error('❌ 비밀번호 변경 실패:', error);
            throw error;
        }
    }

    /**
     * 회원가입
     * @param {Object} userData - 사용자 정보
     */
    async register(userData) {
        try {
            // 비밀번호 해시
            const passwordHash = this._hashPassword(userData.password);

            // 클라이언트 측 중복 검사 (UX 향상)
            try {
                const employees = await api.readSheet(CONFIG.SHEET_NAMES.EMPLOYEES);
                const isDuplicate = employees.some(emp =>
                    emp.name === userData.name &&
                    emp.department === userData.department &&
                    emp.join_date === userData.joinDate
                );

                if (isDuplicate) {
                    throw new Error('이미 가입된 사용자입니다. (이름, 부서, 입사일 중복)');
                }
            } catch (readError) {
                // 읽기 실패해도 가입 시도는 계속 진행 (서버 측에서 다시 검증하므로)
                console.warn('중복 검사 중 오류 (무시됨):', readError);
            }

            // 전송할 데이터 준비
            const dataToSend = {
                ...userData,
                password: passwordHash // 해시된 비밀번호로 교체
            };

            // Apps Script 호출
            if (CONFIG.USE_APPS_SCRIPT) {
                const response = await api._callAppsScript('register', { userData: dataToSend }, 'POST');
                return response;
            } else {
                throw new Error('회원가입은 Apps Script 연동이 필요합니다.');
            }

        } catch (error) {
            console.error('❌ 회원가입 실패:', error);
            throw error;
        }
    }
}

// 전역 인증 관리자 인스턴스
const auth = new AuthManager();
