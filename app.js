
const STORAGE_KEY = "people-checkin-v2";

let people = loadPeople();

const categoryDefaults = {
    inner: {
        contactFrequency: 14,
        meetupFrequency: 30,
        label: "❤️ Inner Circle"
    },
    close: {
        contactFrequency: 30,
        meetupFrequency: 60,
        label: "😊 Close Friend"
    },
    friend: {
        contactFrequency: 60,
        meetupFrequency: 120,
        label: "🙂 Friend"
    },
    community: {
        contactFrequency: 180,
        meetupFrequency: 365,
        label: "🌱 Community"
    }
};

const addPersonBtn = document.getElementById("addPersonBtn");
const savePersonBtn = document.getElementById("savePersonBtn");
const cancelPersonBtn = document.getElementById("cancelPersonBtn");

const personModal = document.getElementById("personModal");
const personDrawer = document.getElementById("personDrawer");

const searchInput = document.getElementById("searchInput");

const personCategory = document.getElementById("personCategory");
const contactFrequency = document.getElementById("contactFrequency");
const meetupFrequency = document.getElementById("meetupFrequency");

let editingPersonId = null;

initialize();
render();

function initialize() {

    updateDefaultFrequencies();

    personCategory.addEventListener(
        "change",
        updateDefaultFrequencies
    );

    addPersonBtn.addEventListener(
        "click",
        openAddModal
    );

    cancelPersonBtn.addEventListener(
        "click",
        closeModal
    );

    savePersonBtn.addEventListener(
        "click",
        savePerson
    );

    searchInput.addEventListener(
        "input",
        render
    );
}

function loadPeople() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

function savePeople() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(people)
    );

    render();
}

function generateId() {

    return crypto.randomUUID();
}

function updateDefaultFrequencies() {

    const category =
        personCategory.value;

    const defaults =
        categoryDefaults[category];

    contactFrequency.value =
        defaults.contactFrequency;

    meetupFrequency.value =
        defaults.meetupFrequency;
}

function openAddModal() {

    editingPersonId = null;

    document.getElementById("personName").value = "";
    document.getElementById("personBirthday").value = "";
    document.getElementById("personNotes").value = "";
    document.getElementById("importantPerson").checked = false;
    document.getElementById("typeLocal").checked = false;
    document.getElementById("typeLongDistance").checked = false;
    document.getElementById("typeProfessional").checked = false;
    document.getElementById("typeBachata").checked = false;

    updateDefaultFrequencies();

    personModal.classList.remove("hidden");
}

function closeModal() {

    personModal.classList.add("hidden");
}

function savePerson() {

    const person = {

        id: generateId(),

        name:
            document.getElementById("personName").value,

        category:
            personCategory.value,

        birthday:
            document.getElementById("personBirthday").value,

        notes:
            document.getElementById("personNotes").value,

        important:
            document.getElementById("importantPerson").checked,
        relationshipTypes: [
            document.getElementById("typeLongDistance").checked ? "longDistance" : null,
            document.getElementById("typeProfessional").checked ? "professional" : null,
            document.getElementById("typeBachata").checked ? "bachata" : null
        ].filter(Boolean),

        contactFrequency:
            Number(contactFrequency.value),

        meetupFrequency:
            Number(meetupFrequency.value),

        contacts: [],

        meetups: [],

        archived: false
    };

    if (!person.name.trim()) {
        alert("Please enter a name.");
        return;
    }

    people.push(person);

    savePeople();

    closeModal();
}

function render() {

    const query =
        searchInput.value.toLowerCase();

    const filteredPeople =
        people.filter(person => {

            const searchable =
                (
                    person.name +
                    " " +
                    person.notes
                ).toLowerCase();

            return searchable.includes(query);
        });

    renderList(
        "attentionList",
        filteredPeople
    );

    renderList(
        "everyoneList",
        filteredPeople
    );

    document.getElementById(
        "plannedList"
    ).innerHTML =
        "<div class='person-card'>Planned items coming in next version</div>";

    document.getElementById(
        "birthdayList"
    ).innerHTML =
        "<div class='person-card'>Birthdays coming in next version</div>";

    document.getElementById(
        "meetupList"
    ).innerHTML =
        "<div class='person-card'>Meetup tracking coming in next version</div>";
}

function renderList(
    containerId,
    list
) {

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML =
            "<div class='person-card'>No people yet.</div>";

        return;
    }

    list.forEach(person => {

        const card =
            document.createElement("div");

        card.className =
            "person-card status-good";

        const star =
            person.important
                ? "<span class='important-star'>⭐</span>"
                : "";

        card.innerHTML = `
            <h3>
                ${person.name}
                ${star}
            </h3>

            <div class="person-meta">
                ${categoryDefaults[person.category].label}
            </div>
        `;

        card.addEventListener(
            "click",
            () => openDrawer(person)
        );

        container.appendChild(card);
    });
}

function formatRelationshipTypes(types) {

    function getLastContact(person) {

    if (!person.contacts || !person.contacts.length) {
        return null;
    }

    return person.contacts[
        person.contacts.length - 1
    ];
}

function getLastMeetup(person) {

    if (!person.meetups || !person.meetups.length) {
        return null;
    }

    return person.meetups[
        person.meetups.length - 1
    ];
}

function daysSince(dateString) {

    if (!dateString) {
        return null;
    }

    const date =
        new Date(dateString);

    const today =
        new Date();

    return Math.floor(
        (today - date)
        /
        (1000 * 60 * 60 * 24)
    );
}

function humanTimeAgo(dateString) {

    const days =
        daysSince(dateString);

    if (days === null) {
        return "Never";
    }

    if (days === 0) {
        return "Today";
    }

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    if (days < 30) {
        return `${Math.floor(days / 7)} weeks ago`;
    }

    if (days < 365) {
        return `${Math.floor(days / 30)} months ago`;
    }

    return `${Math.floor(days / 365)} years ago`;
}

    function logContact(personId) {

    const person =
        people.find(
            p => p.id === personId
        );

    if (!person) {
        return;
    }

    person.contacts.push(
        new Date().toISOString()
    );

    savePeople();

    openDrawer(person);
}

function logMeetup(personId) {

    const person =
        people.find(
            p => p.id === personId
        );

    if (!person) {
        return;
    }

    const now =
        new Date().toISOString();

    person.meetups.push(now);

    person.contacts.push(now);

    savePeople();

    openDrawer(person);
}

    if (!types.length) {
        return "No relationship types";
    }

    const labels = {
        local: "📍 Local",
        longDistance: "🌍 Long Distance",
        professional: "💼 Professional",
        bachata: "💃 Bachata"
    };

    return types
        .map(type => labels[type] || type)
        .join(" • ");
}


function openDrawer(person) {

    const drawerBody =
        document.getElementById("drawerBody");

    drawerBody.innerHTML = `
        <h2>${person.name}</h2>

        <p>
            ${categoryDefaults[person.category].label}
        </p>

        <p>
            ${formatRelationshipTypes(person.relationshipTypes || [])}
        </p>
        
        <p>
            Birthday:
            ${person.birthday || "Not set"}
        </p>

        <p>
            Last contact:
                ${humanTimeAgo(
                getLastContact(person)
            )}
        </p>

        <p>
            Last meetup:
            ${humanTimeAgo(
                getLastMeetup(person)
            )}
        </p>

        <p>
            Notes:
        </p>

        <p>
            ${person.notes || "No notes"}
        </p>
    `;

    personDrawer.classList.add("open");

    <div class="quick-actions">

    <button
        onclick="logContact('${person.id}')"
    >
        ✅ Contacted Today
    </button>

    <button
        onclick="logMeetup('${person.id}')"
    >
        ☕ Met Up Today
    </button>

</div>
}

document.addEventListener(
    "click",
    event => {

        if (
            personDrawer.classList.contains("open")
            &&
            !event.target.closest(".drawer-content")
            &&
            !event.target.closest(".person-card")
        ) {
            personDrawer.classList.remove("open");
        }
    }
);
