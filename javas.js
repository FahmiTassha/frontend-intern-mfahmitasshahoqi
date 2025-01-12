// Header
let lastScrollTop = 0;

window.addEventListener("scroll", function () {
    const header = document.querySelector("header.primary");

    if (window.scrollY > lastScrollTop) {
        header.classList.add("hide");
    } else {
        if (window.scrollY > 0) {
            header.classList.add("header-transparent");
            header.classList.remove("hide");
        } else {
            header.classList.remove("header-transparent");
            header.classList.remove("hide");
        }
    }

    lastScrollTop = window.scrollY <= 0 ? 0 : window.scrollY;
});

// Penyimpanan state
const apiUrl = 'https://suitmedia-backend.suitdev.com/api/ideas';
let totalItems = 0;
let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
let pageSize = parseInt(localStorage.getItem('pageSize')) || 10;
let sortBy = localStorage.getItem('sortBy') || 'published_at';

// tampilan data awal pagesize and sortby
document.addEventListener('DOMContentLoaded', () => {
    const perPageSelect = document.getElementById('perPageSelect');
    const sortSelect = document.getElementById('sortSelect');

    if (localStorage.getItem('pageSize')) {
        perPageSelect.value = localStorage.getItem('pageSize');
    }

    if (localStorage.getItem('sortBy')) {
        sortSelect.value = localStorage.getItem('sortBy');
    }

    renderCards();
});

// perubahan dan penyimpanan pagesize
document.getElementById('perPageSelect').addEventListener('change', (event) => {
    pageSize = parseInt(event.target.value, 10);
    localStorage.setItem('pageSize', pageSize);
    currentPage = 1;
    localStorage.setItem('currentPage', currentPage);
    renderCards();
});

// perubahan dan penyimpanan sortby
document.getElementById('sortSelect').addEventListener('change', (event) => {
    sortBy = event.target.value;
    localStorage.setItem('sortBy', sortBy);
    currentPage = 1;
    localStorage.setItem('currentPage', currentPage);
    renderCards();
});

// Pergantian value pagesize and sortby
document.addEventListener('DOMContentLoaded', () => {
    const perPageSelect = document.getElementById('perPageSelect');
    const sortSelect = document.getElementById('sortSelect');

    if (localStorage.getItem('pageSize')) {
        perPageSelect.value = localStorage.getItem('pageSize');
    }

    if (localStorage.getItem('sortBy')) {
        sortSelect.value = localStorage.getItem('sortBy');
    }

    renderCards();
});

// Format tanggal
const formatDate = (dateString) => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

// Pengambilan data dari API
const fetchIdeas = async ({ pageNumber, pageSize, sorting }) => {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                'page[number]': pageNumber,
                'page[size]': pageSize,
                append: ['small_image', 'medium_image'],
                sort: sorting
            }
        });

        totalItems = response.data.meta.total;
        return response.data.data;
    } catch (error) {
        throw new Error('Error fetching ideas:', error);
    }
};

// Card
const renderCards = async () => {
    const ideasContainer = document.getElementById('ideasContainer');
    const showingText = document.getElementById('showingText');

    currentPage = parseInt(localStorage.getItem('currentPage')) || currentPage;
    pageSize = parseInt(localStorage.getItem('pageSize')) || pageSize;
    sortBy = localStorage.getItem('sortBy') || sortBy;

    const ideas = await fetchIdeas({ pageNumber: currentPage, pageSize, sorting: sortBy });

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    showingText.innerText = `Showing ${startItem}-${endItem} of ${totalItems}`;

    ideasContainer.innerHTML = '';

    ideas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'card';

        const imageUrl = idea.small_image || 'https://via.placeholder.com/200'; // Fallback image URL
        const published = formatDate(idea.published_at) || 'No description available.'; // Format the date
        const title = idea.title || 'No Title';

        card.innerHTML = `
            <img src="${imageUrl}" alt="Idea Image">
            <div class="card-content">
                <p>${published}</p>
                <h3>${title}</h3>
            </div>
        `;

        ideasContainer.appendChild(card);
    });

    renderPagination();
};

// Pagination card
const renderPagination = () => {
    const paginationContainer = document.getElementById('pagination');
    const totalPages = Math.ceil(totalItems / pageSize);

    paginationContainer.innerHTML = '';

    const firstPageButton = document.createElement('button');
    firstPageButton.innerText = '<<';
    firstPageButton.disabled = currentPage <= 1;
    firstPageButton.onclick = () => {
        currentPage = 1;
        localStorage.setItem('currentPage', currentPage);
        renderCards();
    };
    paginationContainer.appendChild(firstPageButton);

    const prevButton = document.createElement('button');
    prevButton.innerText = '<';
    prevButton.disabled = currentPage <= 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            localStorage.setItem('currentPage', currentPage);
            renderCards();
        }
    };
    paginationContainer.appendChild(prevButton);

    const pageRange = [];
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, currentPage + 4);

    if (currentPage <= 5) {
        endPage = Math.min(totalPages, 9);
    } else if (currentPage >= totalPages - 4) {
        startPage = Math.max(1, totalPages - 8);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageRange.push(i);
    }

    pageRange.forEach(page => {
        const pageButton = document.createElement('button');
        pageButton.innerText = page;
        pageButton.onclick = () => {
            currentPage = page;
            localStorage.setItem('currentPage', currentPage);
            renderCards();
        };

        if (page === currentPage) {
            pageButton.classList.add('active');
        }

        paginationContainer.appendChild(pageButton);
    });

    const nextButton = document.createElement('button');
    nextButton.innerText = '>';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            localStorage.setItem('currentPage', currentPage);
            renderCards();
        }
    };
    paginationContainer.appendChild(nextButton);

    const lastPageButton = document.createElement('button');
    lastPageButton.innerText = '>>';
    lastPageButton.disabled = currentPage >= totalPages;
    lastPageButton.onclick = () => {
        currentPage = totalPages;
        localStorage.setItem('currentPage', currentPage);
        renderCards();
    };
    paginationContainer.appendChild(lastPageButton);
};




