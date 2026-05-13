const express = require('express');
const app = express();
const path = require('path');

// 讓 Express 能夠解析表單傳過來的資料
app.use(express.urlencoded({ extended: true }));

// 模擬的牛排物價資料庫
let priceData = [
    { date: '2026-01-01', name: '肋眼牛排 (Ribeye)', price: 1200 },
    { date: '2026-02-15', name: '菲力牛排 (Filet)', price: 1500 },
    { date: '2026-03-10', name: '肋眼牛排 (Ribeye)', price: 1250 }
];

// 首頁：顯示輸入框、搜尋框與表格
app.get('/', (req, res) => {
    const keyword = req.query.keyword || ''; // 取得搜尋文字
    
    // 根據文字框內容過濾資料
    const filteredData = priceData.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase())
    );

    // 建立表格的 HTML 字串
    let rows = filteredData.map(item => 
        `<tr><td>${item.date}</td><td>${item.name}</td><td>$${item.price}</td></tr>`
    ).join('');

    // 完整的 HTML
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SteakTrack</title>
            <style>
                body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #8b0000; color: white; }
                .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                button { background: #8b0000; color: white; border: none; padding: 8px 15px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>🥩 SteakTrack：頂級牛排物價觀測站</h1>
            
            <div class="card">
                <h3>新增物價資料</h3>
                <form action="/add" method="POST">
                    日期：<input type="date" name="date" required>
                    名稱：<input type="text" name="name" placeholder="例如：肋眼" required>
                    價格：<input type="number" name="price" required>
                    <button type="submit">新增紀錄</button>
                </form>
            </div>

            <div class="card">
                <h3>簡易查詢</h3>
                <form action="/" method="GET">
                    搜尋商品：<input type="text" name="keyword" value="${keyword}" placeholder="輸入關鍵字...">
                    <button type="submit">過濾</button>
                    <a href="/"><button type="button" style="background:#666">清空</button></a>
                </form>
                <table>
                    <thead>
                        <tr><th>日期</th><th>商品名稱</th><th>價格 (TWD)</th></tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="3">找不到相關資料</td></tr>'}</tbody>
                </table>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});

// 處理新增資料的路由
app.post('/add', (req, res) => {
    const { date, name, price } = req.body;
    priceData.push({ date, name, price: parseInt(price) });
    res.redirect('/'); // 新增完後跳轉回首頁看結果
});

app.listen(3000, () => {
    console.log('SteakTrack 已啟動：http://localhost:3000');
});