document.getElementById('search-button').addEventListener('click', function() {
    const searchQuery = document.getElementById('search-box').value.toLowerCase();
    const exercises = document.querySelectorAll('.exercises-container .exercise');

    exercises.forEach(function(exercise) {
        const exerciseText = exercise.querySelector('.text').innerText.toLowerCase();
        if (exerciseText.includes(searchQuery)) {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
});

document.getElementById('search-box').addEventListener('input', function() {
    const searchQuery = document.getElementById('search-box').value.toLowerCase();
    const exercises = document.querySelectorAll('.exercises-container .exercise');

    exercises.forEach(function(exercise) {
        const exerciseText = exercise.querySelector('.text').innerText.toLowerCase();
        if (exerciseText.includes(searchQuery)) {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
});
