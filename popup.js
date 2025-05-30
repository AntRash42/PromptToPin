const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    resultsList.innerHTML = '';
    if (query) {
        // Example: Populate with dummy items for demonstration
        const items = [
            `Result for "${query}" #1`,
            `Result for "${query}" #2`,
            `Result for "${query}" #3`
        ];
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            resultsList.appendChild(li);
        });
    }
});