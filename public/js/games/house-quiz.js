// --- House Quiz Game ---
const quizQuestions = [
    {
        question: "You find a locked chest in an ancient ruin. How do you open it?",
        answers: [
            { text: "Smash the lock with a powerful blasting curse.", house: "gryffindor" },
            { text: "Look for clues around the room to solve the locking mechanism.", house: "ravenclaw" },
            { text: "Pick the lock quietly so no one hears.", house: "slytherin" },
            { text: "Take the chest back to camp to figure it out with friends.", house: "hufflepuff" }
        ]
    },
    {
        question: "Which magical creature would you most like to study?",
        answers: [
            { text: "A fierce Dragon.", house: "gryffindor" },
            { text: "A wise Sphinx.", house: "ravenclaw" },
            { text: "A cunning Basilisk.", house: "slytherin" },
            { text: "A loyal Hippogriff.", house: "hufflepuff" }
        ]
    },
    {
        question: "What is your greatest ambition?",
        answers: [
            { text: "To be remembered for my bravery.", house: "gryffindor" },
            { text: "To uncover secrets no one else knows.", house: "ravenclaw" },
            { text: "To achieve greatness and power.", house: "slytherin" },
            { text: "To live a happy life surrounded by loved ones.", house: "hufflepuff" }
        ]
    },
    {
        question: "During a duel, your opponent drops their wand. What do you do?",
        answers: [
            { text: "Wait for them to pick it up before continuing.", house: "gryffindor" },
            { text: "Use the opportunity to cast a disarming spell.", house: "ravenclaw" },
            { text: "Strike immediately while they are defenseless.", house: "slytherin" },
            { text: "Ask if they yield the duel.", house: "hufflepuff" }
        ]
    },
    {
        question: "Which potion would you choose to brew?",
        answers: [
            { text: "A potion of immense strength.", house: "gryffindor" },
            { text: "A potion that grants boundless wisdom.", house: "ravenclaw" },
            { text: "A potion of luck and success.", house: "slytherin" },
            { text: "A potion that cures any illness.", house: "hufflepuff" }
        ]
    }
];

let currentQuizIndex = 0;
let quizScores = { gryffindor: 0, ravenclaw: 0, slytherin: 0, hufflepuff: 0 };

function startHouseQuiz() {
    document.getElementById('quiz-start-screen').classList.add('hidden');
    document.getElementById('quiz-end-screen').classList.add('hidden');
    document.getElementById('quiz-play-screen').classList.remove('hidden');
    
    currentQuizIndex = 0;
    quizScores = { gryffindor: 0, ravenclaw: 0, slytherin: 0, hufflepuff: 0 };
    
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quiz-progress').textContent = currentQuizIndex + 1;
    document.getElementById('quiz-question-text').textContent = q.question;
    
    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';
    
    q.answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = ans.text;
        btn.onclick = () => answerQuestion(ans.house);
        container.appendChild(btn);
    });
}

function answerQuestion(houseKey) {
    quizScores[houseKey]++;
    
    if(typeof clickAudio !== 'undefined' && clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => {});
    }
    
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
        loadQuizQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    document.getElementById('quiz-play-screen').classList.add('hidden');
    document.getElementById('quiz-end-screen').classList.remove('hidden');
    
    let winner = 'gryffindor';
    let max = 0;
    for (const [house, score] of Object.entries(quizScores)) {
        if (score > max) {
            max = score;
            winner = house;
        }
    }
    
    const details = {
        gryffindor: { crest: '🦁', name: 'GRYFFINDOR', desc: 'You belong in Gryffindor, where dwell the brave at heart!' },
        ravenclaw: { crest: '🦅', name: 'RAVENCLAW', desc: 'You belong in wise old Ravenclaw, if you have a ready mind!' },
        slytherin: { crest: '🐍', name: 'SLYTHERIN', desc: 'You belong in Slytherin, where cunning folk use any means to achieve their ends!' },
        hufflepuff: { crest: '🦡', name: 'HUFFLEPUFF', desc: 'You belong in Hufflepuff, where they are just and loyal!' }
    };
    
    const res = details[winner];
    document.getElementById('quiz-result-crest').textContent = res.crest;
    document.getElementById('quiz-result-title').textContent = res.name;
    document.getElementById('quiz-result-desc').textContent = res.desc;
    
    if (typeof selectHouse === 'function') {
        selectHouse(winner);
    }
}
