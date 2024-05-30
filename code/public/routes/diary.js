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
    // saveInbody = document.querySelector(".save-inbody");

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
                selectedDate = new Date(currYear, currMonth, parseInt(target.textContent));
                popupDate.innerText = ` ${months[currMonth]} ${selectedDate.getDate()}일`;
                popup.classList.add('show');
                fetchDataForDate(selectedDate);
                // renderCalendar(); // 달력을 다시 렌더링하지 않음
                // 선택된 날짜의 스타일을 다시 적용
                document.querySelectorAll('.days li').forEach(d => d.classList.remove('selected'));
                target.classList.add('selected');
            }
        });
    });
}

const fetchDataForDate = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    fetch(`/meals?date=${formattedDate}`)
        .then(response => response.json())
        .then(data => {
            updatePopupContent(data, 'meals'); //식단 데이터 업데이트
        })
        .catch(error => console.error('Error fetching meals:', error));

    fetch(`/exercises?date=${formattedDate}`)
        .then(response => response.json())
        .then(data => {
            updatePopupContent(data, 'exercises'); //운동 데이터 업데이트
        })
        .catch(error => console.error('Error fetching exercises:', error));

}

const updatePopupContent = (data, type) => {
    if (type === 'meals') {
        const mealContainers = {
            아침: document.getElementById('uploadBox1'),
            점심: document.getElementById('uploadBox2'),
            저녁: document.getElementById('uploadBox3')
        };

        for (let key in mealContainers) {
            mealContainers[key].innerHTML = `<p>+</p><p>${key} 식단</p>`;
        }

        data.forEach(meal => {
            if (mealContainers[meal.mealType]) {
                mealContainers[meal.mealType].innerHTML = `<img src="/uploads/${meal.filename}" alt="${meal.mealType} 식단">`;
            }
        });
    } else if (type === 'exercises') {
        const exerciseList = document.getElementById('exercise-list');
        exerciseList.innerHTML = ''; // 초기화

        data.forEach(exercise => {
            const listItem = document.createElement("li");
            listItem.innerText = `  ◯ ${exercise.exercise}  [  ${exercise.reps}회 x ${exercise.sets}세트  ] `;
            const separator = document.createElement("hr");
            exerciseList.appendChild(listItem);
            exerciseList.appendChild(separator);
        });
    }
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

    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', () => {
            console.log("Add exercise button clicked");
            addExercisePopup.classList.add('show');
        });
    }

    if (closePopup) {
        closePopup.addEventListener('click', () => {
            console.log("Close button clicked");
            addExercisePopup.classList.remove('show');
        });
    }

    //팝업 창 외부 클릭 시 팝업 창 닫기
    window.addEventListener('click', (event) => {
        if (event.target == addExercisePopup) {
            addExercisePopup.classList.remove('show');
        }
    });



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
                    listItem.innerText = `  ◯ ${exerciseSelect.value}  [  ${reps.value}회 x ${sets.value}세트  ] `;
                    const separator = document.createElement("hr");
                    exerciseList.appendChild(listItem);
                    exerciseList.appendChild(separator);

                    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

                    fetch('/save-exercise', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date: formattedDate,
                            exercise: exerciseSelect.value,
                            reps: reps.value,
                            sets: sets.value
                        })
                    })
                    .then(response => response.text())
                    .then(data => {
                        console.log('Exercise saved successfully:', data);
                        addExercisePopup.classList.remove('show');
                        exerciseSelect.value = "";
                        reps.value = "";
                        sets.value = "";
                        fetchDataForDate(selectedDate); // 운동 데이터를 다시 로드하여 업데이트
                    })
                    .catch(error => {
                        console.error('Error saving exercise:', error);
                    });
                } else {
                    alert("모든 항목을 입력해주세요.");
                }
            }
        });
    }

    document.getElementById('uploadInput1').addEventListener('change', (event) => uploadImage(event, 'uploadBox1'));
    document.getElementById('uploadInput2').addEventListener('change', (event) => uploadImage(event, 'uploadBox2'));
    document.getElementById('uploadInput3').addEventListener('change', (event) => uploadImage(event, 'uploadBox3'));
});


function uploadImage(event, boxId) {
    const input = event.target;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('photo', file);

    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    formData.append('date', formattedDate);

    const mealType = boxId === 'uploadBox1' ? '아침' : boxId === 'uploadBox2' ? '점심' : '저녁';
    formData.append('mealType', mealType);

    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            const uploadBox = document.getElementById(boxId);
            uploadBox.innerHTML = `<img src="${reader.result}" alt="Uploaded Image">`;
        };
        reader.readAsDataURL(file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log('Image uploaded successfully:', data);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.querySelector('.save-inbody');
    const dateInput = document.querySelector('.input-date');
    const userIdInput = document.querySelector('.input-user-id');

    // 달력에서 선택된 날짜를 업데이트하는 함수
    function updateSelectedDate(date) {
        dateInput.value = date;
    }    
 
    
    // 인바디 데이터 저장
if (saveButton) {
    saveButton.addEventListener('click', () => {
        const height = document.querySelector('.input-height').value;
        const weight = document.querySelector('.input-weight').value;
        const muscleMass = document.querySelector('.input-muscle-mass').value;
        const fat = document.querySelector('.input-fat').value;
        const bmi = document.querySelector('.input-bmi').value;
        const fatPercentage = document.querySelector('.input-fat-percentage').value;

        if (!height || !weight || !muscleMass || !fat || !bmi || !fatPercentage) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        const inbodyData = {
            date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`, // 선택된 날짜 포함
            height: parseFloat(height),
            weight: parseFloat(weight),
            skeletalMuscleMass: parseFloat(muscleMass), // 필드 이름 수정
            bodyFatMass: parseFloat(fat), // 필드 이름 수정
            bmi: parseFloat(bmi),
            bodyFatPercentage: parseFloat(fatPercentage) // 필드 이름 수정
        };

        fetch('/save-inbody', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inbodyData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Inbody data saved successfully:', data);
            alert('인바디 데이터가 저장되었습니다.');
        })
        .catch(error => {
            console.error('Error saving inbody data:', error);
            alert('인바디 데이터를 저장하는 동안 오류가 발생했습니다.');
        });
    });
}
});
