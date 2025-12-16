"use strict";

class Concert {
    constructor(id, title, subtitle = '', location = '', dates = []) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.location = location;
        this.dates = dates;
    }
}

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

        if (concert.location) {
            const locationDiv = document.createElement("div");
            locationDiv.className = "mb-2";
            locationDiv.innerHTML = `<span class="icon-text"><span class="icon has-text-info"><i class="fas fa-map-marker-alt"></i></span><span>${concert.location}</span></span>`;
            content.appendChild(locationDiv);
        }

        if (concert.dates && concert.dates.length > 0) {
            const datesDiv = document.createElement("div");
            datesDiv.className = "mb-2";
            const datesList = concert.dates.slice(0, 3).join(", ");
            datesDiv.innerHTML = `<span class="icon-text"><span class="icon has-text-success"><i class="fas fa-calendar"></i></span><span>${datesList}</span></span>`;
            if (concert.dates.length > 3) {
                datesDiv.innerHTML += ` <span class="tag is-light">+${concert.dates.length - 3} more</span>`;
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

function deleteConcert(concertId) {
    // TODO: Make API call to delete concert
    console.log(`Deleting concert with ID: ${concertId}`);
    
    // For now, just reload the page
    // In production, this would make an API call then refresh the list
    showNotification("Concert deleted successfully", "success");
    
    // Simulate reload after short delay
    setTimeout(() => {
        loadConcerts();
    }, 1000);
}

function showNotification(message, type = "info") {
    const container = document.querySelector(".container");
    const notification = document.createElement("div");
    notification.className = `notification is-${type} is-light`;
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    
    container.insertBefore(notification, container.firstChild);
    
    notification.querySelector(".delete").addEventListener("click", () => {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function loadConcerts() {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/concerts');
    // const concerts = await response.json();
    
    // Mock data for demonstration
    const mockConcerts = [
        new Concert(1, "Winter Gala Concert", "An Evening of Classical Favorites", "Grand Concert Hall", ["December 20, 2025", "December 21, 2025"]),
        new Concert(2, "Spring Symphony", "Celebrating the Season", "City Auditorium", ["March 15, 2026"]),
        new Concert(3, "Chamber Music Series", "", "University Theater", ["January 10, 2026", "February 14, 2026", "March 21, 2026", "April 18, 2026"])
    ];
    
    const container = document.getElementById("concerts-container");
    displayConcerts(container, mockConcerts);
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