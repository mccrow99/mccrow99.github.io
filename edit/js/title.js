"use strict";

let concertData = {
    id: null,
    title: "",
    subtitle: "",
    description: "",
    director: null,
    cover_image: null,
    performances: []
};

const base_url = "https://kulbee.pythonanywhere.com";

function getConcertIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadConcertData(concertId) {
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}`, { cache: "no-store" });
        
        if (!response.ok) {
            throw new Error('Concert not found');
        }
        
        const data = await response.json();
        concertData = data;
        
        populateForm();
        updatePageTitle();
        displayPerformances();
    } catch (error) {
        console.error('Error loading concert:', error);
        showNotification("Error loading concert: " + error.message, "danger");
    }
}

function populateForm() {
    document.getElementById('title').value = concertData.title || "";
    document.getElementById('subtitle').value = concertData.subtitle || "";
    document.getElementById('description').value = concertData.description || "";
    
    // Note: location, price, copyright_info, additional_notes are stored in Performance model
    // For now, we'll handle these in the performance section
    
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
        const location = perf.location || '';
        
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
                ${location ? `
                    <span class="level-item ml-4">
                        <span class="icon-text">
                            <span class="icon has-text-success">
                                <i class="fas fa-map-marker-alt"></i>
                            </span>
                            <span class="has-text-grey">${location}</span>
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
    const date = new Date(dateString);
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
        description: document.getElementById('description').value.trim()
    };
    
    if (!formData.title) {
        showNotification("Concert title is required", "danger");
        submitButton.classList.remove("is-loading");
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertData.id}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update concert');
        }
        
        const data = await response.json();
        concertData = { ...concertData, ...data };
        
        showNotification("Concert details updated successfully!", "success");
        updatePageTitle();
        submitButton.classList.remove("is-loading");
    } catch (error) {
        console.error('Error updating concert:', error);
        showNotification("Error updating concert: " + error.message, "danger");
        submitButton.classList.remove("is-loading");
    }
}

async function handlePerformanceAdd(e) {
    e.preventDefault();
    
    const form = e.target;
    const dateInput = document.getElementById('perf-date');
    const timeInput = document.getElementById('perf-time');
    const locationInput = document.getElementById('perf-location');
    
    const date = dateInput.value;
    const time = timeInput.value;
    const location = locationInput ? locationInput.value.trim() : '';
    
    if (!date) {
        showNotification("Please select a date", "warning");
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add("is-loading");
    
    try {
        const perfData = {
            date: date,
            time: time || null,
            location: location || null
        };
        
        const response = await fetch(`${base_url}/api/concerts/${concertData.id}/performances/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add performance');
        }
        
        const newPerf = await response.json();
        concertData.performances.push(newPerf);
        displayPerformances();
        
        dateInput.value = "";
        timeInput.value = "";
        if (locationInput) locationInput.value = "";
        
        showNotification("Performance date added!", "success");
        submitButton.classList.remove("is-loading");
    } catch (error) {
        console.error('Error adding performance:', error);
        showNotification("Error adding performance: " + error.message, "danger");
        submitButton.classList.remove("is-loading");
    }
}

async function deletePerformance(perfId) {
    if (!confirm('Are you sure you want to delete this performance date?')) {
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertData.id}/performances/${perfId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete performance');
        }
        
        concertData.performances = concertData.performances.filter(p => p.id !== perfId);
        displayPerformances();
        showNotification("Performance date deleted", "info");
    } catch (error) {
        console.error('Error deleting performance:', error);
        showNotification("Error deleting performance: " + error.message, "danger");
    }
}

async function handleDeleteConcert() {
    if (!confirm(`Are you sure you want to delete "${concertData.title}"? This will permanently remove all associated data including ensembles, songs, and crew. This action cannot be undone!`)) {
        return;
    }
    
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertData.id}/delete`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete concert');
        }
        
        showNotification("Concert deleted. Redirecting...", "success");
        
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);
    } catch (error) {
        console.error('Error deleting concert:', error);
        showNotification("Error deleting concert: " + error.message, "danger");
    }
}

function showNotification(message, type = "info", duration = 4000) {
    const main = document.querySelector("main");
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s ease";
    
    main.insertBefore(notification, main.firstChild);
    
    setTimeout(() => notification.style.opacity = "1", 10);
    
    notification.querySelector(".delete").addEventListener("click", () => {
        removeNotification(notification);
    });
    
    setTimeout(() => removeNotification(notification), duration);
}

function removeNotification(notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
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
                // TODO: Implement file upload to server
            }
        });
    }
});