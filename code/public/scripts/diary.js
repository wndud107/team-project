let months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const daysTag = document.querySelector(".days"),
    currentYearElement = document.querySelector(".current-year"),
    currentMonthElement = document.querySelector(".current-month"),
    prevNextIcon = document.querySelectorAll(".icons span"),
    monthPicker = document.getElementById("monthPicker"),
    datePicker = document.getElementById("datePicker"),
    popup = document.getElementById("popup"),
    popupDate = document.getElementById("popup-date"),
    closePopup = document.querySelector(".close"),
    addExercisePopup = document.getElementById("popup-choice-exercise"),
    exerciseList = document.getElementById("exercise-list"),
    addExerciseButton = document.getElementById("btn-add-exercise"),
    todayWeight = document.getElementById("today-weight"),
    addWeightButton = document.querySelector(".btn-save-inbody");

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
        let isSelected = i === selectedDate ? "selected" : "";
        liTag += `<li class="${isToday} ${isSelected}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
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
                popup.classList.add('show'); // 팝업 기능
                fetchDataForDate(selectedDate);
                fetchWeight(); // 체중 데이터를 불러와서 todayWeight 요소에 표시
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
            updatePopupContent(data, 'meals');
        })
        .catch(error => console.error('Error fetching meals:', error));

    fetch(`/exercises?date=${formattedDate}`)
        .then(response => response.json())
        .then(data => {
            updatePopupContent(data, 'exercises');
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
        exerciseList.innerHTML = ''; // 초기화

        data.forEach((exercise) => {
            const listItem = document.createElement("li");
            const checkboxId = `exerciseCheckbox${exercise._id}`;

            listItem.innerHTML = `
                <span>
                    <input type="checkbox" class="exercise-checkbox" id="${checkboxId}" ${exercise.checked ? 'checked' : ''} >
                    <label for="${checkboxId}" class="exercise-label"> 
                        ${exercise.exercise} [${exercise.reps}회 x ${exercise.sets}세트]
                        <button class="delete-exercise">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                        </button>
                    </label>
                </span>
            `;
            exerciseList.appendChild(listItem);

            // 체크박스 상태 업데이트 함수
            const checkExercise = listItem.querySelector('.exercise-checkbox');
            checkExercise.addEventListener('click', () => {
                fetch('/update-exercise', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: exercise._id, checked: checkExercise.checked }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Update successful:', data);
                })
                .catch(error => console.error('Error updating status:', error));
            });

            // 삭제 버튼 클릭 이벤트 추가
            const deleteButton = listItem.querySelector('.delete-exercise');
            deleteButton.addEventListener('click', () => {
                fetch(`/delete-exercise`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: exercise.date,
                        exercise: exercise.exercise,
                        reps: exercise.reps,
                        sets: exercise.sets,
                        id: exercise._id
                    })
                })
                .then(response => response.text())
                .then(data => {
                    console.log('Exercise deleted successfully:', data);
                    exerciseList.removeChild(listItem);
                })
                .catch(error => {
                    console.error('Error deleting exercise:', error);
                });
            });
        });
    }
}

const fetchWeight = async () => {
    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    try {
        const response = await fetch(`/weight?date=${formattedDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length > 0) {
            todayWeight.innerText = data[0].weight;
        } else {
            todayWeight.innerText = '';
        }
    } catch (error) {
        console.error('Error fetching weight:', error);
    }
}

// 달력 렌더링
renderCalendar();

// 이전 달, 다음 달 버튼 이벤트 핸들러
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

// 날짜 선택 이벤트 핸들러
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

// 월 선택 이벤트 핸들러
monthPicker.addEventListener('change', (event) => {
    const [year, month] = event.target.value.split('-');
    currYear = parseInt(year);
    currMonth = parseInt(month) - 1;
    renderCalendar();
});

monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;

// 이미지 미리보기 함수
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

// DOMContentLoaded 이벤트 핸들러
document.addEventListener("DOMContentLoaded", function() {
    const closePopup = document.querySelector(".close2");
    const addExerciseFormButton = document.getElementById("add-exercise-button");

    // 페이지 로드 시 오늘 날짜 데이터를 가져오기
    const today = new Date();
    selectedDate = today;
    fetchDataForDate(today);  // 오늘 날짜의 데이터를 가져오는 함수 호출
    fetchWeight();

    document.querySelectorAll('.days li').forEach(day => {
        if (parseInt(day.textContent) === today.getDate() && !day.classList.contains('inactive')) {
            day.classList.add('selected');
        }
    });
    // 선택된 날짜를 창 안에 표시
    popupDate.innerText = ` ${months[today.getMonth()]} ${today.getDate()}일`;
    popup.classList.add('show');

    // 운동 추가 버튼 이벤트 핸들러 운동 추가 팝업창 띄우기
    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', () => {
            addExercisePopup.classList.add('show');
        });
    }

    // 팝업 닫기 버튼 이벤트 핸들러
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            addExercisePopup.classList.remove('show');
        });
    }

    // 운동 추가 폼 버튼 이벤트 핸들러
    if (addExerciseFormButton) {
        addExerciseFormButton.addEventListener('click', (event) => {
            event.preventDefault(); // 폼 제출 기본 동작 방지
            const exerciseSelect = document.getElementById("exercise-select");
            const reps = document.getElementById("reps");
            const sets = document.getElementById("sets");

            if (exerciseSelect && reps && sets) {
                if (exerciseSelect.value && reps.value && sets.value) {
                    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

                    const exerciseData = {
                        date: formattedDate,
                        exercise: exerciseSelect.value,
                        reps: reps.value,
                        sets: sets.value
                    };

                    console.log('Sending exercise data:', exerciseData);

                    fetch('/save-exercise', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(exerciseData)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Exercise saved successfully:', data);
                        addExercisePopup.classList.remove('show');

                        const listItem = document.createElement("li");
                        const checkboxId = `exerciseCheckbox${data._id}`; // 서버에서 응답 받은 데이터의 _id를 사용

                        listItem.innerHTML = `
                            <span>
                              <input type="checkbox" class="exercise-checkbox" id="${checkboxId}">
                              <label for="${checkboxId}" class="exercise-label">
                                ${exerciseSelect.value} [${reps.value}회 x ${sets.value}세트]
                                <button class="delete-exercise">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                                  </svg>
                                </button>
                              </label>
                            </span>
                        `;
                        exerciseList.appendChild(listItem);

                        // 체크박스 상태 업데이트 함수
                        const checkExercise = listItem.querySelector('.exercise-checkbox');
                        checkExercise.addEventListener('click', () => {
                            fetch('/update-exercise', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id: checkboxId, checked: checkExercise.checked }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                console.log('Update successful:', data);
                            })
                            .catch(error => console.error('Error updating status:', error));
                        });

                        // 삭제 버튼 클릭 이벤트 추가
                        const deleteButton = listItem.querySelector('.delete-exercise');
                        deleteButton.addEventListener('click', () => {
                            fetch('/delete-exercise', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ id: checkboxId })
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.text();
                            })
                            .then(data => {
                                console.log('Exercise deleted successfully:', data);
                                exerciseList.removeChild(listItem);
                            })
                            .catch(error => {
                                console.error('Error deleting exercise:', error);
                            });
                        });

                        exerciseSelect.value = "";
                        reps.value = "";
                        sets.value = "";
                        fetchDataForDate(selectedDate);
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

    // 식단 사진 업로드 이벤트 핸들러
    document.getElementById('uploadInput1').addEventListener('change', (event) => uploadImage(event, 'uploadBox1'));
    document.getElementById('uploadInput2').addEventListener('change', (event) => uploadImage(event, 'uploadBox2'));
    document.getElementById('uploadInput3').addEventListener('change', (event) => uploadImage(event, 'uploadBox3'));

    // 눈바디 사진 미리보기 함수
    function previewInbodyImage(event) {
        const placeholder = document.getElementById('photo-placeholder');
        const file = event.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            placeholder.innerHTML = '<img src="' + e.target.result + '" alt="nunbody image">';
        }
        reader.readAsDataURL(file);
        }
    }

    // 이미지 업로드 함수
    function uploadImage(event, boxId) {
        const input = event.target;
        const file = input.files[0];
        const formData = new FormData();
        formData.append('photo', file);

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

    // 체중을 저장하는 이벤트 리스너
    if(addWeightButton) {
        addWeightButton.addEventListener("click", async function(event) {
            event.preventDefault();  // 폼 제출 기본 동작 방지
            const weightInput = document.getElementById("weight");
            const weight = weightInput.value.trim(); // 정돈된 데이터 보내기
            const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            
            if (weight && formattedDate) {
                const weightData = {
                    date: formattedDate,
                    weight: weight
                };
                console.log('Sending weight data:', weightData);

                try {

                    const response = await fetch('/save-weight', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(weightData)
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    console.log('Weight saved successfully:', data);

                    // 저장 후 todayWeight 요소에 체중 데이터 표시
                    todayWeight.innerHTML = `<p class="p-weight">${weight}</p>`;
                    weightInput.value = ""; // 입력 필드 초기화

                } catch (error) {
                    console.error('Error saving weight:', error);
                }
            } else {
                alert("체중을 입력해주세요.");
            }
        });
    }
});


