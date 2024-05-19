let months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const daysTag = document.querySelector(".days"),
      currentYearElement = document.querySelector(".current-year"),
      currentMonthElement = document.querySelector(".current-month"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      monthPicker = document.getElementById("monthPicker"),
      datePicker = document.getElementById("datePicker"),
    popup = document.getElementById("popup"),
    popupDate = document.getElementById("popup-date"),
    closePopup = document.querySelector(".close");


// 새로운 날짜, 현재 연도 및 월 가져오기
let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = date.getDate();

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // 월의 첫 번째 날 가져오기
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // 월의 마지막 날짜 가져오기
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // 월의 마지막 날 가져오기
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // 이전 월의 마지막 날짜 가져오기
     let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { // 이전 월의 마지막 날 li 생성
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // 현재 월의 모든 날짜 li 생성
        // 현재 날짜, 월 및 연도가 일치하는 경우 li에 active 클래스 추가
        let isToday = i === new Date().getDate() && currMonth === new Date().getMonth()
            && currYear === new Date().getFullYear() ? "active" : "";
        // 선택된 날짜에 selected 클래스 추가
        let isSelected = i === selectedDate && currMonth === date.getMonth() 
            && currYear === date.getFullYear() ? "selected" : "";
        liTag += `<li class="${isToday} ${isSelected}">${i}</li>`;   
    }

    for (let i = lastDayofMonth; i < 6; i++) { // 다음 월의 첫 번째 날 li 생성
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentYearElement.innerText = `${currYear}년 \n`; // 연도 텍스트 설정
    currentMonthElement.innerText = `${months[currMonth]}`; // 월 텍스트 설정
    daysTag.innerHTML = liTag;

    // 날짜 클릭 이벤트 추가
    document.querySelectorAll('.days li').forEach(day => {
        day.addEventListener('click', (event) => {
            const target = event.target;
            if (!target.classList.contains('inactive')) {
                selectedDate = parseInt(target.textContent);
                date = new Date(currYear, currMonth, selectedDate);
                // datePicker.value = date.toISOString().split('T')[0];
                popupDate.innerText = `${currYear}년 ${months[currMonth]} ${selectedDate}일`;
                popup.classList.add('show');
                renderCalendar();
            }
        });
    });
}

renderCalendar();

prevNextIcon.forEach(icon => { // 이전 및 다음 아이콘 가져오기
    icon.addEventListener("click", () => { // 두 아이콘에 클릭 이벤트 추가
        // 클릭된 아이콘이 이전 아이콘이면 현재 월을 1 감소, 그렇지 않으면 1 증가
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) { // 현재 월이 0보다 작거나 11보다 큰 경우
            // 현재 연도 및 월의 새 날짜를 생성하고 이를 날짜 값으로 전달
            date = new Date(currYear, currMonth, selectedDate);
            currYear = date.getFullYear(); // 새 날짜 연도로 현재 연도 업데이트
            currMonth = date.getMonth(); // 새 날짜 월로 현재 월 업데이트
        } else {
            date = new Date(currYear, currMonth, selectedDate); // 현재 날짜를 날짜 값으로 전달
        }
        monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`; // 월 선택기 업데이트
        renderCalendar(); // renderCalendar 함수 호출
    });
});

if (datePicker) {
    datePicker.addEventListener('change', (event) => {
        const [year, month, day] = event.target.value.split('-');
        currYear = parseInt(year);
        currMonth = parseInt(month) - 1;
        selectedDate = parseInt(day);
        date = new Date(currYear, currMonth, selectedDate);
        renderCalendar();
    });
}

// 월 선택기의 값이 변경될 때 달력 업데이트
monthPicker.addEventListener('change', (event) => {
    const [year, month] = event.target.value.split('-');
    currYear = parseInt(year);
    currMonth = parseInt(month) - 1;
    renderCalendar();
});

closePopup.addEventListener('click', () => {
    popup.classList.remove('show');
});

// 날짜 선택기의 값이 변경될 때 달력 업데이트
// datePicker.addEventListener('change', (event) => {
//     const [year, month, day] = event.target.value.split('-');
//     currYear = parseInt(year);
//     currMonth = parseInt(month) - 1;
//     selectedDate = parseInt(day);
//     date = new Date(currYear, currMonth, selectedDate);
//     renderCalendar();
// });

// 월 선택기 값 초기화
monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;
// 날짜 선택기 값 초기화
// datePicker.value = date.toISOString().split('T')[0];
// datePicker.value = date.toISOString().split('T')[0];





