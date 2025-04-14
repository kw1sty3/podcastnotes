// Общие функции для всех страниц

// Функция для загрузки подкаста по ID
function loadPodcast(id) {
    const podcasts = JSON.parse(localStorage.getItem('podcasts')) || [];
    return podcasts[id] || null;
}

// Функция для сохранения подкаста
function savePodcast(id, podcastData) {
    const podcasts = JSON.parse(localStorage.getItem('podcasts')) || [];
    
    if (id === 'new') {
        podcasts.push(podcastData);
    } else {
        podcasts[id] = podcastData;
    }
    
    localStorage.setItem('podcasts', JSON.stringify(podcasts));
    return id === 'new' ? podcasts.length - 1 : id;
}

// Функция для получения параметров URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        new: params.get('new') === 'true'
    };
}