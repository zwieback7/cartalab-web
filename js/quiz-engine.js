let config = null;
let currentQuestion = 0;
let typeScores = { A: 0, B: 0 };
let axesSum = {};

// 获取 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

// 测试大厅目录
const catalog = [
    { id: 'energy', title: '隐性能量图谱', desc: '测算你的能量吞吐阈值与精神内耗机制' },
    { id: 'career', title: '个体商业原型', desc: '解码你的变现基因与职场核心竞争力' },
    { id: 'habitat', title: '灵魂栖息地', desc: '寻找与你同频共振的理想生存场域' },
    { id: 'love', title: '亲密防御机制', desc: '透视你在关系中的潜意识恐惧与模式' },
    { id: 'shadow', title: '潜意识暗影特质', desc: '直面你极力隐藏的暗黑天赋与人格反面' },
    { id: 'car', title: '潜意识座驾匹配', desc: '测算你的性格基因最契合的新能源品牌' }
];

window.onload = () => {
    if (quizId) {
        loadQuizData(quizId);
    } else {
        renderCatalog();
    }
};

function renderCatalog() {
    const list = document.getElementById('catalog-list');
    catalog.forEach(item => {
        const a = document.createElement('a');
        a.href = `?id=${item.id}`;
        a.className = 'catalog-item';
        a.innerHTML = `<div class="catalog-title">${item.title}</div><div class="catalog-desc">${item.desc}</div>`;
        list.appendChild(a);
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

function loadQuizData(id) {
    // 动态拉取 JSON 数据卡带
    fetch(`data/${id}.json`)
        .then(response => {
            if (!response.ok) throw new Error('Test not found');
            return response.json();
        })
        .then(data => {
            config = data;
            initQuiz();
        })
        .catch(err => {
            alert('测算数据加载失败，请返回主页');
            window.location.href = '/';
        });
}

function initQuiz() {
    if (config.meta.themeColor) {
        document.documentElement.style.setProperty('--theme-accent', config.meta.themeColor);
    }
    
    document.title = `Carta Lab | ${config.meta.title}`;
    const themeBlockHTML = `<span class="theme-block"></span>`;
    document.getElementById('intro-title').innerHTML = themeBlockHTML + config.meta.title;
    document.getElementById('intro-subtitle').innerText = config.meta.subtitle;
    document.getElementById('total-q').innerText = config.questions.length;
    
    // 设置 Upsell
    if(config.meta.upsellText) {
        document.getElementById('upsell-btn').innerText = config.meta.upsellText;
    }
    document.getElementById('footer-quote').innerHTML = `"${config.meta.quote}"<br><span class="footer-cta">${config.meta.footerCta}</span>`;
    
    switchSection('section-intro');
}

function startQuiz() {
    currentQuestion = 0;
    typeScores = {};
    for (let key in config.results) {
        typeScores[key] = 0;
    }
    axesSum = {};
    config.axes.forEach(axis => { axesSum[axis.id] = 0; });
    renderQuestion();
    switchSection('section-quiz');
}

function renderQuestion() {
    const qData = config.questions[currentQuestion];
    document.getElementById('curr-q').innerText = currentQuestion + 1;
    document.getElementById('question-text').innerText = qData.q;
    
    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = '';
    
    qData.options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.innerText = opt.text;
        btn.onclick = () => handleAnswer(opt);
        optsContainer.appendChild(btn);
    });
}

function handleAnswer(opt) {
    if (opt.types) {
        for (let key in opt.types) {
            if (typeScores[key] === undefined) typeScores[key] = 0;
            typeScores[key] += opt.types[key];
        }
    } else if (opt.type) {
        if (typeScores[opt.type] === undefined) typeScores[opt.type] = 0;
        typeScores[opt.type]++;
    }
    for (let key in opt.scores) {
        axesSum[key] += opt.scores[key];
    }
    currentQuestion++;
    if (currentQuestion < config.questions.length) {
        renderQuestion();
    } else {
        showResult();
    }
}

function generateRadarChart(scores, maxScorePerQuestion) {
    const axes = config.axes;
    const size = 260;
    const center = size / 2;
    const radius = size * 0.35; 
    const maxPossibleScore = maxScorePerQuestion * config.questions.length;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow:visible;">`;
    
    const levels = 4;
    for (let i = 1; i <= levels; i++) {
        let r = radius * (i / levels);
        let points = [];
        axes.forEach((axis, index) => {
            let angle = (Math.PI * 2 * index / axes.length) - Math.PI / 2;
            let x = center + r * Math.cos(angle);
            let y = center + r * Math.sin(angle);
            points.push(`${x},${y}`);
        });
        svg += `<polygon points="${points.join(' ')}" fill="none" stroke="var(--border-color)" stroke-width="0.5"/>`;
    }
    
    axes.forEach((axis, index) => {
        let angle = (Math.PI * 2 * index / axes.length) - Math.PI / 2;
        let x = center + radius * Math.cos(angle);
        let y = center + radius * Math.sin(angle);
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--border-color)" stroke-width="0.5"/>`;
        
        let lx = center + (radius + 20) * Math.cos(angle);
        let ly = center + (radius + 20) * Math.sin(angle);
        svg += `<text x="${lx}" y="${ly}" font-size="11" font-weight="600" fill="var(--text-secondary)" text-anchor="middle" alignment-baseline="middle" font-family="inherit">${axis.label}</text>`;
    });
    
    let dataPoints = [];
    axes.forEach((axis, index) => {
        let rawScore = scores[axis.id] || 0; 
        let normalized = Math.min(Math.max(rawScore, 0), maxPossibleScore) / maxPossibleScore;
        normalized = 0.2 + (normalized * 0.8);
        let angle = (Math.PI * 2 * index / axes.length) - Math.PI / 2;
        let x = center + radius * normalized * Math.cos(angle);
        let y = center + radius * normalized * Math.sin(angle);
        dataPoints.push(`${x},${y}`);
    });
    
    svg += `<polygon points="${dataPoints.join(' ')}" fill="rgba(163, 158, 147, 0.35)" stroke="var(--text-primary)" stroke-width="1"/>`;
    
    dataPoints.forEach(pt => {
        let [x, y] = pt.split(',');
        svg += `<circle cx="${x}" cy="${y}" r="3" fill="var(--text-primary)"/>`;
    });
    
    svg += `</svg>`;
    return svg;
}

function showResult() {
    switchSection('section-analyzing');
    setTimeout(() => {
        let finalType = Object.keys(typeScores)[0];
        let maxScore = -1;
        for (let key in typeScores) {
            if (typeScores[key] > maxScore) {
                maxScore = typeScores[key];
                finalType = key;
            }
        }
        const resultData = config.results[finalType];
        
        document.getElementById('result-title').innerText = resultData.name;
        document.getElementById('result-content').innerHTML = resultData.content;
        
        const radarHTML = generateRadarChart(axesSum, 10);
        document.getElementById('radar-chart').innerHTML = radarHTML;
        
        const today = new Date();
        document.getElementById('report-date').innerText = today.getFullYear() + '.' + String(today.getMonth()+1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
        const randomHash = Math.random().toString(16).substring(2, 8).toUpperCase();
        document.getElementById('report-id').innerText = 'REF: #' + randomHash;
        
        switchSection('section-result');
    }, 2200);
}

function generatePoster() {
    const posterBtn = document.getElementById('poster-btn');
    const posterLoading = document.getElementById('poster-loading');
    
    posterBtn.style.display = 'none';
    posterLoading.style.display = 'block';
    
    // Tell html2canvas to ignore the button and loading text
    posterBtn.setAttribute('data-html2canvas-ignore', 'true');
    posterLoading.setAttribute('data-html2canvas-ignore', 'true');
    
    const captureArea = document.getElementById('capture-area');
    captureArea.style.opacity = '1';
    captureArea.style.animation = 'none';
    
    // Remove complex gradients that crash html2canvas
    const oldBg = captureArea.style.background;
    const oldBgImage = captureArea.style.backgroundImage;
    captureArea.style.background = getComputedStyle(document.body).backgroundColor;
    captureArea.style.backgroundImage = 'none';
    
    // Ensure content box has a solid background (alpha transparency can cause black boxes)
    const contentBox = document.getElementById('result-content');
    const oldContentBg = contentBox.style.background;
    contentBox.style.background = "#F0EDE9";
    
    // Fix scroll cutoff issue on iOS
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);
    
    // Give browser time to repaint after scrolling and style changes
    setTimeout(() => {
        html2canvas(captureArea, {
            scale: 1.5, // Balance between clarity and memory limits
            useCORS: true,
            allowTaint: true,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scrollY: 0
        }).then(canvas => {
            // Restore styles
            captureArea.style.background = oldBg;
            captureArea.style.backgroundImage = oldBgImage;
            contentBox.style.background = oldContentBg;
            posterBtn.style.display = 'flex';
            posterLoading.style.display = 'none';
            window.scrollTo(0, originalScrollY);
            
            try {
                // Use JPEG to avoid massive PNG data URIs that crash mobile browsers
                const imgUrl = canvas.toDataURL("image/jpeg", 0.9);
                document.getElementById('poster-image').src = imgUrl;
                document.getElementById('poster-overlay').style.display = 'flex';
            } catch(e) {
                alert("生成图片数据时发生错误，可能是内存不足，请手动截图保存。");
            }
        }).catch(err => {
            console.error("Poster generation failed:", err);
            alert("海报生成失败，请稍后重试或尝试截图保存");
            captureArea.style.background = oldBg;
            captureArea.style.backgroundImage = oldBgImage;
            contentBox.style.background = oldContentBg;
            posterBtn.style.display = 'flex';
            posterLoading.style.display = 'none';
            window.scrollTo(0, originalScrollY);
        });
    }, 500);
}

function closePoster() {
    document.getElementById('poster-overlay').style.display = 'none';
}
