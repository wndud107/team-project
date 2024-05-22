

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

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = date.getDate();

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === new Date().getDate() && currMonth === new Date().getMonth()
            && currYear === new Date().getFullYear() ? "active" : "";
        let isSelected = i === selectedDate && currMonth === date.getMonth()
            && currYear === date.getFullYear() ? "selected" : "";
        liTag += `<li class="${isToday} ${isSelected}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentYearElement.innerText = `${currYear}년 \n`;
    currentMonthElement.innerText = `${months[currMonth]}`;
    daysTag.innerHTML = liTag;

    document.querySelectorAll('.days li').forEach(day => {
        day.addEventListener('click', (event) => {
            const target = event.target;
            if (!target.classList.contains('inactive')) {
                selectedDate = parseInt(target.textContent);
                date = new Date(currYear, currMonth, selectedDate);
                popupDate.innerText = ` ${months[currMonth]} ${selectedDate}일`;
                popup.classList.add('show');
                renderCalendar();
            }
        });
    });
}

renderCalendar();

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, selectedDate);
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date(currYear, currMonth, selectedDate);
        }
        monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;
        renderCalendar();
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

monthPicker.addEventListener('change', (event) => {
    const [year, month] = event.target.value.split('-');
    currYear = parseInt(year);
    currMonth = parseInt(month) - 1;
    renderCalendar();
});

closePopup.addEventListener('click', () => {
    popup.classList.remove('show');
});

monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;

function previewImage(event, boxId) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function() {
        const dataURL = reader.result;
        const uploadBox = document.getElementById(boxId);
        uploadBox.innerHTML = `<img src="${dataURL}" alt="Uploaded Image">`;
    };
    reader.readAsDataURL(input.files[0]);
}


document.addEventListener("DOMContentLoaded", function() {
    const addExercisePopup = document.getElementById("popup-choice-exercise");
    const closePopup = document.querySelector(".close2");
    const addExerciseButton = document.getElementById("btn-add-exercise");
    const addExerciseFormButton = document.getElementById("add-exercise-button");
    const exerciseList = document.getElementById("exercise-list");

    // 요소 선택 확인
    console.log("addExercisePopup:", addExercisePopup);
    console.log("closePopup:", closePopup);
    console.log("addExerciseButton:", addExerciseButton);
    console.log("addExerciseFormButton:", addExerciseFormButton);
    console.log("exerciseList:", exerciseList);

    // "운동 추가하기" 버튼 클릭 시 팝업 창 표시
    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', () => {
            console.log("Add exercise button clicked");
            addExercisePopup.classList.add('show');
        });
    } else {
        console.error("Add exercise button not found");
    }

    // 닫기 버튼 클릭 시 팝업 창 닫기
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            console.log("Close button clicked");
            addExercisePopup.classList.remove('show');
        });
    } else {
        console.error("Close button not found");
    }

    // 팝업 창 외부 클릭 시 팝업 창 닫기
    window.addEventListener('click', (event) => {
        if (event.target == addExercisePopup) {
            console.log("Outside popup clicked");
            addExercisePopup.classList.remove('show');
        }
    });

    // 팝업에서 운동 추가하기
    if (addExerciseFormButton) {
        addExerciseFormButton.addEventListener('click', () => {
            const exerciseSelect = document.getElementById("exercise-select");
            const reps = document.getElementById("reps");
            const sets = document.getElementById("sets");

            // 요소 선택 확인
            console.log("exerciseSelect:", exerciseSelect);
            console.log("reps:", reps);
            console.log("sets:", sets);

            if (exerciseSelect && reps && sets) {
                if (exerciseSelect.value && reps.value && sets.value) {
                    const listItem = document.createElement("li");
                    listItem.innerText = `  ◯ ${exerciseSelect.value}  [  ${reps.value}회 x ${sets.value}세트  ] ` ;
                    const separator = document.createElement("hr");
                    exerciseList.appendChild(listItem);
                    exerciseList.appendChild(separator);
                    
                

                    // 팝업 창 닫기 및 초기화
                    addExercisePopup.classList.remove('show');
                    exerciseSelect.value = "";
                    reps.value = "";
                    sets.value = "";
                } else {
                    alert("모든 항목을 입력해주세요.");
                }
            } else {
                console.error("One or more elements not found");
            }
        });
    } else {
        console.error("Add exercise form button not found");
    }
});

