document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    const currentCard = document.getElementById('card-current');
    const prevQuestionCard = document.getElementById('card-prev-question');
    const nextQuestionCard = document.getElementById('card-next-question');
    const prevTopicCard = document.getElementById('card-prev-topic');
    const nextTopicCard = document.getElementById('card-next-topic');
    
    const navPrevTopic = document.getElementById('nav-prev-topic');
    const navNextTopic = document.getElementById('nav-next-topic');
    const navPrevQuestion = document.getElementById('nav-prev-question');
    const navNextQuestion = document.getElementById('nav-next-question');
    const currentPosition = document.getElementById('current-position');
    const exitBtn = document.getElementById('exit-podcast');
    
    let podcast = null;
    let currentIndex = 0;
    let flatStructure = [];
    
    // Загрузка подкаста
    if (params.id !== null) {
        podcast = loadPodcast(parseInt(params.id));
        if (podcast) {
            // Создаем плоскую структуру тем и вопросов
            podcast.topics.forEach(topic => {
                flatStructure.push({
                    type: 'topic',
                    title: topic.title,
                    content: '',
                    topicIndex: podcast.topics.indexOf(topic),
                    isTopic: true
                });
                
                topic.questions.forEach(question => {
                    flatStructure.push({
                        type: 'question',
                        title: '',
                        content: question,
                        topicIndex: podcast.topics.indexOf(topic),
                        isTopic: false
                    });
                });
            });
            
            updateCards();
        }
    }
    
    // Обработчики событий
    navPrevTopic.addEventListener('click', goToPrevTopic);
    navNextTopic.addEventListener('click', goToNextTopic);
    navPrevQuestion.addEventListener('click', goToPrevQuestion);
    navNextQuestion.addEventListener('click', goToNextQuestion);
    nextTopicCard.addEventListener('click', goToNextTopic);
    exitBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Обработка клавиатуры
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                goToPrevQuestion();
                break;
            case 'arrowright':
            case 'd':
                goToNextQuestion();
                break;
            case 'arrowup':
            case 'w':
                goToPrevTopic();
                break;
            case 'arrowdown':
            case 's':
                goToNextTopic();
                break;
            case 'escape':
                window.location.href = 'index.html';
                break;
        }
    });
    
    // Функции навигации
    function goToPrevQuestion() {
        if (currentIndex > 0) {
            currentIndex--;
            // Если перешли на тему, пропускаем ее (если это не первая тема)
            if (flatStructure[currentIndex].isTopic && currentIndex > 0) {
                currentIndex--;
            }
            updateCards();
        }
    }
    
    function goToNextQuestion() {
        if (currentIndex < flatStructure.length - 1) {
            currentIndex++;
            // Если перешли на тему, пропускаем ее (если это не последняя тема)
            if (flatStructure[currentIndex].isTopic && currentIndex < flatStructure.length - 1) {
                currentIndex++;
            }
            updateCards();
        }
    }
    
    function goToPrevTopic() {
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        if (currentTopicIndex > 0) {
            // Находим первую тему в предыдущей группе
            for (let i = currentIndex - 1; i >= 0; i--) {
                if (flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex - 1) {
                    currentIndex = i;
                    updateCards();
                    break;
                }
            }
        }
    }
    
    function goToNextTopic() {
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        if (currentTopicIndex < podcast.topics.length - 1) {
            // Находим первую тему в следующей группе
            for (let i = currentIndex + 1; i < flatStructure.length; i++) {
                if (flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex + 1) {
                    currentIndex = i;
                    updateCards();
                    break;
                }
            }
        }
    }
    
    // Обновление всех карточек
    function updateCards() {
        if (flatStructure.length === 0) return;
        
        const currentItem = flatStructure[currentIndex];
        
        // Текущая карточка
        renderCard(currentCard, currentItem, true);
        
        // Предыдущий вопрос (если есть)
        const prevQuestionIndex = findPrevQuestionIndex();
        if (prevQuestionIndex !== -1) {
            renderCard(prevQuestionCard, flatStructure[prevQuestionIndex], false);
        } else {
            markAsEmpty(prevQuestionCard);
        }
        
        // Следующий вопрос (если есть)
        const nextQuestionIndex = findNextQuestionIndex();
        if (nextQuestionIndex !== -1) {
            renderCard(nextQuestionCard, flatStructure[nextQuestionIndex], false);
        } else {
            markAsEmpty(nextQuestionCard);
        }
        
        // Предыдущая тема (если есть)
        const prevTopicIndex = findPrevTopicIndex();
        if (prevTopicIndex !== -1) {
            renderCard(prevTopicCard, flatStructure[prevTopicIndex], false);
        } else {
            markAsEmpty(prevTopicCard);
        }
        
        // Следующая тема (если есть)
        const nextTopicIndex = findNextTopicIndex();
        if (nextTopicIndex !== -1) {
            renderCard(nextTopicCard, flatStructure[nextTopicIndex], false);
        } else {
            markAsEmpty(nextTopicCard);
        }
        
        // Обновляем позицию
        currentPosition.textContent = `${currentIndex + 1}/${flatStructure.length}`;
        
        // Обновляем состояние навигации
        updateNavStates();
    }
    
    function renderCard(cardElement, item, isCurrent) {
        if (item.type === 'topic') {
            cardElement.innerHTML = `
                <h2>${item.title}</h2>
                <p>Тема обсуждения</p>
            `;
        } else {
            cardElement.innerHTML = `
                <h2>${isCurrent ? 'Текущий вопрос' : 'Вопрос'}</h2>
                <p>${item.content}</p>
            `;
        }
        
        cardElement.classList.remove('empty-card');
        cardElement.style.opacity = isCurrent ? '1' : '0.8';
    }
    
    function markAsEmpty(cardElement) {
        cardElement.innerHTML = '';
        cardElement.classList.add('empty-card');
    }
    
    // Вспомогательные функции для поиска соседних элементов
    function findPrevQuestionIndex() {
        if (currentIndex === 0) return -1;
        
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (!flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex) {
                return i;
            }
        }
        return -1;
    }
    
    function findNextQuestionIndex() {
        if (currentIndex === flatStructure.length - 1) return -1;
        
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        for (let i = currentIndex + 1; i < flatStructure.length; i++) {
            if (!flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex) {
                return i;
            }
        }
        return -1;
    }
    
    function findPrevTopicIndex() {
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        if (currentTopicIndex === 0) return -1;
        
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex - 1) {
                return i;
            }
        }
        return -1;
    }
    
    function findNextTopicIndex() {
        const currentTopicIndex = flatStructure[currentIndex].topicIndex;
        if (currentTopicIndex === podcast.topics.length - 1) return -1;
        
        for (let i = currentIndex + 1; i < flatStructure.length; i++) {
            if (flatStructure[i].isTopic && flatStructure[i].topicIndex === currentTopicIndex + 1) {
                return i;
            }
        }
        return -1;
    }
    
    function updateNavStates() {
        // Обновляем состояние кнопок навигации
        navPrevTopic.style.opacity = findPrevTopicIndex() === -1 ? '0.5' : '1';
        navNextTopic.style.opacity = findNextTopicIndex() === -1 ? '0.5' : '1';
        navPrevQuestion.style.opacity = findPrevQuestionIndex() === -1 ? '0.5' : '1';
        navNextQuestion.style.opacity = findNextQuestionIndex() === -1 ? '0.5' : '1';
    }
});