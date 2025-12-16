"use strict";

const base_url = "https://kulbee.pythonanywhere.com";

function validateForm(form) {
    const title = form.querySelector('#title').value.trim();
    
    if (!title) {
        showNotification("Please enter a concert title", "danger");
        return false;
    }
    
    if (title.length < 3) {
        showNotification("Concert title must be at least 3 characters long", "warning");
        return false;
    }
    
    return true;
}

function showNotification(message, type = "info", duration = 4000) {
    const container = document.querySelector("main") || document.body;
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

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!validateForm(form)) {
        return;
    }
    
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
    
    const title = form.querySelector('#title').value.trim();
    
    try {
        const response = await fetch(`${base_url}/api/concerts/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create concert');
        }
        
        const data = await response.json();
        showNotification("Concert created successfully!", "success");
        
        setTimeout(() => {
            window.location.href = `./title.html?id=${data.id}`;
        }, 1000);
    } catch (error) {
        console.error('Error creating concert:', error);
        showNotification("Error creating concert: " + error.message, "danger");
        submitButton.classList.remove("is-loading");
        submitButton.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
    
    const titleInput = document.querySelector("#title");
    if (titleInput) {
        titleInput.focus();
        
        const maxLength = 100;
        const helpText = document.createElement("p");
        helpText.className = "help";
        titleInput.parentElement.appendChild(helpText);
        
        const updateCounter = () => {
            const remaining = maxLength - titleInput.value.length;
            helpText.textContent = `${remaining} characters remaining`;
            helpText.className = remaining < 20 
                ? "help has-text-warning" 
                : "help has-text-grey";
        };
        
        titleInput.addEventListener("input", updateCounter);
        titleInput.maxLength = maxLength;
        updateCounter();
    }
});