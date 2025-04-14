document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    let podcast = {
        title: '',
        topics: []
    };
    let currentPodcastId = null;
    let selectedTopicIndex = null;
    
    // Элементы интерфейса
    const titleInput = document.getElementById('podcast-title');
    const topicsList = document.getElementById('topics-list');
    const addTopicBtn = document.getElementById('add-topic');
    const addQuestionBtn = document.getElementById('add-question');
    const saveBtn = document.getElementById('save-podcast');
    const backBtn = document.getElementById('back-to-home');
    
    // Загрузка существующего подкаста, если есть ID
    if (params.id !== null && !params.new) {
        currentPodcastId = parseInt(params.id);
        const loadedPodcast = loadPodcast(currentPodcastId);
        if (loadedPodcast) {
            podcast = loadedPodcast;
            titleInput.value = podcast.title;
            renderTopics();
        }
    }
    
    // Обработчики событий
    titleInput.addEventListener('input', (e) => {
        podcast.title = e.target.value;
    });
    
    addTopicBtn.addEventListener('click', () => {
        podcast.topics.push({
            title: '',
            questions: []
        });
        renderTopics();
        selectTopic(podcast.topics.length - 1);
    });
    
    addQuestionBtn.addEventListener('click', () => {
        if (selectedTopicIndex !== null) {
            podcast.topics[selectedTopicIndex].questions.push('');
            renderTopics();
        }
    });
    
    saveBtn.addEventListener('click', () => {
        const saveId = currentPodcastId !== null ? currentPodcastId : 'new';
        const savedId = savePodcast(saveId, podcast);
        
        if (saveId === 'new') {
            currentPodcastId = savedId;
        }
        
        alert('Подкаст сохранен!');
    });
    
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Функции
    function renderTopics() {
        topicsList.innerHTML = '';
        
        podcast.topics.forEach((topic, topicIndex) => {
            const topicElement = document.createElement('div');
            topicElement.className = 'topic-item';
            
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            
            const topicInput = document.createElement('input');
            topicInput.type = 'text';
            topicInput.placeholder = 'Название темы';
            topicInput.value = topic.title;
            topicInput.addEventListener('input', (e) => {
                podcast.topics[topicIndex].title = e.target.value;
            });
            
            const deleteTopicBtn = document.createElement('button');
            deleteTopicBtn.className = 'delete-btn';
            deleteTopicBtn.innerHTML = '×';
            deleteTopicBtn.addEventListener('click', () => {
                podcast.topics.splice(topicIndex, 1);
                renderTopics();
                selectedTopicIndex = null;
                addQuestionBtn.disabled = true;
            });
            
            topicHeader.appendChild(topicInput);
            topicHeader.appendChild(deleteTopicBtn);
            
            const questionsList = document.createElement('div');
            questionsList.className = 'questions-list';
            
            topic.questions.forEach((question, questionIndex) => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item';
                
                const questionInput = document.createElement('input');
                questionInput.type = 'text';
                questionInput.placeholder = 'Вопрос или заметка';
                questionInput.value = question;
                questionInput.addEventListener('input', (e) => {
                    podcast.topics[topicIndex].questions[questionIndex] = e.target.value;
                });
                
                const deleteQuestionBtn = document.createElement('button');
                deleteQuestionBtn.className = 'delete-btn';
                deleteQuestionBtn.innerHTML = '×';
                deleteQuestionBtn.addEventListener('click', () => {
                    podcast.topics[topicIndex].questions.splice(questionIndex, 1);
                    renderTopics();
                });
                
                questionItem.appendChild(questionInput);
                questionItem.appendChild(deleteQuestionBtn);
                questionsList.appendChild(questionItem);
            });
            
            topicElement.appendChild(topicHeader);
            topicElement.appendChild(questionsList);
            topicsList.appendChild(topicElement);
            
            // Добавляем обработчик клика для выбора темы
            topicElement.addEventListener('click', () => {
                selectTopic(topicIndex);
            });
        });
    }
    
    function selectTopic(index) {
        selectedTopicIndex = index;
        addQuestionBtn.disabled = false;
        
        // Подсветка выбранной темы
        document.querySelectorAll('.topic-item').forEach((item, i) => {
            if (i === index) {
                item.style.borderLeft = `4px solid ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')}`;
                item.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
            } else {
                item.style.borderLeft = 'none';
                item.style.backgroundColor = '';
            }
        });
    }
});