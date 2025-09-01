// 全局变量
let currentFile = null;
let processedData = null;

// DOM元素
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const fileInfo = document.getElementById('fileInfo');
const processSection = document.getElementById('processSection');
const processBtn = document.getElementById('processBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const resultInfo = document.getElementById('resultInfo');
const previewTable = document.getElementById('previewTable');
const downloadBtn = document.getElementById('downloadBtn');

// 事件监听器
fileInput.addEventListener('change', handleFileSelect);
processBtn.addEventListener('click', processData);

// 拖拽上传功能
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件
function handleFile(file) {
    // 验证文件类型
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showError('请选择Excel文件（.xlsx或.xls格式）');
        return;
    }
    
    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
        showError('文件大小不能超过10MB');
        return;
    }
    
    currentFile = file;
    
    // 显示文件信息
    fileInfo.innerHTML = `
        <div>
            <strong>文件名：</strong>${file.name}<br>
            <strong>文件大小：</strong>${formatFileSize(file.size)}<br>
            <strong>修改时间：</strong>${new Date(file.lastModified).toLocaleString()}
        </div>
    `;
    fileInfo.style.display = 'block';
    
    // 显示处理按钮
    processSection.style.display = 'block';
    
    // 隐藏之前的结果
    hideError();
    resultSection.style.display = 'none';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理数据
async function processData() {
    if (!currentFile) {
        showError('请先选择文件');
        return;
    }
    
    try {
        // 显示加载状态
        loading.style.display = 'block';
        processBtn.disabled = true;
        hideError();
        
        // 读取Excel文件
        const result = await readExcelFile(currentFile);
        
        // 解析和转换数据
        processedData = transformData(result.data);
        
        // 显示结果
        displayResults(processedData, result.sheetName);
        
    } catch (err) {
        showError('处理文件时发生错误：' + err.message);
    } finally {
        loading.style.display = 'none';
        processBtn.disabled = false;
    }
}

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 智能选择工作表
                let targetSheetName;
                if (workbook.SheetNames.length === 0) {
                    reject(new Error('Excel文件中没有任何工作表'));
                    return;
                }
                
                // 优先使用Sheet1，如果没有就使用第一个工作表
                if (workbook.SheetNames.includes('Sheet1')) {
                    targetSheetName = 'Sheet1';
                } else {
                    targetSheetName = workbook.SheetNames[0];
                    // 如果有多个工作表，在控制台提示用户
                    if (workbook.SheetNames.length > 1) {
                        console.log(`文件包含多个工作表：${workbook.SheetNames.join(', ')}`);
                        console.log(`未找到Sheet1，自动使用第一个工作表：${targetSheetName}`);
                    } else {
                        console.log(`自动使用工作表：${targetSheetName}`);
                    }
                }
                
                // 读取目标工作表数据
                const worksheet = workbook.Sheets[targetSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,
                    defval: '' 
                });
                
                resolve({
                    data: jsonData,
                    sheetName: targetSheetName
                });
            } catch (err) {
                reject(new Error(`无法读取Excel文件：${err.message}。请确保文件格式正确且未损坏。`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('文件读取失败。请检查文件是否完整或尝试重新选择文件。'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// 转换数据
function transformData(rawData) {
    if (rawData.length < 2) {
        throw new Error('Excel文件数据不足。请确保文件包含表头和至少一行数据。');
    }
    
    const results = [];
    
    // 从第2行开始处理数据（跳过表头），保持原始顺序，不去重
    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (row.length < 6) continue; // 确保有足够的列
        
        const specification = row[5]; // 项目/物料描述列
        if (!specification || typeof specification !== 'string') continue;
        
        try {
            const parsed = parseCableSpecification(specification);
            if (parsed) {
                results.push(parsed);
            }
        } catch (err) {
            console.warn(`解析规格失败: ${specification}`, err);
        }
    }
    
    if (results.length === 0) {
        throw new Error(`未找到有效的电缆规格数据。请确保：
1. 数据从第2行开始（第1行为表头）
2. 第6列包含电缆规格（格式：ZC-电缆类型-电压等级-规格）
3. 电缆规格包含支持的电压格式（如：0.6/1kV、6/10kV、450/750V等）
4. 当前使用的工作表：${rawData.length > 0 ? '有数据' : '无数据'}`);
    }
    
    // 不排序！保持原始顺序输出26条记录
    return results;
}

// 解析电缆规格
function parseCableSpecification(spec) {
    if (!spec || typeof spec !== 'string') return null;
    
    // 检查格式是否是 ZC- 开头
    if (!spec.startsWith('ZC-')) return null;
    
    // 定义已知的电压格式模式和对应的标准化值
    const voltagePatterns = [
        { pattern: /6\/10kV/, normalized: '6/10kV' },
        { pattern: /0\.6\/1kV/i, normalized: '0.6/1kV' }, // i标志忽略大小写
        { pattern: /0\.45\/0\.75KV/, normalized: '450/750V' },
        { pattern: /0\.3-0\.5KV/, normalized: '300/500V' }, // 连字符格式
        { pattern: /0\.3\/0\.5KV/, normalized: '300/500V' }, // 斜杠格式
        { pattern: /450\/750V/, normalized: '450/750V' }
    ];
    
    // 找到电压部分的位置和值
    let voltageValue = null;
    let voltageStart = -1;
    let voltageEnd = -1;
    
    for (const vPattern of voltagePatterns) {
        const match = spec.match(vPattern.pattern);
        if (match) {
            voltageValue = vPattern.normalized;
            voltageStart = match.index;
            voltageEnd = match.index + match[0].length;
            break;
        }
    }
    
    if (!voltageValue) return null;
    
    // 基于电压位置分割字符串
    const beforeVoltage = spec.substring(0, voltageStart);
    const afterVoltage = spec.substring(voltageEnd);
    
    // 提取电缆类型（ZC- 和 电压之间的部分，去掉最后的连字符）
    const cableTypePart = beforeVoltage.substring(3); // 去掉 "ZC-"
    const cableType = cableTypePart.endsWith('-') ? 
        cableTypePart.substring(0, cableTypePart.length - 1) : cableTypePart;
    
    // 提取规格（电压之后的部分，去掉开头的连字符）
    const specification = afterVoltage.startsWith('-') ? 
        afterVoltage.substring(1) : afterVoltage;
    
    // 特殊处理：DJYPVPR的组合应该是ZC-DJYPVRP
    let combinedType;
    if (cableType === 'DJYPVPR') {
        combinedType = 'ZC-DJYPVRP';
    } else {
        combinedType = `ZC-${cableType}`;
    }
    
    return {
        prefix: 'ZC',
        cableType: cableType,
        combined: combinedType,
        voltage: voltageValue,
        specification: normalizeSpecification(specification)
    };
}

// 标准化规格
function normalizeSpecification(spec) {
    // 去除末尾的.0
    return spec.replace(/\.0+$/, '');
}

// 显示结果
function displayResults(data, sheetName = 'Sheet1') {
    const sheetInfo = sheetName !== 'Sheet1' ? ` (使用工作表: ${sheetName})` : '';
    resultInfo.textContent = `共处理 ${data.length} 条电缆规格记录，转换完成！${sheetInfo}`;
    
    // 统计信息
    const cableTypes = [...new Set(data.map(item => item.cableType))];
    const voltageTypes = [...new Set(data.map(item => item.voltage))];
    
    document.getElementById('totalRecords').textContent = data.length;
    document.getElementById('cableTypes').textContent = cableTypes.length;
    document.getElementById('voltageTypes').textContent = voltageTypes.length;
    
    // 生成预览表格
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>序号</th>
                    <th>前缀</th>
                    <th>电缆类型</th>
                    <th>组合型号</th>
                    <th>电压等级</th>
                    <th>规格</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach((item, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.prefix}</td>
                <td>${item.cableType}</td>
                <td>${item.combined}</td>
                <td>${item.voltage}</td>
                <td>${item.specification}</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    previewTable.innerHTML = tableHTML;
    
    // 准备下载
    prepareDownload(data);
    
    // 显示结果区域
    resultSection.style.display = 'block';
}

// 准备下载
function prepareDownload(data) {
    // 创建新的工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据 - 直接使用转换后的数据，不添加额外表头
    const wsData = [];
    
    data.forEach(item => {
        wsData.push([
            item.prefix,
            item.cableType,
            item.combined,
            item.voltage,
            item.specification
        ]);
    });
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 设置列宽
    ws['!cols'] = [
        { wch: 8 },  // 前缀
        { wch: 15 }, // 电缆类型
        { wch: 20 }, // 组合型号
        { wch: 15 }, // 电压等级
        { wch: 15 }  // 规格
    ];
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet2');
    
    // 生成下载链接
    downloadBtn.onclick = () => {
        try {
            XLSX.writeFile(wb, '转换结果.xlsx');
        } catch (err) {
            showError('下载失败：' + err.message);
        }
    };
}

// 显示错误信息
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

// 隐藏错误信息
function hideError() {
    error.style.display = 'none';
}