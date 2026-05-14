// API 基礎 URL
const API_URL = '/api';

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    loadPrices();
    setupEventListeners();
});

// 設置預設日期為今天
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// 設置事件監聽器
function setupEventListeners() {
    document.getElementById('priceForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
}

// 表單提交
async function handleFormSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);

    if (!date || !name || isNaN(price)) {
        showMessage('請填入所有必填欄位', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/prices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, name, price })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '新增失敗');
        }

        showMessage('物價記錄新增成功！', 'success');
        document.getElementById('priceForm').reset();
        setDefaultDate();
        loadPrices();
    } catch (error) {
        console.error('Error:', error);
        showMessage('新增失敗：' + error.message, 'error');
    }
}

// 載入物價資料
async function loadPrices(searchName = '') {
    try {
        let url = `${API_URL}/prices`;
        if (searchName) {
            url += `?name=${encodeURIComponent(searchName)}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.message === 'success' && result.data) {
            displayPrices(result.data);
            calculateStats(result.data);
        } else {
            throw new Error('無法取得資料');
        }
    } catch (error) {
        console.error('Error loading prices:', error);
        showMessage('載入資料失敗', 'error');
        document.getElementById('tableBody').innerHTML = 
            '<tr><td colspan="4" class="empty-message">無法載入資料</td></tr>';
    }
}

// 顯示物價資料
function displayPrices(prices) {
    const tableBody = document.getElementById('tableBody');
    
    if (!prices || prices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="empty-message">目前沒有記錄</td></tr>';
        document.getElementById('totalCount').textContent = '0';
        return;
    }

    tableBody.innerHTML = prices.map(price => `
        <tr>
            <td>${formatDate(price.date)}</td>
            <td>${escapeHtml(price.name)}</td>
            <td>NT$${formatNumber(price.price)}</td>
            <td>${formatDateTime(price.created_at)}</td>
        </tr>
    `).join('');

    document.getElementById('totalCount').textContent = prices.length;
}

// 計算統計資訊
function calculateStats(prices) {
    if (!prices || prices.length === 0) {
        document.getElementById('avgPrice').textContent = '-';
        document.getElementById('maxPrice').textContent = '-';
        document.getElementById('minPrice').textContent = '-';
        return;
    }

    const priceValues = prices.map(p => p.price);
    const avg = (priceValues.reduce((a, b) => a + b, 0) / priceValues.length).toFixed(0);
    const max = Math.max(...priceValues);
    const min = Math.min(...priceValues);

    document.getElementById('avgPrice').textContent = `NT$${formatNumber(avg)}`;
    document.getElementById('maxPrice').textContent = `NT$${formatNumber(max)}`;
    document.getElementById('minPrice').textContent = `NT$${formatNumber(min)}`;
}

// 搜尋
function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (searchInput) {
        loadPrices(searchInput);
    } else {
        showMessage('請輸入搜尋關鍵字', 'error');
    }
}

// 重置搜尋
function handleReset() {
    document.getElementById('searchInput').value = '';
    loadPrices();
}

// 顯示訊息
function showMessage(message, type) {
    // 移除舊訊息
    const oldMessage = document.querySelector('.message');
    if (oldMessage) {
        oldMessage.remove();
    }

    // 創建新訊息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // 插入到頁面頂部
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);

    // 3秒後自動移除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 日期格式化
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
}

// 日期時間格式化
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-TW');
}

// 數字格式化（加千位分隔符）
function formatNumber(num) {
    return parseFloat(num).toLocaleString('zh-TW');
}

// HTML 轉義（防止 XSS）
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
