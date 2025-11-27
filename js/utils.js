/**
 * 유틸리티 함수 모음
 */

const utils = {
    /**
     * 날짜 포맷팅 (YYYY-MM-DD)
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 날짜시간 포맷팅 (YYYY-MM-DD HH:MM:SS)
     */
    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        const datePart = this.formatDate(d);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${datePart} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * 숫자를 퍼센트로 포맷팅
     */
    formatPercent(value, decimals = 1) {
        if (value === null || value === undefined) return '-';
        return `${Number(value).toFixed(decimals)}%`;
    },

    /**
     * 숫자를 점수로 포맷팅
     */
    formatScore(value, maxScore = null) {
        if (value === null || value === undefined) return '-';
        const score = Number(value).toFixed(1);
        return maxScore ? `${score}/${maxScore}` : score;
    },

    /**
     * 등급 계산
     */
    calculateGrade(totalScore) {
        for (const [grade, criteria] of Object.entries(CONFIG.GRADE_CRITERIA)) {
            if (totalScore >= criteria.min && totalScore <= criteria.max) {
                return {
                    grade,
                    label: criteria.label,
                    coefficient: criteria.coefficient,
                    score: totalScore
                };
            }
        }
        return { grade: 'D', label: '미흡', coefficient: 0.7, score: totalScore };
    },

    /**
     * 달성률 계산
     */
    calculateAchievementRate(target, result) {
        if (!target || target === 0) return 0;
        return (result / target) * 100;
    },

    /**
     * 평균 계산
     */
    average(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, val) => acc + Number(val || 0), 0);
        return sum / numbers.length;
    },

    /**
     * 합계 계산
     */
    sum(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        return numbers.reduce((acc, val) => acc + Number(val || 0), 0);
    },

    /**
     * 폼 데이터를 객체로 변환
     */
    formToObject(formElement) {
        const formData = new FormData(formElement);
        const obj = {};
        for (const [key, value] of formData.entries()) {
            obj[key] = value;
        }
        return obj;
    },

    /**
     * 객체를 폼에 채우기
     */
    objectToForm(formElement, data) {
        for (const [key, value] of Object.entries(data)) {
            const input = formElement.elements[key];
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value === true || value === 'true' || value === '1';
                } else if (input.type === 'radio') {
                    const radio = formElement.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value || '';
                }
            }
        }
    },

    /**
     * 로딩 표시
     */
    showLoading(message = '처리 중...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'loader';
            loader.innerHTML = `
        <div class="loader-content">
          <div class="spinner"></div>
          <p class="loader-message">${message}</p>
        </div>
      `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loader-message').textContent = message;
        }
        loader.style.display = 'flex';
    },

    /**
     * 로딩 숨기기
     */
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },

    /**
     * 알림 표시
     */
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
      <span class="alert-message">${message}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;

        const container = document.getElementById('alert-container');
        if (container) {
            container.appendChild(alertDiv);
        } else {
            document.body.insertBefore(alertDiv, document.body.firstChild);
        }

        // 자동 제거 (5초 후)
        setTimeout(() => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    },

    /**
     * 확인 다이얼로그
     */
    async confirm(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    },

    /**
     * 테이블 생성
     */
    createTable(headers, rows, options = {}) {
        const table = document.createElement('table');
        table.className = options.className || 'data-table';

        // 헤더
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 바디
        const tbody = document.createElement('tbody');
        rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    },

    /**
     * CSV 다운로드
     */
    downloadCSV(data, filename = 'data.csv') {
        if (!data || data.length === 0) {
            this.showAlert('다운로드할 데이터가 없습니다.', 'warning');
            return;
        }

        // CSV 문자열 생성
        const csvContent = data.map(row =>
            row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // 다운로드
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        this.showAlert('CSV 파일이 다운로드되었습니다.', 'success');
    },

    /**
     * 디바운스 (검색 입력 등에 사용)
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 입력 값 검증
     */
    validate: {
        email(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        required(value) {
            return value !== null && value !== undefined && value !== '';
        },

        number(value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        range(value, min, max) {
            const num = Number(value);
            return num >= min && num <= max;
        },

        minLength(value, length) {
            return String(value).length >= length;
        }
    },

    /**
     * 스크롤을 특정 요소로 이동
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * 사용자 정보 표시
     */
    displayUserInfo() {
        const user = auth.getCurrentUser();
        if (!user) return;

        const userInfoElements = document.querySelectorAll('.user-info');
        userInfoElements.forEach(el => {
            el.innerHTML = `
        <span class="user-name">${user.name}</span>
        <span class="user-position">${user.position}</span>
        <span class="user-department">${user.department}</span>
      `;
        });
    },

    /**
     * 관리자 메뉴 표시/숨김
     */
    toggleAdminMenu() {
        if (auth.isAdmin()) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = '';
            });
        } else {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    },

    /**
     * 자동 저장 설정
     */
    setupAutoSave(formElement, saveFunction) {
        let autoSaveTimer;

        const autoSave = () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(async () => {
                try {
                    await saveFunction();
                    this.showAlert('자동 저장되었습니다.', 'success');
                } catch (error) {
                    console.error('자동 저장 실패:', error);
                }
            }, CONFIG.AUTO_SAVE_INTERVAL);
        };

        formElement.addEventListener('input', autoSave);
        formElement.addEventListener('change', autoSave);

        return () => clearTimeout(autoSaveTimer);
    }
};

/**
 * 페이지 초기화 헬퍼
 */
async function initializePage(options = {}) {
    try {
        // 로딩 표시
        if (options.showLoading !== false) {
            utils.showLoading('페이지 로딩 중...');
        }

        // 인증 확인
        if (options.requireAuth !== false) {
            if (!auth.checkPageAccess(options.requiredRole)) {
                return;
            }
        }

        // Google Sheets API 초기화
        if (options.initAPI !== false) {
            await api.initialize();
        }

        // 사용자 정보 표시
        if (options.showUserInfo !== false) {
            utils.displayUserInfo();
        }

        // 관리자 메뉴 설정
        if (options.toggleAdminMenu !== false) {
            utils.toggleAdminMenu();
        }

        // 로딩 숨기기
        if (options.showLoading !== false) {
            utils.hideLoading();
        }

        if (CONFIG.DEBUG) console.log('✅ 페이지 초기화 완료');

    } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error);
        utils.hideLoading();
        utils.showAlert('페이지를 불러오는 중 오류가 발생했습니다.', 'error');
        throw error;
    }
}
