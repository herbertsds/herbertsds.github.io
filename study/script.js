function updateMainContent(day) {
    let activities = "";

    switch(day) {
        case 'Segunda':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="https://www.bbc.co.uk/learningenglish">BBC (30min)</a></div>';
            break;
        case 'Terça':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> CNA/CCAA (30min)</div>';
            break;
        case 'Quarta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> <a href="https://www.cambridgeenglish.org/learning-english/activities-for-learners?rows=12">Cambridge (30min)</a></div>';
            break;
        case 'Quinta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> CNA/CCAA (30min)</div>';
            break;
        case 'Sexta':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> Song Class (30min)</div>';
            break;
        case 'Sábado':
            activities = '<div class="line"><a href="https://totale.rosettastone.com/plan">Rosetta Stone (30min)</a><br/></div><div class="line"> CNA/CCAA (30min)<br/></div><div class="line"> Serie Session (40min)<br/></div><div class="line"> Movie Session (extra)</div>';
            break;
        case 'Domingo':
            activities = "Dia de descanso";
            break;
    }

    document.getElementById('dayTitle').innerText = day;
    document.getElementById('dayActivities').innerHTML = activities;
}

function getDayOfWeek() {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const now = new Date();
    return days[now.getDay()];
}

window.onload = () => {
    const today = getDayOfWeek();
    updateMainContent(today);
};
