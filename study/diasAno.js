let dias2024 = {};

// Loop através de cada mês
for (let month = 1; month <= 12; month++) {
    let daysInMonth;

    // Verifique se o mês é fevereiro
    if (month === 2) {
        // 2024 é um ano bissexto, então fevereiro tem 29 dias
        daysInMonth = 29;
    } else if (month in [4, 6, 9, 11]) {
        // Abril, junho, setembro e novembro têm 30 dias
        daysInMonth = 30;
    } else {
        // Os outros meses têm 31 dias
        daysInMonth = 31;
    }

    // Loop através de cada dia no mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        // Formate o mês e o dia para sempre terem dois dígitos
        let formattedMonth = month.toString().padStart(2, '0');
        let formattedDay = day.toString().padStart(2, '0');

        // Crie a chave no formato 'DD/MM/AAAA'
        let key = `${formattedDay}/${formattedMonth}/2024`;

        // Verifique se a data é anterior a 13/01/2024
        if (month < 1 || (month === 1 && day < 13)) {
            dias2024[key] = "Não Aplicável";
        } else {
            // Defina a chave para null
            dias2024[key] = false;
        }
    }
}