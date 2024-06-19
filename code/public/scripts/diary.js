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
    addWeightButton = document.querySelector(".btn-save-inbody"),
    morningMeal = document.getElementById("uploadBox1"),
    lunchMeal = document.getElementById("uploadBox2"),
    dinnerMeal = document.getElementById("uploadBox3"),
    nunbody = document.getElementById("uploadBox4"),
    addNunbodyButton = document.querySelector(".saveNunbody");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = date.getDate(),
    exerciseLogs = [];


document.addEventListener("DOMContentLoaded", async function() {
    // 페이지가 로드된 후에 초기화 작업 수행
    await initializePage();
    });
    
    async function initializePage() {
    await fetchExerciseLogs();
    
    // 로컬 스토리지에서 저장된 선택된 날짜 불러오기
    let storedDate = localStorage.getItem('selectedDate');
    if (storedDate) {
        selectedDate = new Date(storedDate);
    } else {
        selectedDate = new Date();
    }
    
    // 달력 렌더링 및 선택된 날짜에 대한 데이터 로드
    renderCalendar();
    fetchDataForDateAndExercise(selectedDate);
    fetchWeight();
    
    // 선택된 날짜 강조 표시
    highlightSelectedDate();
    
    }
      

function highlightSelectedDate() {
    document.querySelectorAll('.days li').forEach(day => {
      const dayDate = new Date(currYear, currMonth, parseInt(day.textContent));
      if (dayDate.toDateString() === selectedDate.toDateString() && !day.classList.contains('inactive')) {
        day.classList.add('selected');
      }
    });
  
    popupDate.innerText = ` ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}일`;
    popup.classList.add('show');
  }
  

////////////////// 달력 ///////////////////

// 달력 렌더링 함수
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
        const formattedDate = `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const log = exerciseLogs.find(log => log._id === formattedDate);
        let hasExercise = log && log.count > 0 ? "has-exercise" : "";
        let allChecked = log && log.allChecked ? "all-checked" : "";

        liTag += `<li class="${isToday} ${isSelected} ${hasExercise} ${allChecked}" data-date="${formattedDate} ">${i}</li>`;    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }
    currentYearElement.innerText = `${currYear}년 \n`;
    currentMonthElement.innerText = `${months[currMonth]}`;
    daysTag.innerHTML = liTag;

    document.querySelectorAll('.days li').forEach(day => {
        day.addEventListener('click', async (event) => {
            const target = event.target;
            if (!target.classList.contains('inactive')) {
                selectedDate = new Date(currYear, currMonth, parseInt(target.textContent));
                popupDate.innerText = ` ${months[currMonth]} ${selectedDate.getDate()}일`;
                popup.classList.add('show'); // 팝업 기능
                fetchDataForDateAndExercise(selectedDate);
                fetchWeight(); // 체중 데이터를 불러와서 todayWeight 요소에 표시
                document.querySelectorAll('.days li').forEach(d => d.classList.remove('selected'));
                target.classList.add('selected');
            }
        });
    });
};

////////// 운동 //////////

// DOMContentLoaded 이벤트 핸들러
document.addEventListener("DOMContentLoaded", async function() {
    await fetchExerciseLogs();
    const closePopup = document.querySelector(".close2");
    const addExerciseFormButton = document.getElementById("add-exercise-button");
    // 페이지 로드 시 오늘 날짜 데이터를 가져오기
    const today = new Date();
    selectedDate = today;
    fetchDataForDateAndExercise(today);  // 오늘 날짜의 데이터를 가져오는 함수 호출
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
                                return response.json();
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
                        fetchDataForDateAndExercise(selectedDate);

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
});

// 운동 데이터 가져오기
const fetchExerciseData = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    fetch(`/exercises?date=${formattedDate}`)
        .then(response => response.json())
        .then(data => updateExercisesPopupContent(data))
        .catch(error => console.error('Error fetching exercise data:', error));
};

// 운동 추가하기
const updateExercisesPopupContent = (data) => {
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

        const checkExercise = listItem.querySelector('.exercise-checkbox');
        checkExercise.addEventListener('click', () => {
            fetch('/update-exercise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: exercise._id, date: exercise.date, checked: checkExercise.checked }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Update successful:', data);
            })
            .catch(error => console.error('Error updating status:', error));
        });

        const deleteButton = listItem.querySelector('.delete-exercise');
        deleteButton.addEventListener('click', () => {
            fetch('/delete-exercise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: exercise._id, date: exercise.date })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();

            })
            .then(data => {
                console.log('Exercise deleted successfully:', data);
                exerciseList.removeChild(listItem);
                fetchExerciseLogs();
            })
            .catch(error => {
                console.error('Error deleting exercise:', error);
            });
        });
    });
};

// 운동 한 날인지 확인 관련
const fetchExerciseLogs = async () => {
    try {
        const response = await fetch('/exercise-logs');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        exerciseLogs = await response.json();
        console.log('Exercise logs:', exerciseLogs);  // 가져온 데이터 확인
        renderCalendar();  // 운동 로그 가져온 후 달력 다시 렌더링
    } catch (error) {
        console.error('Error fetching exercise logs:', error);
    }
};

// 사진 미리보기 및 저장 버튼 표시
function previewImage(event, uploadBoxId, saveButtonId) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const box = document.getElementById(uploadBoxId);
     
            const imgElement = box.querySelector('img');
            if (imgElement) {
                imgElement.src = e.target.result;
            } else {
                box.innerHTML = `<img src="${e.target.result}" alt="식단 이미지" class="image-preview"/>`;
            }

            let saveButton = document.getElementById(saveButtonId);
            if (!saveButton) {
                saveButton = document.createElement('button');
                saveButton.id = saveButtonId;
                saveButton.className = `btn-save-meals ${saveButtonId}`;
                saveButton.innerText = '저장';
                saveButton.type = 'submit';
                const form = box.closest('form');
                if (form) {

                    form.appendChild(saveButton);
                } else {
                    console.error('Form not found');
                }
            } else {
                saveButton.style.display = 'block';     
        } 
    }
    reader.readAsDataURL(event.target.files[0]);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지
        const hiddenDate = form.querySelector('input[name="date"]');
        if (hiddenDate) {
            hiddenDate.value = formatDate(selectedDate); // 선택된 날짜를 hidden input에 설정
        } else {
            console.error('Hidden date input not found');
        }

        const formData = new FormData(form);
        try {
            const response = await fetch('/save-meals', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data.message);

            if (data.message === "식단이 성공적으로 저장되었습니다.") {
                alert(data.message);
                // 성공적으로 저장된 후 추가적인 동작 수행 (예: 화면 갱신)
                // 저장 버튼 숨기기
                const saveButton = form.querySelector('.btn-save-meals');
                if (saveButton) {
                    saveButton.style.display = 'none';
                }

                fetchMealData(selectedDate); // 선택된 날짜의 식단 데이터를 다시 불러옴
            }
        } catch (error) {
            console.error('Error saving meal:', error);
        }
    });
});

// 선택된 날짜에 대한 식단 데이터 불러오기
const loadMealsForDate = async (year, month, day) => {
    try {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const response = await fetch(`/meals?date=${formattedDate}`);
        const meals = await response.json();
        displayMeals(meals);
    } catch (error) {
        console.error('Error loading meals:', error);
    }
};

// 식단 데이터 표시
const displayMeals = (meals) => {
    meals.forEach(meal => {
        const dateElement = document.querySelector(`.days li[data-date="${meal.date}"]`);
        if (dateElement) {
            const mealBox = document.createElement('div');
            mealBox.innerHTML = `<img src="${meal.imagePath}" alt="${meal.mealType} 이미지" class="image-preview">`;
            if (meal.mealType === '아침') {
                document.getElementById('morning-meal').appendChild(mealBox);
            } else if (meal.mealType === '점심') {
                document.getElementById('lunch-meal').appendChild(mealBox);
            } else if (meal.mealType === '저녁') {
                document.getElementById('dinner-meal').appendChild(mealBox);
            }
        }
    });
};

// 특정 날짜의 식단 데이터를 서버에서 가져오는 함수
const fetchMealData = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    fetch(`/meals?date=${formattedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => updateMealsPopupContent(data))
        .catch(error => console.error('Error fetching meal data:', error));
};

// 팝업의 식단 내용 업데이트
const updateMealsPopupContent = (data) => {
    const mealContainers = {
        아침: document.getElementById('uploadBox1'),
        점심: document.getElementById('uploadBox2'),
        저녁: document.getElementById('uploadBox3')
    };

    // 각 식단 컨테이너를 초기화
    for (let key in mealContainers) {
        if (mealContainers[key]) {
            mealContainers[key].innerHTML = `<p>+ <br> ${key} 식단</p>`;
        }
    }

    // 서버에서 받은 식단 데이터를 각 컨테이너에 표시
    data.forEach(meal => {
        if (mealContainers[meal.mealType]) {
            mealContainers[meal.mealType].innerHTML =
                `<img src="${meal.imagePath}" alt="${meal.mealType} 식단" class="image-preview">`;
        }
    });
};

// 페이지가 로드될 때 초기화
document.addEventListener("DOMContentLoaded", async function() {
    await fetchExerciseLogs();
    const today = new Date();
    selectedDate = today;
    fetchDataForDateAndExercise(today);  // 오늘 날짜의 데이터를 가져오는 함수 호출
    fetchWeight();
});

// 초기 로드 시 및 날짜가 변경될 때 식단 데이터 불러오기
const fetchDataForDateAndExercise = (date) => {
    fetchMealData(date);
    fetchExerciseData(date);
    fetchNunbodyData(date);
};

fetch('/meals?date=${formattedDate}')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json(); // JSON 응답 처리
    } else {
      throw new Error('Response was not JSON');
    }
  })
  .then(data => {
    console.log(data);
    // 데이터를 활용한 로직 추가
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });


// 체중 데이터 불러오기
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
};

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
        loadMealsForMonth(currYear, currMonth);  // 선택된 월의 식단 데이터를 불러옴
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
    loadMealsForMonth(currYear, currMonth);  // 선택된 월의 식단 데이터를 불러옴
});

monthPicker.value = `${currYear}-${String(currMonth + 1).padStart(2, '0')}`;





///////////// 그래프 ///////////////

document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('weightChart').getContext('2d');
    let data = {
      labels: [],
      datasets: [{
        label: 'Weight',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)', // 그래프 선 색상
        borderWidth: 1,
        fill: false
      }]
    };
    const config = {
      type: 'line',
      data: data,
      options: {
        scales: {
          x: {
            type: 'date', // x축을 시간으로 설정
            date: {
              unit: 'day', // 시간 단위를 일 단위로 설정
              tooltipFormat: 'YYYY-MM-DD' // 툴팁에 표시될 날짜 형식
            },
            title: {
                display: true,
                text: '날짜' // x축 레이블
              }
          },
          y: {
            beginAtZero: true, // y축을 0부터 시작
            title: {
                display: true,
                text: '체중 (kg)' // y축 레이블
              }
          }
        },
        tooltip: {
            enabled: true, // 툴팁 사용
            mode: 'index', // 인덱스 모드로 툴팁 표시
            intersect: false,
            callbacks: {
              label: function(tooltipItem) {
                return `Weight: ${tooltipItem.formattedValue} kg`; // 툴팁 레이블 포맷
              }
            }
        },
        elements: {
          line: {
            tension: 0.4 // 선의 곡률
          },
          point: {
            radius: 3.5, // 데이터 포인트 크기
            backgroundColor: 'rgba(75, 192, 192, 1)', // 데이터 포인트 색상
            hoverRadius: 7, // 호버 시 데이터 포인트 크기
            hoverBackgroundColor: 'rgba(75, 192, 192, 1)' // 호버 시 데이터 포인트 색상
          }
        }
      }
    };
    const weightChart = new Chart(ctx, config); // Chart.js를 사용하여 그래프 생성

    // 서버에서 날짜별 체중 데이터를 가져와 그래프에 추가하는 함수
    async function fetchAndDisplayWeights() {
        const selectedType = dataSelector.value;
        const url = selectedType === 'weight' ? '/weights' : '/muscle-weights';
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const dataResponse = await response.json();
          data.labels = dataResponse.map(entry => entry.date);
          data.datasets[0].data = dataResponse.map(entry => entry[selectedType]);
          data.datasets[0].label = selectedType === 'weight' ? '체중' : '골격근량';
          weightChart.update();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

    // 페이지 로드 시 날짜별 체중 데이터 가져오기
    fetchAndDisplayWeights();

    // 체중을 저장하는 이벤트 리스너
    const addWeightButton = document.querySelector(".btn-save-inbody");

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

    // 체중 데이터 불러오기
    async function loadWeights() {
        try {
            const response = await fetch('/weights');
            const weights = await response.json();
            const weightListDiv = document.getElementById('weightList');
            weightListDiv.innerHTML = '';  // 기존 내용 삭제

            weights.forEach(weight => {
                const weightDiv = document.createElement('div');
                weightDiv.innerHTML = `
                    <p>날짜: ${weight.date}, 체중: ${weight.weight} kg</p>
                    <img src="/weight_images/${weight.photo}" alt="체중 사진" width="200">
                    <button onclick="deleteWeight('${weight.date}', ${weight.weight})">삭제</button>
                `;
                weightListDiv.appendChild(weightDiv);
            });
        } catch (error) {
            console.error('체중 데이터 로드 실패', error);
        }
    }

    // 체중 데이터 삭제 함수
    async function deleteWeight(date, weight) {
        try {
            const response = await fetch('/delete-weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, weight })
            });

            if (response.ok) {
                alert('체중 기록이 삭제되었습니다.');
                loadWeights();  // 목록 갱신
            } else {
                alert('체중 기록 삭제 실패');
            }
        } catch (error) {
            console.error('체중 기록 삭제 실패', error);
        }
    }

});

/////////// 눈바디 /////////////

function previewInbodyImage(event, uploadBoxId, saveButtonId) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const box = document.getElementById(uploadBoxId);
        let imgElement = box.querySelector('img');
        if (imgElement) {
            imgElement.src = e.target.result;
        } else {
            imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.alt = "눈바디 이미지";
            imgElement.className = "image-nunbody";
            box.innerHTML = ''; // 기존 내용을 지우고
            box.appendChild(imgElement); // 새로운 이미지를 추가
        }

        let saveButton = document.getElementById(saveButtonId);
        if (!saveButton) {
            saveButton = document.createElement('button');
            saveButton.id = saveButtonId;
            saveButton.className = `saveNunbody ${saveButtonId}`;
            saveButton.innerText = '저장';
            saveButton.type = 'submit';
            const form = box.closest('form');
            if (form) {
                form.appendChild(saveButton);
            } else {
                console.error('Form not found');
            }
        } else {
            saveButton.style.display = 'block';
        }
    };
    reader.readAsDataURL(event.target.files[0]);
}

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지
        const hiddenDate = form.querySelector('input[name="date"]');
        if (hiddenDate) {
            hiddenDate.value = formatDate(selectedDate); // 선택된 날짜를 hidden input에 설정
        } else {
            console.error('Hidden date input not found');
        }

        const formData = new FormData(form);
        try {
            const response = await fetch('/save-nunbody', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data.message);

            if (data.message === "눈바디 사진이 성공적으로 저장되었습니다.") {
                alert(data.message);
                // 성공적으로 저장된 후 추가적인 동작 수행 (예: 화면 갱신)
                const saveNunbody = form.querySelector('.saveNunbody');
                if (saveNunbody) {
                    saveNunbody.style.display = 'none';
                }
                fetchDataForDateAndExercise(selectedDate); // 선택된 날짜에 머물기

                // fetchNunbodyData(selectedDate); // 선택된 날짜의 눈바디 데이터를 다시 불러옴
            }
        } catch (error) {
            console.error('Error saving nunbody:', error);
        }
    });
});


// 선택된 날짜에 대한 눈바디 데이터 불러오기
const loadNunbodyForDate = async (year, month, day) => {
  try {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const response = await fetch(`/nunbody?date=${formattedDate}`);
    const nunbody = await response.json();
    displayNunbody(nunbody);
  } catch (error) {
    console.error('Error loading nunbody:', error);
  }
};

// 눈바디 데이터 표시 함수
const displayNunbody = (nunbodyPhotos) => {
    const nunbodyContainer = document.querySelector('.nunbody');
    nunbodyContainer.innerHTML = ''; // 기존 내용을 초기화
  
    nunbodyPhotos.forEach(nunbodyPhoto => {
      const imgElement = document.createElement('img');
      imgElement.src = nunbodyPhoto.imagePath;
      imgElement.alt = "눈바디 이미지";
      imgElement.className = "img-nunbody";
      nunbodyContainer.appendChild(imgElement);
    });
  };
  
// 특정 날짜의 눈바디 데이터를 서버에서 가져오는 함수
const fetchNunbodyData = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    console.log('Fetching nunbody data from:', `/nunbody?date=${formattedDate}`); // 로그 추가
  
    fetch(`/nunbody?date=${formattedDate}`)
      .then(response => {
        console.log('Response status:', response.status); // 응답 상태 로그 추가
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // console.log('Fetched nunbody data:', data); // 응답 데이터 로그 추가
        displayNunbody(data);
      })
      .catch(error => {
        console.error('Error fetching nunbody data:', error);
      });
      
  };
  

const updateNunbodyPopupContent = (data) => {

    // 서버에서 받은 눈바디 데이터를 각 컨테이너에 표시
    data.forEach(nunbody => {
        if (nunbodyContainers) {
            nunbody.innerHTML = `<img src="${nunbody.imagePath}" alt="눈바디 이미지" class="image-nunbody">`;
        }
    });
};
