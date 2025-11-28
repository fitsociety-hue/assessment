/**
 * Google Sheets API 연동 레이어
 * 
 * Google Sheets와 데이터를 주고받는 모든 기능을 제공합니다.
 * config.js의 설정에 따라 Google Apps Script 또는 직접 API 호출 방식을 사용합니다.
 */

class SheetsAPI {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    /**
     * 초기화 및 연결 테스트
     */
    async initialize() {
        try {
            if (CONFIG.DEBUG) console.log('🔌 Google Sheets API 초기화 중...');

            if (CONFIG.USE_APPS_SCRIPT) {
                return await this._initializeAppsScript();
            } else {
                return await this._initializeDirectAPI();
            }
        } catch (error) {
            console.error('❌ API 초기화 실패:', error);
            throw new Error('Google Sheets 연결에 실패했습니다. 설정을 확인해주세요.');
        }
    }

    /**
     * Apps Script 방식 초기화
     */
    async _initializeAppsScript() {
        if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
            throw new Error('Apps Script URL이 설정되지 않았습니다. config.js를 확인하세요.');
        }

        // 연결 테스트
        const response = await this._callAppsScript('ping', {}, 'GET');
        if (response.status === 'ok') {
            if (CONFIG.DEBUG) console.log('✅ Apps Script 연결 성공');
            return true;
        }
        throw new Error('Apps Script 응답이 올바르지 않습니다.');
    }

    /**
     * 직접 API 방식 초기화
     */
    async _initializeDirectAPI() {
        if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('Google API Key가 설정되지 않았습니다. config.js를 확인하세요.');
        }

        if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
            throw new Error('Spreadsheet ID가 설정되지 않았습니다. config.js를 확인하세요.');
        }

        // Google Sheets API 로드
        await this._loadGoogleAPI();
        if (CONFIG.DEBUG) console.log('✅ Google Sheets API 연결 성공');
        return true;
    }

    /**
     * Google API 라이브러리 동적 로드
     */
    _loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE_API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                    });
                    resolve();
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Apps Script 호출 헬퍼
     */
    /**
     * Apps Script 호출 헬퍼
     */
    async _callAppsScript(action, data = {}, method = 'POST') {
        let url = `${CONFIG.APPS_SCRIPT_URL}`;

        // 기본 데이터에 action 추가
        const payload = { ...data, action };

        const options = {
            method: method,
            headers: {}
        };

        if (method === 'GET') {
            // GET 요청: 쿼리 스트링으로 변환
            const queryString = Object.keys(payload)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`)
                .join('&');
            url += `?${queryString}`;
        } else {
            // POST 요청: text/plain으로 전송 (CORS Preflight 방지)
            options.headers['Content-Type'] = 'text/plain;charset=utf-8';
            options.body = JSON.stringify(payload);
        }

        if (CONFIG.DEBUG) console.log(`📡 API 호출: ${url}`, options);

        return await this._retryFetch(url, options);
    }

    /**
     * 재시도 로직이 포함된 fetch
     */
    async _retryFetch(url, options, retryCount = 0) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            // 네트워크 에러 (CORS, 오프라인 등) 처리
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.error('🚨 네트워크 오류 발생 (CORS 또는 연결 문제):', error);
                // 첫 번째 시도에서 바로 실패하면 재시도하지 않고 사용자에게 알림을 줄 수도 있음
                // 하지만 일시적인 문제일 수 있으므로 재시도 로직은 유지
            }

            if (retryCount < CONFIG.RETRY_CONFIG.MAX_RETRIES) {
                const delay = CONFIG.RETRY_CONFIG.RETRY_DELAY *
                    Math.pow(CONFIG.RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount);

                if (CONFIG.DEBUG) {
                    console.warn(`⚠️ API 호출 실패, ${delay}ms 후 재시도 (${retryCount + 1}/${CONFIG.RETRY_CONFIG.MAX_RETRIES})...`);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
                return this._retryFetch(url, options, retryCount + 1);
            }

            throw error;
        }
    }

    // ============================================================
    // 데이터 읽기 (READ)
    // ============================================================

    /**
     * 시트에서 전체 데이터 읽기
     * @param {string} sheetName - 시트 이름
     * @returns {Promise<Array>} 행 데이터 배열
     */
    async readSheet(sheetName) {
        const cacheKey = `sheet_${sheetName}`;

        // 1. 메모리 캐시 확인
        if (CONFIG.USE_CACHE && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                if (CONFIG.DEBUG) console.log(`📦 메모리 캐시에서 로드: ${sheetName}`);
                return cached.data;
            }
        }

        // 2. 세션 스토리지 캐시 확인 (새로고침 후에도 유지됨)
        if (CONFIG.USE_CACHE) {
            try {
                const sessionCached = sessionStorage.getItem(cacheKey);
                if (sessionCached) {
                    const cached = JSON.parse(sessionCached);
                    if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                        // 메모리 캐시 복구
                        this.cache.set(cacheKey, cached);
                        if (CONFIG.DEBUG) console.log(`💾 세션 스토리지에서 로드: ${sheetName}`);
                        return cached.data;
                    }
                }
            } catch (e) {
                console.warn('세션 스토리지 읽기 실패:', e);
            }
        }

        try {
            let data;

            if (CONFIG.USE_APPS_SCRIPT) {
                const response = await this._callAppsScript('read', { sheetName }, 'GET');
                data = response.data;
            } else {
                data = await this._readSheetDirectAPI(sheetName);
            }

            // 캐시 저장 (메모리 + 세션 스토리지)
            if (CONFIG.USE_CACHE) {
                const cacheData = {
                    data,
                    timestamp: Date.now()
                };
                this.cache.set(cacheKey, cacheData);

                // 세션 스토리지에도 저장 (새로고침 시 유지)
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                } catch (e) {
                    console.warn('세션 스토리지 저장 실패 (용량 초과 가능성):', e);
                }
            }

            if (CONFIG.DEBUG) console.log(`📖 시트 읽기 성공: ${sheetName} (${data.length}행)`);
            return data;

        } catch (error) {
            console.error(`❌ 시트 읽기 실패 (${sheetName}):`, error);
            throw error;
        }
    }

    /**
     * 직접 API로 시트 읽기
     */
    async _readSheetDirectAPI(sheetName) {
        const range = `${sheetName}!A1:ZZ`;
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range
        });

        return response.result.values || [];
    }

    /**
     * 특정 행 찾기
     * @param {string} sheetName - 시트 이름
     * @param {string} columnName - 컬럼 이름
     * @param {any} value - 찾을 값
     * @returns {Promise<Object|null>} 찾은 행 객체 또는 null
     */
    async findRow(sheetName, columnName, value) {
        const rows = await this.readSheet(sheetName);
        if (rows.length === 0) return null;

        const headers = rows[0];
        const columnIndex = headers.indexOf(columnName);

        if (columnIndex === -1) {
            throw new Error(`컬럼을 찾을 수 없습니다: ${columnName}`);
        }

        for (let i = 1; i < rows.length; i++) {
            const cellValue = rows[i][columnIndex];
            // Exact match or case-insensitive match for strings
            if (cellValue === value ||
                (typeof cellValue === 'string' && typeof value === 'string' &&
                    cellValue.toLowerCase() === value.toLowerCase())) {
                return this._rowToObject(headers, rows[i]);
            }
        }

        return null;
    }

    /**
     * 조건에 맞는 모든 행 찾기
     * @param {string} sheetName - 시트 이름
     * @param {Function} filterFn - 필터 함수
     * @returns {Promise<Array>} 찾은 행 객체 배열
     */
    async findRows(sheetName, filterFn) {
        const rows = await this.readSheet(sheetName);
        if (rows.length === 0) return [];

        const headers = rows[0];
        const results = [];

        for (let i = 1; i < rows.length; i++) {
            const obj = this._rowToObject(headers, rows[i]);
            if (filterFn(obj)) {
                results.push(obj);
            }
        }

        return results;
    }

    // ============================================================
    // 데이터 쓰기 (WRITE)
    // ============================================================

    /**
     * 새 행 추가
     * @param {string} sheetName - 시트 이름
     * @param {Object} data - 추가할 데이터 객체
     * @returns {Promise<boolean>} 성공 여부
     */
    async appendRow(sheetName, data) {
        try {
            // 헤더 가져오기
            const rows = await this.readSheet(sheetName);
            if (rows.length === 0) {
                throw new Error(`시트가 비어있습니다: ${sheetName}`);
            }

            const headers = rows[0];
            const values = headers.map(header => data[header] || '');

            if (CONFIG.USE_APPS_SCRIPT) {
                await this._callAppsScript('append', { sheetName, values });
            } else {
                await this._appendRowDirectAPI(sheetName, values);
            }

            // 캐시 무효화
            this._invalidateCache(sheetName);

            if (CONFIG.DEBUG) console.log(`✅ 행 추가 성공: ${sheetName}`);
            return true;

        } catch (error) {
            console.error(`❌ 행 추가 실패 (${sheetName}):`, error);
            throw error;
        }
    }

    /**
     * 직접 API로 행 추가
     */
    async _appendRowDirectAPI(sheetName, values) {
        const range = `${sheetName}!A:A`;
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values]
            }
        });
    }

    /**
     * 특정 행 업데이트
     * @param {string} sheetName - 시트 이름
     * @param {string} idColumn - ID 컬럼 이름
     * @param {any} idValue - ID 값
     * @param {Object} data - 업데이트할 데이터
     * @returns {Promise<boolean>} 성공 여부
     */
    async updateRow(sheetName, idColumn, idValue, data) {
        try {
            const rows = await this.readSheet(sheetName);
            if (rows.length === 0) {
                throw new Error(`시트가 비어있습니다: ${sheetName}`);
            }

            const headers = rows[0];
            const idColumnIndex = headers.indexOf(idColumn);

            if (idColumnIndex === -1) {
                throw new Error(`ID 컬럼을 찾을 수 없습니다: ${idColumn}`);
            }

            // 업데이트할 행 찾기
            let rowIndex = -1;
            for (let i = 1; i < rows.length; i++) {
                // Loose equality check to handle string/number differences
                if (rows[i][idColumnIndex] == idValue) {
                    rowIndex = i;
                    break;
                }
            }

            if (rowIndex === -1) {
                throw new Error(`행을 찾을 수 없습니다: ${idColumn}=${idValue}`);
            }

            // 업데이트할 값 준비
            const values = headers.map(header =>
                data.hasOwnProperty(header) ? data[header] : rows[rowIndex][headers.indexOf(header)] || ''
            );

            if (CONFIG.USE_APPS_SCRIPT) {
                await this._callAppsScript('update', {
                    sheetName,
                    rowIndex: rowIndex + 1, // 1-based index
                    values
                });
            } else {
                await this._updateRowDirectAPI(sheetName, rowIndex + 1, values);
            }

            // 캐시 무효화
            this._invalidateCache(sheetName);

            if (CONFIG.DEBUG) console.log(`✅ 행 업데이트 성공: ${sheetName} (행 ${rowIndex + 1})`);
            return true;

        } catch (error) {
            console.error(`❌ 행 업데이트 실패 (${sheetName}):`, error);
            throw error;
        }
    }

    /**
     * 직접 API로 행 업데이트
     */
    async _updateRowDirectAPI(sheetName, rowIndex, values) {
        const range = `${sheetName}!A${rowIndex}:ZZ${rowIndex}`;
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values]
            }
        });
    }

    /**
     * 특정 행 삭제
     * @param {string} sheetName - 시트 이름
     * @param {string} idColumn - ID 컬럼 이름
     * @param {any} idValue - ID 값
     * @returns {Promise<boolean>} 성공 여부
     */
    async deleteRow(sheetName, idColumn, idValue) {
        try {
            if (CONFIG.USE_APPS_SCRIPT) {
                // 1. 먼저 로컬에서 해당 행을 찾아 실제 ID 값(타입 포함)을 확인
                const rows = await this.readSheet(sheetName);
                if (rows.length === 0) throw new Error(`시트가 비어있습니다: ${sheetName}`);

                const headers = rows[0];
                const idColumnIndex = headers.indexOf(idColumn);
                if (idColumnIndex === -1) throw new Error(`ID 컬럼을 찾을 수 없습니다: ${idColumn}`);

                let actualIdValue = idValue;
                let found = false;

                for (let i = 1; i < rows.length; i++) {
                    // Loose equality check
                    if (rows[i][idColumnIndex] == idValue) {
                        actualIdValue = rows[i][idColumnIndex]; // 시트에 저장된 실제 값(타입) 사용
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    throw new Error(`삭제할 행을 찾을 수 없습니다: ${idColumn}=${idValue}`);
                }

                // 2. 실제 값으로 삭제 요청
                await this._callAppsScript('delete', { sheetName, idColumn, idValue: actualIdValue });
            } else {
                // 직접 API로는 삭제가 복잡하므로 Apps Script 사용 권장
                throw new Error('행 삭제는 Apps Script 방식에서만 지원됩니다.');
            }

            // 캐시 무효화
            this._invalidateCache(sheetName);

            if (CONFIG.DEBUG) console.log(`✅ 행 삭제 성공: ${sheetName}`);
            return true;

        } catch (error) {
            console.error(`❌ 행 삭제 실패 (${sheetName}):`, error);
            throw error;
        }
    }

    // ============================================================
    // 헬퍼 함수
    // ============================================================

    /**
     * 배열을 객체로 변환
     */
    _rowToObject(headers, row) {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || '';
        });
        return obj;
        if (CONFIG.DEBUG) console.log('🗑️ 전체 캐시 삭제');
    }

    /**
     * 고유 ID 생성
     */
    generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${timestamp}${random}`;
    }



    /**
     * 현재 시간 (ISO 형식)
     */
    getCurrentTimestamp() {
        return new Date().toISOString();
    }
    /**
     * 설정 값 가져오기
     * @param {string} key 설정 키
     * @returns {Promise<string|null>} 설정 값
     */
    async getSetting(key) {
        try {
            const settings = await this.readSheet(CONFIG.SHEET_NAMES.SETTINGS);
            // 첫 번째 행은 헤더(Key, Value)라고 가정
            const row = settings.find(r => r[0] === key);
            return row ? row[1] : null;
        } catch (error) {
            console.warn(`설정(${key}) 로드 실패:`, error);
            return null;
        }
    }

    /**
     * 설정 값 저장하기
     * @param {string} key 설정 키
     * @param {string} value 설정 값
     */
    async setSetting(key, value) {
        try {
            const settings = await this.readSheet(CONFIG.SHEET_NAMES.SETTINGS);

            // If sheet is empty or has no data
            if (!settings || settings.length === 0) {
                // Try to append with default headers if empty
                await this.appendRow(CONFIG.SHEET_NAMES.SETTINGS, { Key: key, Value: value });
                return;
            }

            const headers = settings[0];
            // Assume first column is Key, second is Value if not explicitly named 'Key'/'Value'
            let keyCol = 'Key';
            let valCol = 'Value';

            // Try to find case-insensitive matches
            const foundKey = headers.find(h => h.toLowerCase() === 'key');
            if (foundKey) keyCol = foundKey;
            else if (headers.length > 0) keyCol = headers[0]; // Fallback to first column

            const foundVal = headers.find(h => h.toLowerCase() === 'value');
            if (foundVal) valCol = foundVal;
            else if (headers.length > 1) valCol = headers[1]; // Fallback to second column

            // Find row index by key
            const keyColIndex = headers.indexOf(keyCol);
            const rowIndex = settings.findIndex(r => r[keyColIndex] === key);

            if (rowIndex >= 0) {
                // Update
                const updateData = {};
                updateData[valCol] = value;
                await this.updateRow(CONFIG.SHEET_NAMES.SETTINGS, keyCol, key, updateData);
            } else {
                // Append
                const appendData = {};
                appendData[keyCol] = key;
                appendData[valCol] = value;
                await this.appendRow(CONFIG.SHEET_NAMES.SETTINGS, appendData);
            }
        } catch (error) {
            console.error(`설정(${key}) 저장 실패:`, error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
const api = new SheetsAPI();
