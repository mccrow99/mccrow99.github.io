"use strict";

class Concert {
    constructor(id, title, subtitle = '', description = '', director = null, performances = [], songs = [], ensembles = [], crew_members = [], acknowledgments = [], bios = []) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.description = description;
        this.director = director;
        this.performances = performances;
        this.songs = songs;
        this.ensembles = ensembles;
        this.crew_members = crew_members;
        this.acknowledgments = acknowledgments;
        this.bios = bios;
    }
}

const base_url = "https://kulbee.pythonanywhere.com";

function displayConcerts(container, concerts) {
    container.innerHTML = "";
    
    if (!Array.isArray(concerts)) {
        return;
    }

    if (concerts.length === 0) {
        const notification = document.createElement("div");
        notification.className = "notification is-info has-text-centered";

        const icon = document.createElement("span");
        icon.className = "icon is-large mb-4";
        icon.innerHTML = '<i class="fas fa-music" style="font-size: 3rem;"></i>';

        const p = document.createElement("p");
        p.className = "is-size-5 mb-4";
        p.textContent = "No concerts yet. Create your first concert to get started!";

        const a = document.createElement("a");
        a.href = "./edit/create.html";
        a.className = "button is-primary is-medium";
        a.innerHTML = '<span class="icon"><i class="fas fa-plus"></i></span><span>Create Concert</span>';
        
        notification.appendChild(icon);
        notification.appendChild(p);
        notification.appendChild(a);
        container.appendChild(notification);
        return;
    }

    concerts.forEach((concert) => {
        const concertCard = document.createElement("div");
        concertCard.className = "card mb-4";
        concertCard.style.transition = "transform 0.2s, box-shadow 0.2s";
        
        concertCard.addEventListener("mouseenter", () => {
            concertCard.style.transform = "translateY(-4px)";
            concertCard.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
        });
        
        concertCard.addEventListener("mouseleave", () => {
            concertCard.style.transform = "translateY(0)";
            concertCard.style.boxShadow = "";
        });

        const header = document.createElement("header");
        header.className = "card-header has-background-primary";

        const title = document.createElement("p");
        title.className = "card-header-title is-size-4 has-text-white";
        title.textContent = concert.title || "Untitled Concert";

        header.appendChild(title);
        concertCard.appendChild(header);

        const content = document.createElement("div");
        content.className = "card-content";

        if (concert.subtitle) {
            const subtitle = document.createElement("p");
            subtitle.className = "subtitle is-6 mb-2";
            subtitle.textContent = concert.subtitle;
            content.appendChild(subtitle);
        }

        // Display performance info if available
        if (concert.performances && concert.performances.length > 0) {
            const firstPerf = concert.performances[0];
            if (firstPerf.location) {
                const locationDiv = document.createElement("div");
                locationDiv.className = "mb-2";
                locationDiv.innerHTML = `<span class="icon-text"><span class="icon has-text-info"><i class="fas fa-map-marker-alt"></i></span><span>${firstPerf.location}</span></span>`;
                content.appendChild(locationDiv);
            }

            const datesDiv = document.createElement("div");
            datesDiv.className = "mb-2";
            const dates = concert.performances.map(p => formatDate(p.date)).slice(0, 3);
            const datesList = dates.join(", ");
            datesDiv.innerHTML = `<span class="icon-text"><span class="icon has-text-success"><i class="fas fa-calendar"></i></span><span>${datesList}</span></span>`;
            if (concert.performances.length > 3) {
                datesDiv.innerHTML += ` <span class="tag is-light">+${concert.performances.length - 3} more</span>`;
            }
            content.appendChild(datesDiv);
        }

        concertCard.appendChild(content);

        const footer = document.createElement("footer");
        footer.className = "card-footer";

        const edit = document.createElement("a");
        edit.className = "card-footer-item has-text-link";
        edit.href = `./edit/title.html?id=${concert.id}`;
        edit.innerHTML = '<span class="icon-text"><span class="icon"><i class="fas fa-edit"></i></span><span>Edit</span></span>';

        const view = document.createElement("a");
        view.className = "card-footer-item has-text-primary";
        view.href = `./view/program.html?id=${concert.id}`;
        view.innerHTML = '<span class="icon-text"><span class="icon"><i class="fas fa-eye"></i></span><span>View Program</span></span>';

        const deleteBtn = document.createElement("a");
        deleteBtn.className = "card-footer-item has-text-danger";
        deleteBtn.href = "#";
        deleteBtn.innerHTML = '<span class="icon-text"><span class="icon"><i class="fas fa-trash"></i></span><span>Delete</span></span>';
        deleteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm(`Are you sure you want to delete "${concert.title}"? This action cannot be undone.`)) {
                deleteConcert(concert.id);
            }
        });

        footer.appendChild(edit);
        footer.appendChild(view);
        footer.appendChild(deleteBtn);
        concertCard.appendChild(footer);

        container.appendChild(concertCard);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

async function deleteConcert(concertId) {
    try {
        const response = await fetch(`${base_url}/api/concerts/${concertId}/delete`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete concert');
        }

        showNotification("Concert deleted successfully", "success");
        
        setTimeout(() => {
            loadConcerts();
        }, 1000);
    } catch (error) {
        console.error('Error deleting concert:', error);
        showNotification("Error deleting concert: " + error.message, "danger");
    }
}

function showNotification(message, type = "info", duration = 4000) {
    const container = document.querySelector(".container");
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s ease";
    
    container.insertBefore(notification, container.firstChild);
    
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

async function loadConcerts() {
    const container = document.getElementById("concerts-container");
    
    try {
        const response = await fetch(`${base_url}/api/concerts`, {method: "GET", cache: "no-store" });
        
        if (!response.ok) {
            throw new Error('Failed to load concerts');
        }
        
        const concert_data = await response.json();

        const concerts = concert_data.map(c => new Concert(
            c.id,
            c.title,
            c.subtitle,
            c.description,
            c.director,
            c.performances || [],
            c.songs || [],
            c.ensembles || [],
            c.crew_members || [],
            c.acknowledgments || [],
            c.bios || []
        ));
        
        displayConcerts(container, concerts);
    } catch (error) {
        console.error('Error loading concerts:', error);
        container.innerHTML = `
            <div class="notification is-danger is-light">
                <p>Error loading concerts: ${error.message}</p>
                <button class="button is-small mt-3" onclick="loadConcerts()">Retry</button>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadConcerts();
    
    // Add FontAwesome if not already included
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement("link");
        faLink.rel = "stylesheet";
        faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(faLink);
    }
});