"use strict;";

// Client behavior for the Jokes API demo page
// - Populate language and number selects
// - Submit the form using fetch and render returned jokes

const LANGUAGES = [
    { code: "any", name: "Any" },
    { code: "cs", name: "CZECH" },
    { code: "de", name: "GERMAN" },
    { code: "en", name: "ENGLISH" },
    { code: "es", name: "SPANISH" },
    { code: "eu", name: "BASQUE" },
    { code: "fr", name: "FRENCH" },
    { code: "gl", name: "GALICIAN" },
    { code: "hu", name: "HUNGARIAN" },
    { code: "it", name: "ITALIAN" },
    { code: "lt", name: "LITHUANIAN" },
    { code: "pl", name: "POLISH" },
    { code: "sv", name: "SWEDISH" },
];

function populateSelect(select, items, valueKey = "value", textKey = "text") 
{
    select.innerHTML = "";
    items.forEach((it) => {
        const opt = document.createElement("option");
        opt.value = it[valueKey];
        opt.textContent = it[textKey];
        select.appendChild(opt);
    });
}

function createNumberOptions(max = 10) 
{
    const opts = [{ value: "all", text: "All" }];
    for (let i = 1; i <= max; i++) opts.push({ value: String(i), text: String(i) });
    return opts;
}

function renderJokes(container, jokes) 
{
    container.innerHTML = "";
    if (!Array.isArray(jokes)) return;
    jokes.forEach((j) => {
        const box = document.createElement("article");
        box.className = "box mb-3";
        const p = document.createElement("p");
        p.textContent = j.text || j;
        box.appendChild(p);
        const meta = document.createElement("p");
        meta.className = "is-size-7 has-text-grey";
        meta.textContent = `${j.language || ""} — ${j.category || ""}`;
        box.appendChild(meta);
        container.appendChild(box);
    });
}

function renderSingle(container, joke) 
{
    container.innerHTML = "";
    if (!joke) return;
    const box = document.createElement("article");
    box.className = "box";
    const p = document.createElement("p");
    p.textContent = joke.text || joke;
    box.appendChild(p);
    const meta = document.createElement("p");
    meta.className = "is-size-7 has-text-grey";
    meta.textContent = `${joke.language || ""} — ${joke.category || ""}`;
    box.appendChild(meta);
    container.appendChild(box);
}

document.addEventListener("DOMContentLoaded", () => {
    const selLang = document.getElementById("selLang");
    const selCat = document.getElementById("selCat");
    const selNum = document.getElementById("selNum");
    const jokeId = document.getElementById("jokeId");
    const jokesContainer = document.getElementById("jokes");
    const form = document.querySelector("#form-container form") || document.querySelector("form");

    if (selLang) {
        populateSelect(
            selLang,
            LANGUAGES.map((l) => ({ value: l.code, text: l.name })),
            "value",
            "text"
        );
    }

    if (selNum) {
        populateSelect(selNum, createNumberOptions(10), "value", "text");
    }

    if (form) {
        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const language = selLang ? selLang.value : "any";
            const category = selCat ? selCat.value : "any";
            const number = selNum ? selNum.value : "all";
            const JID = jokeId.value;

            let url;
            if (number === "all") {
                url = `https://my-ip-class.onrender.com/api/v1/jokes/${encodeURIComponent(language)}/${encodeURIComponent(category)}/all`;
            } else {
                url = `https://my-ip-class.onrender.com/api/v1/jokes/${encodeURIComponent(language)}/${encodeURIComponent(category)}/${encodeURIComponent(number)}`;
            }

            jokesContainer.innerHTML = "<p>Loading…</p>";

            try {
                const resp = await fetch(url, { cache: "no-store" });
                if (!resp.ok) {
                    const txt = await resp.text();
                    jokesContainer.innerHTML = `<div class=\"box has-text-danger\">Error ${resp.status}: ${txt}</div>`;
                    return;
                }

                const body = await resp.json();
                if (body.jokes) {
                    renderJokes(jokesContainer, body.jokes);
                } else if (body.joke) {
                    renderSingle(jokesContainer, body.joke);
                } else {
                    jokesContainer.innerHTML = "<div class=\"box\">No jokes returned</div>";
                }
            } catch (err) {
                jokesContainer.innerHTML = `<div class=\"box has-text-danger\">Network error: ${err.message}</div>`;
            }
        });
    }
});

window.onload = function () {
    
};