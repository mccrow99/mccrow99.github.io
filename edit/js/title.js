"use strict";

let concertData = {
    id: null,
    title: "",
    subtitle: "",
    location: "",
    price: "",
    copyright_info: "",
    additional_notes: "",
    cover_image: null,
    performances: []
};

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadConcertData(concertId) {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/concerts/${concertId}`);
    // concertData = await response.json();
    
    // Mock data for demonstration
    concertData = {
        id: concertId,
        title: "Winter Gala Concert",
        subtitle: "An Evening of Classical Favorites",
        location: "Grand Concert Hall",
        price: "$25 General, $15 Students",
        copyright_info: "All works used with permission.",
        additional_notes: "Please silence all electronic devices.",
        cover_image: "sample_cover.jpg",
        performances: [
            { id: 1, date: "2025-12-20", time: "7:30 PM" },
            { id: 2, date: "2025-12-21", time: "7:30 PM" }
        ]
    };
    
    populateForm();
    updatePageTitle();
    displayPerformances();
}

function populateForm() {
    document.getElementById('title').value = concertData.title || "";
    document.getElementById('subtitle').value = concertData.subtitle || "";
    document.getElementById('location').value = concertData.location || "";
    document.getElementById('price').value = concertData.price || "";
    document.getElementById('copyright_info').value = concertData.copyright_info || "";
    document.getElementById('additional_notes').value = concertData.additional_notes || "";
    
    if (concertData.cover_image) {
        document.getElementById('file-name-span').textContent = concertData.cover_image;
    } else {
        document.getElementById('file-name-span').textContent = "No file uploaded";
    }
}

function updatePageTitle() {
    const headerTitle = document.querySelector('.navbar-brand h1');
    if (headerTitle && concertData.title) {
        headerTitle.textContent = `Edit Concert: ${concertData.title}`;
    }
}

function displayPerformances() {
    const container = document.getElementById('performances-list');
    container.innerHTML = "";
    
    if (!concertData.performances || concertData.performances.length === 0) {
        container.innerHTML = '<p class="has-text-grey has-text-centered py-4">No performance dates added yet.</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'list';
    
    concertData.performances.forEach(perf => {
        const li = document.createElement('li');
        li.className = 'list-item level is-mobile py-3';
        
        const formattedDate = formatDate(perf.date);
        
        li.innerHTML = `
            <div class="level-left">
                <span class="level-item">
                    <span class="icon-text">
                        <span class="icon has-text-primary">
                            <i class="fas fa-calendar-day"></i>
                        </span>
                        <span class="has-text-weight-semibold">${formattedDate}</span>
                    </span>
                </span>
                ${perf.time ? `
                    <span class="level-item ml-4">
                        <span class="icon-text">
                            <span class="icon has-text-info">
                                <i class="fas fa-clock"></i>
                            </span>
                            <span class="has-text-grey">${perf.time}</span>
                        </span>
                    </span>
                ` : ''}
            </div>
            <div class="level-right">
                <button type="button" 
                        class="button is-danger is-small is-light level-item"
                        onclick="deletePerformance(${perf.id})">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                    <span>Delete</span>
                </button>
            </div>
        `;
        
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

async function handleDetailsSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        subtitle: document.getElementById('subtitle').value.trim(),
        location: document.getElementById('location').value.trim(),
        price: document.getElementById('price').value.trim(),
        copyright_info: document.getElementById('copyright_info').value.trim(),
        additional_notes: document.getElementById('additional_notes').value.trim()
    };
    
    if (!formData.title) {
        showNotification("Concert title is required", "danger");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    if (!formData.location) {
        showNotification("Location is required", "danger");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    // TODO: Handle file upload
    // const coverImage = document.getElementById('cover_image').files[0];
    
    // TODO: Replace with actual API call
    setTimeout(() => {
        concertData = { ...concertData, ...formData };
        showNotification("Concert details updated successfully!", "success");
        updatePageTitle();
        submitButton.classList.remove("is-loading");
    }, 500);
}

async function handlePerformanceAdd(e) {
    e.preventDefault();
    
    const form = e.target;
    const dateInput = document.getElementById('perf-date');
    const timeInput = document.getElementById('perf-time');
    
    const date = dateInput.value;
    const time = timeInput.value;
    
    if (!date) {
        showNotification("Please select a date", "warning");
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    // TODO: Replace with actual API call
    setTimeout(() => {
        const newPerf = {
            id: Math.floor(Math.random() * 10000),
            date: date,
            time: time
        };
        
        concertData.performances.push(newPerf);
        displayPerformances();
        
        dateInput.value = "";
        timeInput.value = "";
        
        showNotification("Performance date added!", "success");
        submitButton.classList.remove("is-loading");
    }, 300);
}

function deletePerformance(perfId) {
    if (!confirm('Are you sure you want to delete this performance date?')) {
        return;
    }
    
    // TODO: Replace with actual API call
    concertData.performances = concertData.performances.filter(p => p.id !== perfId);
    displayPerformances();
    showNotification("Performance date deleted", "info");
}

function handleDeleteConcert() {
    if (!confirm(`Are you sure you want to delete "${concertData.title}"? This will permanently remove all associated data including ensembles, songs, and crew. This action cannot be undone!`)) {
        return;
    }
    
    // TODO: Replace with actual API call
    showNotification("Concert deleted. Redirecting...", "success");
    
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 1500);
}

function showNotification(message, type = "info") {
    const main = document.querySelector("main");
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    main.insertBefore(notification, main.firstChild);
    
    notification.querySelector(".delete").addEventListener("click", () => {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
    const concertId = getConcertIdFromUrl();
    
    if (!concertId) {
        showNotification("No concert ID provided. Redirecting to home...", "warning");
        setTimeout(() => window.location.href = "../index.html", 2000);
        return;
    }
    
    loadConcertData(concertId);
    
    const detailsForm = document.getElementById('details-form');
    if (detailsForm) {
        detailsForm.addEventListener('submit', handleDetailsSubmit);
    }
    
    const perfForm = document.getElementById('performance-form');
    if (perfForm) {
        perfForm.addEventListener('submit', handlePerformanceAdd);
    }
    
    const deleteButton = document.getElementById('delete-concert-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleDeleteConcert();
        });
    }
    
    const fileInput = document.getElementById('cover_image');
    const fileNameSpan = document.getElementById('file-name-span');
    
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name;
            }
        });
    }
});

