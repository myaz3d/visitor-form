const countries = ["United States (USA)", "Canada (CAN)", "United Kingdom (GBR)", "Australia (AUS)", "France (FRA)", "Germany (DEU)", "China (CHN)", "India (IND)", "Japan (JPN)", "Brazil (BRA)"];

function populateWeeks() {
    const weekDropdown = document.getElementById('week');
    const year = 2025;
    const weeksInYear = 52;
    
    for (let week = 1; week <= weeksInYear; week++) {
        const startDate = new Date(year, 0, (week - 1) * 7 + 1); // Start of the week
        const endDate = new Date(year, 0, week * 7); // End of the week
        const option = document.createElement('option');
        option.value = `Week ${week}`;
        option.textContent = `Week ${week} (${formatDate(startDate)} - ${formatDate(endDate)})`;
        weekDropdown.appendChild(option);
    }
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function populateCountries() {
    const countryDropdowns = document.querySelectorAll('.country');
    countryDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">--Select Country--</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            dropdown.appendChild(option);
        });
    });
}

function updateTotals(element) {
    const row = element.closest('tr');
    const domesticMale = parseInt(row.querySelector('.domestic-male').value) || 0;
    const domesticFemale = parseInt(row.querySelector('.domestic-female').value) || 0;
    const internationalMale = parseInt(row.querySelector('.international-male').value) || 0;
    const internationalFemale = parseInt(row.querySelector('.international-female').value) || 0;

    row.querySelector('.domestic-total').textContent = domesticMale + domesticFemale;
    row.querySelector('.international-total').textContent = internationalMale + internationalFemale;

    calculateGrandTotals();
}

function calculateGrandTotals() {
    const rows = document.querySelectorAll('#visitorTable tbody tr');
    let grandDomesticMale = 0;
    let grandDomesticFemale = 0;
    let grandInternationalMale = 0;
    let grandInternationalFemale = 0;

    rows.forEach(row => {
        grandDomesticMale += parseInt(row.querySelector('.domestic-male').value) || 0;
        grandDomesticFemale += parseInt(row.querySelector('.domestic-female').value) || 0;
        grandInternationalMale += parseInt(row.querySelector('.international-male').value) || 0;
        grandInternationalFemale += parseInt(row.querySelector('.international-female').value) || 0;
    });

    const grandTotalMale = grandDomesticMale + grandInternationalMale;
    const grandTotalFemale = grandDomesticFemale + grandInternationalFemale;

    document.getElementById('grandTotalMale').textContent = grandTotalMale;
    document.getElementById('grandTotalFemale').textContent = grandTotalFemale;
    document.getElementById('grandDomesticTotal').textContent = grandDomesticMale + grandDomesticFemale;
    document.getElementById('grandInternationalTotal').textContent = grandInternationalMale + grandInternationalFemale;
    document.getElementById('overallGrandTotal').textContent = grandTotalMale + grandTotalFemale;
}

function addRow() {
    const rowCount = parseInt(document.getElementById('rowCount').value) || 1;
    const tbody = document.querySelector('#visitorTable tbody');
    
    for (let i = 0; i < rowCount; i++) {
        const newRow = document.createElement('tr');
        const rowIndex = tbody.querySelectorAll('tr').length + 1;

        newRow.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="country"></select>
            </td>
            <td><input type="number" class="domestic-male" oninput="updateTotals(this)" min="0"></td>
            <td><input type="number" class="domestic-female" oninput="updateTotals(this)" min="0"></td>
            <td class="domestic-total">0</td>
            <td><input type="number" class="international-male" oninput="updateTotals(this)" min="0"></td>
            <td><input type="number" class="international-female" oninput="updateTotals(this)" min="0"></td>
            <td class="international-total">0</td>
        `;

        tbody.appendChild(newRow);
    }

    populateCountries();
    calculateGrandTotals();
}

document.getElementById('addRow').addEventListener('click', function() {
    addRow();
});

document.getElementById('reset').addEventListener('click', function() {
    location.reload(); // Reload the page to reset the form
});

document.getElementById('submit').addEventListener('click', async function() {
    const entryPoint = document.getElementById('entryPoint').value;
    const week = document.getElementById('week').value;

    const countryRows = [];
    document.querySelectorAll('#visitorTable tbody tr').forEach(row => {
        const country = row.querySelector('.country').value;
        const domesticMale = parseInt(row.querySelector('.domestic-male').value) || 0;
        const domesticFemale = parseInt(row.querySelector('.domestic-female').value) || 0;
        const internationalMale = parseInt(row.querySelector('.international-male').value) || 0;
        const internationalFemale = parseInt(row.querySelector('.international-female').value) || 0;

        countryRows.push({
            country,
            domesticMale,
            domesticFemale,
            internationalMale,
            internationalFemale
        });
    });

    const formData = {
        entryPoint,
        week,
        countryRows
    };

    // Send the form data to the Google Apps Script Web App
    const response = await fetch('https://script.google.com/macros/s/AKfycbydMs8qpXd8MPXONCw9E7sBinusuYtmnSnUMJxHlXqsgFMiHrSHVSHHyzrxzBfIt97OWg/exec', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    if (result.status === 'success') {
        alert('Form submitted successfully!');
    } else {
        alert('Form submission failed.');
    }
});

window.onload = function() {
    populateWeeks();
    for (let i = 0; i < 5; i++) { // Start with 5 default rows
        addRow();
    }
};
