document.getElementById('arrow').addEventListener('click', function(event) {
    event.preventDefault(); // 기본 동작 방지

    const targetElement = document.getElementById('main-2'); // 스크롤할 대상 요소 가져오기
    const targetPosition = targetElement.getBoundingClientRect().top; // 대상 요소의 상단 위치 계산
    const startPosition = window.pageYOffset; // 현재 스크롤 위치
    const distance = targetPosition - startPosition; // 대상 요소까지의 거리 계산
    const duration = 1000; // 스크롤 지속 시간 (1초)

    let start = null;

    // 애니메이션 함수
    function scrollToTarget(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        window.scrollTo(0, easeInOutQuad(progress, startPosition, distance, duration));

        if (progress < duration) {
            window.requestAnimationFrame(scrollToTarget);
        }
    }

    // 이징 함수 (가속도 조절)
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    window.requestAnimationFrame(scrollToTarget);
});


// 슬로건 텍스트 애니메이션
(function (){
const spanEl = document.querySelector(".slogan");
const txtArr = ['운동을 계획하고 캘린더에 기록하는 사람'];
let index = 0;
let currentTxt = txtArr[index].split("");
function writeTxt(){
spanEl.textContent += currentTxt.shift();
if(currentTxt.length !== 0){
// setTimeout(writeTxt, Math.floor(Math.random()*100));
setTimeout(writeTxt, Math.floor(150));

}else{
currentTxt = spanEl.textContent.split("");
setTimeout(deleteTxt,10000);
}
}
function deleteTxt(){
currentTxt.pop();
spanEl.textContent = currentTxt.join("");
if(currentTxt.length != 0){
setTimeout(deleteTxt, Math.floor(100));
}else{
index = (index + 1) % txtArr.length;
currentTxt = txtArr[index].split("");
writeTxt();
}
}
writeTxt();
})();

