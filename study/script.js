let isShowingDiasAno = false;

document.getElementById('toggleButton').addEventListener('click', () => {
    const mainContent = document.getElementById('mainContent');
    const diasAnoContent = document.getElementById('diasAnoContent');

    var returnButton = document.getElementById('returnButton');
    returnButton.classList.toggle('hidden');

    if (isShowingDiasAno) {
        const today = getDayOfWeek();
        updateMainContent(today);
        mainContent.style.display = 'flex';
        diasAnoContent.style.display = 'none';
    } else {
        const diasAno = JSON.parse(localStorage.getItem('diasAno'));
        let diasAnoFormatted = '';
        const today = new Date();

        for (let key in diasAno) {
            let dateParts = key.split('/');
            let date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            let label = '';
            let cardClass = '';

            const [day, month, year] = key.split('/');
            const formattedDate = new Date(`${month}/${day}/${year}`);

            const [dayConcluded, monthConcluded, yearConcluded] = diasAno[key] ? diasAno[key].split('/'):'';
            const formattedDateConcluded = new Date(`${monthConcluded}/${dayConcluded}/${yearConcluded}`);

            if (diasAno[key] === false) {
                label = `<span style="color: red;">Sem fazer</span>`;
                cardClass = 'semFazer';
            } else if (diasAno[key] && new Date(formattedDate) >= new Date(formattedDateConcluded)) {
                label = `<span style="color: green;">Feito</span>`;
                cardClass = 'concluido';
            } else if (diasAno[key] === "Não Aplicável") {
                label = `<span>Não Aplicável</span>`;
            } else {
                label = `<span style="color: orange;">Feito com atraso</span>`;
                cardClass = 'atraso';
            }
            diasAnoFormatted += `<div class="card ${cardClass}"><b>${key}</b>: ${label}</div>`;
        }

        diasAnoContent.innerHTML = diasAnoFormatted;
        mainContent.style.display = 'none';
        diasAnoContent.style.display = 'block';
    }

    isShowingDiasAno = !isShowingDiasAno;
});

document.getElementById('addButton').addEventListener('click', () => {
    const diasAno = JSON.parse(localStorage.getItem('diasAno'));
    const dayDate = document.getElementById('dayDate').textContent;
    diasAno[dayDate] = new Date().toLocaleDateString();
    localStorage.setItem('diasAno', JSON.stringify(diasAno));
    updateButtons(dayDate);
});

document.getElementById('removeButton').addEventListener('click', () => {
    const diasAno = JSON.parse(localStorage.getItem('diasAno'));
    const dayDate = document.getElementById('dayDate').textContent;
    diasAno[dayDate] = false;
    localStorage.setItem('diasAno', JSON.stringify(diasAno));
    updateButtons(dayDate);
});

function updateButtons(dayDate) {
    const diasAno = JSON.parse(localStorage.getItem('diasAno'));
    const addButton = document.getElementById('addButton');
    const removeButton = document.getElementById('removeButton');
    if (diasAno[dayDate] === false) {
        addButton.style.display = 'block';
        removeButton.style.display = 'none';
    } else {
        addButton.style.display = 'none';
        removeButton.style.display = 'block';
    }
    // Chame updateDayClasses quando a página é carregada e sempre que o conteúdo principal é atualizado
    updateDayClasses();
}

function updateMainContent(day) {
    let activities = "";

    switch (day) {
        case 'Segunda':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan" target="_blank">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="./course/index.html">CNA/CCAA (15min)</a> </div><div class="line"> <a href="./cambridge/index.html">Cambridge (1 lição)</a></div>';
            break;
        case 'Terça':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan" target="_blank">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="./cambridge/index.html">Cambridge (1 lição)</a></div><div class="line"> ChatGPT (15min)</div>';
            break;
        case 'Quarta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan" target="_blank">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="./course/index.html">CNA/CCAA (15min)</a> </div><div class="line"> <a href="./cambridge/index.html">Cambridge (1 lição)</a></div>';
            break;
        case 'Quinta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan" target="_blank">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="./cambridge/index.html">Cambridge (1 lição)</a></div><div class="line"> ChatGPT (15min)</div>';
            break;
        case 'Sexta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan" target="_blank">Rosetta Stone (30min)</a><br/></div><div class="line"> ChatGPT (15min)</div><div class="line"><a href="./song_class/" target="_blank"> Song Class</a></div>';
            break;
        case 'Sábado':
            activities = '<div class="line"><div class="line"> Series Session (40min)<br/></div><div class="line"> Movie Session (extra)</div>';
            break;
        case 'Domingo':
            activities = "Dia de descanso";
            break;
    }

    document.getElementById('dayTitle').innerText = day;
    document.getElementById('dayActivities').innerHTML = activities;
    document.getElementById('dayDate').innerText = getDateForDay(day);

    updateButtons(getDateForDay(day))
}

function getDayOfWeek() {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const now = new Date();
    return days[now.getDay()];
}

function getDateForDay(day) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const today = new Date();
    const todayIndex = days.indexOf(getDayOfWeek());
    const targetIndex = days.indexOf(day);

    const diff = todayIndex - targetIndex;
    today.setDate(today.getDate() - diff);

    return today.toLocaleDateString();
}

function updateDayClasses() {
    const diasAno = JSON.parse(localStorage.getItem('diasAno'));
    const days = document.getElementsByClassName('day');
    for (let i = 0; i < days.length; i++) {
        const dayDate = days[i].querySelector('h4').textContent;
        days[i].classList.remove('semFazer', 'atraso', 'concluido'); // Remove all possible classes

        const [day, month, year] = dayDate.split('/');
        const formattedDate = new Date(`${month}/${day}/${year}`);

        const [dayConcluded, monthConcluded, yearConcluded] = diasAno[dayDate] ? diasAno[dayDate].split('/'):'';
        const formattedDateConcluded = new Date(`${monthConcluded}/${dayConcluded}/${yearConcluded}`);

        if (diasAno[dayDate] === false && new Date(formattedDate) <= new Date()) {
            days[i].classList.add('semFazer');
        } else if (diasAno[dayDate] && new Date(formattedDate) >= new Date(formattedDateConcluded)) {
            days[i].classList.add('concluido');
        } else if (diasAno[dayDate] && new Date(formattedDate) < new Date(formattedDateConcluded)) {
            days[i].classList.add('atraso');
        } else if (diasAno[dayDate] === "Não Aplicável") {
            days[i].classList.add('naoAplicavel');
        }
    }
}

window.onload = () => {
    let diasAno = localStorage.getItem('diasAno');
    if (!diasAno) {
        localStorage.setItem('diasAno', JSON.stringify(dias2024));
    } else {
        dias2024 = JSON.parse(diasAno);
    }

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    days.forEach(day => {
        if (document.getElementById(`date${day}`))
            document.getElementById(`date${day}`).innerText = getDateForDay(day);
    });

    const today = getDayOfWeek();
    updateMainContent(today);
    // Chame updateButtons quando a página é carregada e sempre que o conteúdo principal é atualizado
    updateButtons(document.getElementById('dayDate').textContent);

    // Chame updateDayClasses quando a página é carregada e sempre que o conteúdo principal é atualizado
    updateDayClasses();
};
