document.addEventListener("DOMContentLoaded", () => {
    const daysContainer = document.getElementById("calendar-days");
    const monthYearText = document.getElementById("month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const timeSlots = document.querySelectorAll(".time-slot");
    const btnProximo = document.getElementById("btn-proximo");

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;
    let selectedDateObj = null;

    // Função para desabilitar horários passados no dia de hoje
    function atualizarHorarios() {
        if (!selectedDateObj) return;

        const agora = new Date();
        const ehHoje = selectedDateObj.getDate() === agora.getDate() &&
                       selectedDateObj.getMonth() === agora.getMonth() &&
                       selectedDateObj.getFullYear() === agora.getFullYear();

        const horaAtual = agora.getHours();
        const minutoAtual = agora.getMinutes();

        timeSlots.forEach(slot => {
            const timeText = slot.innerText.trim();
            const [horaSlot, minutoSlot] = timeText.split(":").map(Number);

            slot.classList.remove("disabled-slot");

            if (ehHoje) {
                if (horaSlot < horaAtual || (horaSlot === horaAtual && minutoSlot <= minutoAtual)) {
                    slot.classList.add("disabled-slot");
                    if (slot.classList.contains("selected")) {
                        slot.classList.remove("selected");
                        selectedTime = null;
                    }
                }
            }
        });
    }

    // Função para desenhar os dias do mês
    function renderCalendar() {
        if (!daysContainer || !monthYearText) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        monthYearText.innerText = `${monthNames[month]} ${year}`;
        daysContainer.innerHTML = "";

        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const prevLastDay = new Date(year, month, 0).getDate();

        // Dias do mês anterior
        for (let x = firstDayIndex; x > 0; x--) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day", "other-month");
            dayDiv.innerText = prevLastDay - x + 1;
            daysContainer.appendChild(dayDiv);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Dias do mês atual
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.innerText = i;

            const checkDate = new Date(year, month, i);

            if (checkDate < today) {
                dayDiv.classList.add("past-day");
            } else {
                // Seleção do dia
                dayDiv.addEventListener("click", () => {
                    document.querySelectorAll(".calendar-days .day").forEach(d => d.classList.remove("selected"));
                    dayDiv.classList.add("selected");

                    selectedDateObj = checkDate;
                    const diaFmt = String(i).padStart(2, '0');
                    const mesFmt = String(month + 1).padStart(2, '0');
                    selectedDate = `${diaFmt}/${mesFmt}/${year}`;

                    atualizarHorarios();
                });
            }

            daysContainer.appendChild(dayDiv);
        }
    }

    // Setas de Troca de Mês
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Seleção dos Horários
    timeSlots.forEach(slot => {
        slot.addEventListener("click", (e) => {
            e.preventDefault();
            if (slot.classList.contains("disabled-slot")) return;

            timeSlots.forEach(s => s.classList.remove("selected"));
            slot.classList.add("selected");
            selectedTime = slot.innerText.trim();
        });
    });

    // Botão Próximo -> Salva e envia para a Página 4
    if (btnProximo) {
        btnProximo.addEventListener("click", (e) => {
            e.preventDefault();

            if (!selectedDate) {
                alert("Por favor, selecione uma data no calendário!");
                return;
            }

            if (!selectedTime) {
                alert("Por favor, selecione um horário disponível!");
                return;
            }

            localStorage.setItem("data", selectedDate);
            localStorage.setItem("horario", selectedTime);

            window.location.href = "../agendamento4/index-ag4.html";
        });
    }

    renderCalendar();
});
