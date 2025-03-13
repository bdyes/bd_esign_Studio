const form = document.getElementById('quote-form');
const resultDiv = document.getElementById('result');
const videoFormatQuestion = document.getElementById('video-format-question');
const runningTimeQuestion = document.getElementById('running-time-question');
const shootingSpaceQuestion = document.getElementById('shooting-space-question');
const equipmentQuestion = document.getElementById('equipment-question');
const equipmentQuestionLocation = document.getElementById('equipment-question-location');
const textEffectQuestion = document.getElementById('text-effect-question');
const videoFormatButtons = videoFormatQuestion.querySelectorAll('button');
const spaceButtons = shootingSpaceQuestion.querySelectorAll('button');
const equipmentButtons = equipmentQuestion.querySelectorAll('button');
const textEffectButtons = textEffectQuestion.querySelectorAll('button[data-effect]');
const runningTimeSelect = document.getElementById('running-time');
const runningTimeButton = document.getElementById('running-time-button');
const startButton = document.getElementById('start-button');
const fixedButtons = document.getElementById('fixed-buttons');
const topButton = document.getElementById('top-button');
const bottomButton = document.getElementById('bottom-button');
const refreshButton = document.getElementById('refresh-button');
const contactButton = document.getElementById('contact-button');
const whiteOverlay = document.getElementById('white-overlay'); // 상단에 whiteOverlay 요소 가져오기
const textEffectNextButton = document.getElementById('text-effect-next-button'); // 텍스트 효과 다음 버튼
const distanceResultButton = document.getElementById('distance-result-button'); // 새 버튼
const distanceResultText = document.getElementById('distance-result-text'); // 새 버튼 안의 텍스트
const finalMessage = document.getElementById('final-message');

let selectedEquipment = null;
let selectedTextEffects = [];
let isContactButtonClicked = false; // 플래그 변수 추가
let isModalOpen = false; // 모달 열림 상태 플래그
let isDistanceEntered = false; // 이동거리 입력 여부를 저장하는 변수
let nextQuestionShown = false;

// priceBar 관련 변수
const priceBar = document.getElementById('price-bar');
const receiptContainer = document.getElementById('receipt-container');
const receiptTotalPrice = document.getElementById('receipt-total-price');
const receiptContent = document.getElementById('receipt-content'); // receiptContent 변수 선언

// "다음" 버튼 변수 추가
const spaceNextButton = document.getElementById('space-next-button');

// **추가**: 이동 거리 관련 변수
const distanceQuestion = document.getElementById('distance-question');
const distanceInput = document.getElementById('distance-input');
const distanceButton = document.getElementById('distance-button');

// priceBar의 초기 높이 (px 단위) - CSS의 #price-bar height와 일치
const priceBarHeight = 20;

// 추가: 경고 메시지 요소
const alertMessage = document.createElement('div');
alertMessage.id = 'alert-message';
document.body.appendChild(alertMessage); // body에 추가

// distanceInput에 keydown 이벤트 리스너 추가
distanceInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // 기본 폼 제출 동작 방지
    distanceButton.click(); // distanceButton 클릭 이벤트 발생
  }
});

// 화면 크기 정보를 업데이트하는 함수
function updateScreenWidth() {
  const screenWidth = window.innerWidth;
  document.getElementById('screen-width-value').textContent = screenWidth;
}

// 초기 화면 크기 정보 표시
updateScreenWidth();

// 화면 크기 변경 이벤트 리스너
window.addEventListener('resize', updateScreenWidth);

function updateTextEffectNextButtonState() {
    const selectedTextEffects = document.querySelectorAll('.text-effect-button.selected');

    if (selectedTextEffects.length > 0) {
        textEffectNextButton.style.display = "block"; // 버튼 보이게 하기
        textEffectNextButton.disabled = false;
        textEffectNextButton.style.opacity = "1";
        textEffectNextButton.classList.remove('selected'); // selected 클래스 강제 제거
    } else {
        textEffectNextButton.style.opacity = "0"; // 먼저 투명하게 만들고
        textEffectNextButton.style.display = "none";  // 버튼 완전히 숨기기
        textEffectNextButton.classList.remove('selected'); // selected 클래스 강제 제거
    }
}

// 모든 질문에 답변이 완료되었는지 확인하는 함수
function checkAllQuestionsAnswered() {
    // 1. 영상 방향 선택 확인
    const videoFormatSelected = document.querySelector('#video-format-question button.selected');



    if (!videoFormatSelected) return false;

    // 2. 러닝타임 선택 확인
    const runningTimeSelected = runningTimeSelect.value !== '';
    if (!runningTimeSelected) return false;

    // 3. 촬영 공간 선택 확인
    const spaceSelected = document.querySelectorAll('#shooting-space-question button.selected').length > 0;
    if (!spaceSelected) return false;

    // 4. 무빙 퀄리티 선택 확인
    const selectedSpaces = Array.from(document.querySelectorAll('#shooting-space-question button.selected')).map(b => b.dataset.space);
    const showEquipmentQuestion = selectedSpaces.includes('indoor') || selectedSpaces.includes('outdoor');
    
    if (showEquipmentQuestion) {
        const equipmentSelected = document.querySelector('#equipment-question button.selected');
        if (!equipmentSelected) return false;
    }

    // 5. 텍스트 효과 선택 확인 (수정됨)
    if (textEffectQuestion.style.display !== 'none') {
        const textEffectSelected = document.querySelectorAll('#text-effect-question button.selected').length > 0;
        // textEffectNextButton이 숨겨져 있는지 (display === 'none') 확인 추가
        if (!textEffectSelected || textEffectNextButton.style.display !== 'none') return false;
    }

    // 6. 이동 거리 선택 확인 (수정됨)
    if (distanceQuestion.style.display !== 'none' && !isDistanceEntered) {
        return false;
    }
	
    return true;
}

// "문의하기" 버튼 상태 업데이트 함수
function updateContactButtonState() {
  const allAnswered = checkAllQuestionsAnswered();
  if (allAnswered) {
    contactButton.disabled = false; // 활성화
    contactButton.classList.remove('disabled-button');
    contactButton.textContent = "문의하기"; // 텍스트 변경

    // 클릭 이벤트 핸들러 추가
    contactButton.onclick = function() {
      isContactButtonClicked = true; // 문의하기 버튼 클릭 시 플래그 true
      isModalOpen = true; // 모달이 열릴 때 플래그를 true로 설정

      const overlay = document.getElementById('overlay');
      const receiptModal = document.getElementById('receipt-modal');
      const receiptModalItems = document.getElementById("receipt-modal-items"); // 스크롤 대상

      updateReceiptModal(); // 내용 업데이트

      // body 스크롤 막기
      // document.body.style.overflow = 'hidden';

      // 오버레이 애니메이션 (fadeIn)
      anime({
        targets: overlay,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad',
        begin: () => {
          overlay.style.display = 'block'; // 애니메이션 시작 전에 보이게
        },
        complete: () => {
          overlay.classList.add('active'); // pointer-events 활성화
        }
      });

      // 영수증 모달 애니메이션 (slideUp)
      anime({
        targets: receiptModal,
        translateY: ['100%', '0%'], // 아래에서 위로
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutCubic',
        begin: () => {
          receiptModal.style.display = 'block';// 애니메이션 시작 전에 보이게
        },
        complete: () => {
          receiptModal.classList.add('active');
			const modalHeight = receiptModal.offsetHeight; // padding, border 포함
			const scrollHeight = receiptModal.scrollHeight;
			const clientHeight = receiptModal.clientHeight; // padding 포함, scrollbar 제외
			
			// 스크롤해야 할 거리 = 전체 내용 높이 - 보이는 부분 높이
			let scrollTo = scrollHeight - clientHeight;
			
			// (선택 사항) 특정 픽셀만큼 덜 스크롤하고 싶다면:
			const offset = 0; // 예: 300px만큼 덜 스크롤
			scrollTo = Math.max(0, scrollTo - offset); // 음수가 되지 않도록
			
			anime({
				targets: receiptModal,
				scrollTop: scrollTo,
				delay: 1200,
				duration: 800,
				easing: 'easeInOutCubic'
			});

          isContactButtonClicked = false;
          // setTimeout 제거
        }
      });
    };

  } else {
    contactButton.disabled = true; // 비활성화
    contactButton.classList.add('disabled-button');
    contactButton.textContent = "선택을 모두 완료해주세요"; // 텍스트 변경




    // 클릭 이벤트 제거 (비활성화 상태)
    contactButton.onclick = null;
  }
}

// 페이지 로드 및 새로고침 시 애니메이션 실행
function runIntroAnimation() {
    anime.timeline({
        easing: 'easeOutExpo'
    })
    .add({
        targets: 'html, body',
        scrollTop: [document.body.scrollHeight, 0],

        duration: 500,
        easing: 'easeInOutSine'
    }, 0)
    .add({
        targets: '#title',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: 600
    }, 0)
    .add({
        targets: '#start-button',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: 750
    }, 0);
}

// 페이지 로드 시 애니메이션 실행 + 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => { // DOMContentLoaded 사용!
    const loadingOverlay = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('loading-progress-bar');
    const loadingMessage = document.getElementById('loading-message');

    // 1. 스피너 컨테이너 요소 생성
    const spinnerContainer = document.createElement('span');
    spinnerContainer.classList.add('spinner-container');

    // 2. 스피너 SVG 코드를 spinnerContainer에 추가
    spinnerContainer.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
    `;

    // 3. loadingMessage의 '...' 텍스트 뒤에 spinnerContainer 추가
    loadingMessage.append(spinnerContainer);

    // 📌 기기별 GIF 로드 (768px 기준)
    const isMobile = window.innerWidth <= 768;
    const gifMapping = {
        horizontal: isMobile ? "https://i.imgur.com/vqhQZem.gif" : "https://i.imgur.com/9Tn72uu.gif",
        vertical: isMobile ? "https://i.imgur.com/alxzl2c.gif" : "https://i.imgur.com/MGeoNWd.gif",
        indoor: isMobile ? "https://i.imgur.com/N8fw5Hs.gif" : "https://i.imgur.com/TRX39P1.gif",
        outdoor: isMobile ? "https://i.imgur.com/zCckkDW.gif" : "https://i.imgur.com/2r5GlPr.gif",
        drone: isMobile ? "https://i.imgur.com/LZhfLnB.gif" : "https://i.imgur.com/b858w9R.gif",
        standard: isMobile ? "https://i.imgur.com/pTvoppe.gif" : "https://i.imgur.com/3kjLw6s.gif",
        deluxe: isMobile ? "https://i.imgur.com/wSx0aY2.gif" : "https://i.imgur.com/nrdMWRR.gif",
        prime: isMobile ? "https://i.imgur.com/tbSPuDc.gif" : "https://i.imgur.com/dTM3bb9.gif",
        none: isMobile ? "https://i.imgur.com/Ih2aMKU.gif" : "https://i.imgur.com/NxR4zQF.gif",
        normal: isMobile ? "https://i.imgur.com/apY5bGp.gif" : "https://i.imgur.com/9LpNmrY.gif",
        spatial: isMobile ? "https://i.imgur.com/odkIvjK.gif" : "https://i.imgur.com/I7Myh0x.gif"
    };

    // 📌 GIF 프리로드 최적화 (PC vs 모바일 구분)
    const gifUrls = Object.values(gifMapping);
    let loadedImages = 0;
    let fakeProgress = 0;
    let fakeProgressInterval;
    let dotsInterval;

    // 점 애니메이션 시작
    let dots = "";
    dotsInterval = setInterval(() => {
        dots += ".";
        if (dots.length > 3) {
            dots = "";
        }
        loadingMessage.firstChild.textContent = `로직 데이터를 로드 중입니다${dots}`;
    }, 500);

    // 가짜 로딩 진행바
    fakeProgressInterval = setInterval(() => {
        fakeProgress += 5;
        if (fakeProgress > 50) {
            fakeProgress = 50;
        }
        progressBar.style.width = `${fakeProgress}%`;
    }, 1000);

    function loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                loadedImages++;
                if (loadedImages === gifUrls.length) {
                    clearInterval(fakeProgressInterval);
                    clearInterval(dotsInterval);
                }
                const progress = (loadedImages / gifUrls.length) * 100;
                progressBar.style.width = `${progress}%`;
                resolve();
            };
            img.onerror = () => {
                loadedImages++;
                if (loadedImages === gifUrls.length) {
                    clearInterval(fakeProgressInterval);
                    clearInterval(dotsInterval);
                }
                const progress = (loadedImages / gifUrls.length) * 100;
                progressBar.style.width = `${progress}%`;
                resolve();
            };
            img.src = url;
        });
    }

    Promise.all(gifUrls.map(url => loadImage(url)))
    .then(() => {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            runIntroAnimation();
        }, 500);
    })
    .catch(error => {
        console.error(error);
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            runIntroAnimation();
        }, 500);
    });

    // 📌 GIF 변경 적용
    const gifElements = document.querySelectorAll(".button-gif");
    gifElements.forEach((img) => {
        const type = img.previousElementSibling.dataset.value || 
                     img.previousElementSibling.dataset.space || 
                     img.previousElementSibling.dataset.equipment || 
                     img.previousElementSibling.dataset.effect;
        img.src = gifMapping[type];
    });

    // 기존 기능 유지
    priceBar.style.pointerEvents = 'none';
    priceBar.classList.remove('clickable');

    startButton.addEventListener('click', () => {
        priceBar.style.pointerEvents = 'auto';
        priceBar.classList.add('clickable');
    });

    startButton.addEventListener('click', handleStartButtonClick);
    videoFormatButtons.forEach(button => button.addEventListener('click', handleVideoFormatButtonClick));
    runningTimeSelect.addEventListener('change', handleRunningTimeChange);
    runningTimeButton.addEventListener('click', handleRunningTimeButtonClick);
    spaceButtons.forEach(button => button.addEventListener('click', handleSpaceButtonClick));
    equipmentButtons.forEach(button => button.addEventListener('click', handleEquipmentButtonClick));
    textEffectButtons.forEach(button => button.addEventListener('click', handleTextEffectButtonClick));
    textEffectNextButton.addEventListener('click', handleTextEffectNextButtonClick);

    // 페이지 로드 시 설정 복원
    if (sessionStorage.getItem('scrollToTopAfterRefresh') === 'true') {
        sessionStorage.removeItem('scrollToTopAfterRefresh');
        scrollToTop(false);
    }

    // 페이지 로드 시 애니메이션
    anime({
        targets: '#price-bar',
        translateY: ['100%', 0],
        opacity: [0, 1],
        easing: 'easeInOutExpo',
        duration: 2000,
        delay: 100,
    });

    updateContactButtonState();
});

// #price-bar 클릭 이벤트 리스너
priceBar.addEventListener('click', () => {
  if (!priceBar.classList.contains('open')) { // priceBar가 열릴 때만 updateReceipt() 호출
    // 열기: #price-bar의 높이를 늘림
     // 애니메이션 전에 auto로 설정
    updateReceipt(); // 영수증 내용 업데이트  <-- 애니메이션 전에 호출!

    const newHeight = receiptContent.offsetHeight;
    anime({
      targets: priceBar,
      height: newHeight + priceBarHeight,
      duration: 600,
      easing: 'cubicBezier(0.85,0,0.15,1)',
      complete: () => {
        // 애니메이션 완료 후 height를 auto로
        priceBar.classList.add('open');
      },
    });
  } else {
    // 닫기 전에 isContactButtonClicked 확인
    if (!isContactButtonClicked && !isModalOpen) { // 이 조건문 수정
      anime({
        targets: priceBar,
        height: priceBarHeight,
        duration: 600,
        easing: 'cubicBezier(0.85,0,0.15,1)',
        complete: () => {
          priceBar.classList.remove('open');
          receiptContainer.style.height = '0'; // 닫힐 때 높이 0
        }
      });
    }
  }
});

// ******** 추가된 부분 시작 ********  <-- 이 주석 및 아래 코드를 여기에 삽입
// 문서 전체 클릭 이벤트 리스너 (이벤트 위임)
document.addEventListener('click', (event) => {
  // 1. 클릭된 요소가 priceBar 내부인지 확인
  const isInsidePriceBar = priceBar.contains(event.target);

  // 2. priceBar가 열려있는지 확인
  const isPriceBarOpen = priceBar.classList.contains('open');

  // 3. 클릭된 요소가 버튼인지 확인
  const isButton = event.target.tagName === 'BUTTON' || event.target.closest('button'); // 버튼 또는 버튼 자식 요소 클릭

  // 4. priceBar 바깥을 클릭했고, priceBar가 열려있는 상태이고, 버튼이 아니라면 닫기
  if (!isInsidePriceBar && isPriceBarOpen && !isButton) {
    // 닫기 전에 isContactButtonClicked와 isModalOpen 확인
    if (!isContactButtonClicked && !isModalOpen) { // 이 조건문 수정
      anime({
        targets: priceBar,
        height: priceBarHeight,
        duration: 600,
        easing: 'cubicBezier(0.85,0,0.15,1)',
        complete: () => {
          priceBar.classList.remove('open');
          receiptContainer.style.height = '0'; // 닫힐 때 높이 0
        }
      });
    }
  }
});

// 📌 부드럽고 정확한 스크롤 함수 (맨 아래로 이동 시 최적화)
function smoothScrollTo(targetPosition) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200; // 속도 조절 (500~600ms 추천)
    let startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animationStep(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // 0~1 범위 유지

        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));

        if (elapsedTime < duration) {
            requestAnimationFrame(animationStep);
        }
    }

    requestAnimationFrame(animationStep);
}

// 📌 고정 버튼 이벤트 리스너 수정 (맨 아래 이동 최적화)
topButton.addEventListener('click', () => {
    smoothScrollTo(0); // 맨 위로 스크롤
});

bottomButton.addEventListener('click', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    smoothScrollTo(maxScroll); // 스크롤 가능한 최대로 이동
});

// 🔄 새로고침 버튼 (애니메이션 포함)
refreshButton.addEventListener('click', () => {
    const whiteOverlay = document.getElementById('white-overlay');

    // 1️⃣ 흰색 오버레이 페이드인
    whiteOverlay.style.display = 'block';
    anime({
        targets: whiteOverlay,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutExpo',
        complete: () => {
            // 2️⃣ 초기화 함수 실행 (페이지 새로고침 없이 데이터 리셋)
            resetToStartScreen();

            // 3️⃣ 페이드아웃 (초기화된 화면이 자연스럽게 나타남)
            anime({
                targets: whiteOverlay,
                opacity: [1, 0],
                duration: 500,
                easing: 'easeInExpo',
                complete: () => {
                    whiteOverlay.style.display = 'none'; // 완전히 숨김
                }
            });
        }
    });
});

// 🔄 '시작하기' 화면으로 초기화하는 함수
function resetToStartScreen() {
  // 1️⃣ 모든 입력값과 선택 상태 초기화
  localStorage.clear(); // 저장된 데이터 삭제
  document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('input, select').forEach(el => el.value = '');
  isDistanceEntered = false; // 거리 입력 상태도 초기화

  // 2️⃣ 모든 질문 숨김
  form.style.display = 'none';
  runningTimeQuestion.style.display = 'none';
  shootingSpaceQuestion.style.display = 'none';
  equipmentQuestion.style.display = 'none';
  textEffectQuestion.style.display = 'none';
  distanceQuestion.style.display = 'none';
  finalMessage.style.display = 'none';

  // ✅ form의 show 클래스 제거 (애니메이션이 다시 적용되도록)
  form.classList.remove('show');

  // 3️⃣ '시작하기' 버튼과 제목 다시 표시
  startButton.style.display = 'block';
  title.style.opacity = 0; // 애니메이션을 위해 숨김
  startButton.style.opacity = 0;

  // 4️⃣ 누적 견적 바 다시 흐리게 만들고 비활성화
  priceBar.style.pointerEvents = 'none';
  priceBar.classList.remove('clickable');
  document.getElementById('total-price').textContent = '0원';
  document.getElementById('receipt-total-price').textContent = '0원';

    // 5️⃣ 처음 로드될 때처럼 애니메이션 실행
    anime.timeline({ easing: 'easeOutExpo' })
        .add({
            targets: '#title',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 500
        })
        .add({
            targets: '#start-button',
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 0
        }, '-=800');

  // 6️⃣ 무빙 퀄리티(equipment) 초기화
    equipmentButtons.forEach(button => {
      button.classList.remove('selected');
    });
    selectedEquipment = null;

    // 7️⃣ 이동 거리(distance) 초기화
    distanceInput.value = '';
    distanceResultButton.style.display = 'none';
    distanceInput.style.display = '';
    document.querySelector('#distance-question .unit').style.display = '';
    distanceButton.style.display = '';
    isDistanceEntered = false;

  scrollToTop();
}

// 🔹 '시작하기' 버튼 클릭 시 실행되는 함수 (애니메이션 복구 추가)
function handleStartButtonClick() {
    startButton.style.display = 'none';
    form.style.display = 'block';
    requestAnimationFrame(() => form.classList.add('show'));

    localStorage.removeItem('selectedVideoFormat');
    videoFormatButtons.forEach(b => b.classList.remove('selected'));
    runningTimeSelect.selectedIndex = 0;
    runningTimeButton.style.display = 'none';
    runningTimeSelect.style.display = '';
    resultDiv.textContent = '';

    // 질문 div들을 모두 숨깁니다. (초기화)
    runningTimeQuestion.style.display = 'none';
    runningTimeQuestion.classList.remove('question-container', 'show');
    shootingSpaceQuestion.style.display = 'none';
    shootingSpaceQuestion.classList.remove('question-container', 'show');
    equipmentQuestion.style.display = 'none';
    equipmentQuestion.classList.remove('question-container', 'show');
    textEffectQuestion.style.display = 'none';
    textEffectQuestion.classList.remove('question-container', 'show');

    // 스크롤 애니메이션 추가 (수정된 부분)
    const scrollOffset = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize); // 5rem을 px로 변환

    anime({
        targets: 'html, body',
        scrollTop: `+=${scrollOffset}`, // 현재 위치에서 scrollOffset만큼 아래로
        duration: 800,
        easing: 'easeInOutCubic'
    });

    updateTotalPrice();
    updateContactButtonState(); // 추가
}

function handleVideoFormatButtonClick(event) {
    videoFormatButtons.forEach(b => b.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    localStorage.setItem('selectedVideoFormat', event.currentTarget.dataset.value);

    runningTimeQuestion.style.display = 'block';
    anime({
        targets: runningTimeQuestion,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
    });

    updateTotalPrice();
    scrollToBottom();
    updateContactButtonState(); // 추가
}

function handleRunningTimeChange() {
    const selectedOption = runningTimeSelect.options[runningTimeSelect.selectedIndex];
    const runningTimeText = selectedOption.text.split(' ')[0]; // "60s"
    const runningTimePrice = selectedOption.value; // "16"

    // 수정된 부분: 숫자 값만 price-circle 안에 넣음
    runningTimeButton.innerHTML = `${runningTimeText} <span class="price-circle">${runningTimePrice}</span>`; 
    runningTimeButton.style.display = 'block';

    runningTimeSelect.size = 1;
    runningTimeSelect.style.display = 'none';

    localStorage.setItem('selectedRunningTime', runningTimeSelect.value);

	/* resetQuestion('shooting-space-question'); */
    shootingSpaceQuestion.style.display = 'block';
    anime({
        targets: shootingSpaceQuestion,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
    });

    updateTotalPrice();
    scrollToBottom();
    updateContactButtonState(); // 추가
}

function handleRunningTimeButtonClick() {
    runningTimeButton.style.display = 'none';
    runningTimeSelect.style.display = 'block';

    const storedRunningTime = localStorage.getItem('selectedRunningTime');
    if (storedRunningTime) {
        runningTimeSelect.value = storedRunningTime;
    }

    // updateTotalPrice();  // <-- 임시로 주석 처리 또는 제거
    runningTimeSelect.size = runningTimeSelect.options.length;



    updateContactButtonState(); // 추가
}

// 전역 변수로 추가: 이전에 다음 질문이 표시되었었는지 여부
/* let nextQuestionShown = false; */

// handleSpaceButtonClick 함수 (수정)
function handleSpaceButtonClick(event) {
  const button = event.currentTarget;


  // 클릭된 버튼이 spaceNextButton인지 확인
  if (button.id !== 'space-next-button') {
    button.classList.toggle('selected'); // spaceNextButton이 아닐 때만 toggle
  }

  // 선택된 공간 버튼 개수 확인
  const selectedSpacesCount = document.querySelectorAll(
    '#shooting-space-question button.selected'
  ).length;

  // 버튼이 하나라도 선택되면 "다음" 버튼 표시, 아니면 숨김
  if (selectedSpacesCount > 0) {
    spaceNextButton.style.display = 'flex'; // 표시
    anime({
      targets: spaceNextButton,
      opacity: [0, 1],
      duration: 600,
      easing: 'easeInOutExpo'
    });
  } else {
    anime({
      targets: spaceNextButton,
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInOutExpo',
      complete: () => {
        spaceNextButton.style.display = 'none'; // 숨김
      },
    });
  }

  // 이후 질문들 숨기기 및 초기화 (수정된 부분)
  if (button.id !== 'space-next-button') { //일반 버튼을 눌렀을 때에만, 즉, '다음'버튼이 아닌경우
        if (equipmentQuestion.style.display !== 'none') {
            hideQuestionWithAnimation(equipmentQuestion);
        }
        if (textEffectQuestion.style.display !== 'none') {
            hideQuestionWithAnimation(textEffectQuestion);
        }
        // 이부분 수정
        if (distanceQuestion.style.display !== 'none') {
          hideQuestionWithAnimation(distanceQuestion);
        }
      resetQuestion('equipment-question');
      resetQuestion('text-effect-question');
      resetQuestion('distance-question');
  }
  nextQuestionShown = false;

  updateContactButtonState();
  updateTotalPrice();
}

// spaceNextButton 클릭 이벤트 리스너 (로직 수정, 애니메이션 유지)
spaceNextButton.addEventListener('click', function(event) {
  setTimeout(function() {
    const selectedSpaces = Array.from(document.querySelectorAll('#shooting-space-question button.selected')).map(b => b.dataset.space);

    const showEquipmentQuestion = selectedSpaces.includes('indoor') || selectedSpaces.includes('outdoor');
    const showTextEffectQuestion = selectedSpaces.length === 1 && selectedSpaces[0] === 'drone';

    // 텍스트 효과 초기화 로직 추가
    selectedTextEffects = []; // selectedTextEffects 배열 초기화
    textEffectButtons.forEach(button => {
      button.classList.remove('selected'); // 모든 텍스트 효과 버튼에서 'selected' 클래스 제거
    });
    updateTextEffectNextButtonState(); // 텍스트 효과 다음 버튼 상태 업데이트 (숨김)


    if (showEquipmentQuestion) {
      equipmentQuestion.style.display = 'block';
      showQuestionWithAnimation(equipmentQuestion);
      if (selectedSpaces.includes('indoor') && selectedSpaces.includes('outdoor')) {
        equipmentQuestionLocation.textContent = '실내/실외';
      } else if (selectedSpaces.includes('indoor')) {
        equipmentQuestionLocation.textContent = '실내';
      } else {
        equipmentQuestionLocation.textContent = '실외';
      }
      // selectedEquipment 값에 따라 버튼 상태 복원
      if (selectedEquipment) {
        equipmentButtons.forEach(button => {
          if (button.dataset.equipment === selectedEquipment) {
            button.classList.add('selected');
          }
        });
      }

      nextQuestionShown = true; // 다음 질문 표시 상태로 변경
    } else if (showTextEffectQuestion) {
      textEffectQuestion.style.display = 'block';

      // selectedTextEffects 배열에 따라 버튼 클래스 설정/해제 (selectedTextEffects 복원)  -> 이 부분은 위에서 초기화 했으므로 제거
      // textEffectButtons.forEach(button => {
      //  if (selectedTextEffects.includes(button.dataset.effect)) {
      //   button.classList.add('selected');
      //  } else {
      //   button.classList.remove('selected');
      //  }
      // });

      showQuestionWithAnimation(textEffectQuestion);

      nextQuestionShown = true; // 다음 질문 표시 상태로 변경

      // 텍스트 효과 "다음" 버튼 표시 여부 (복원) -> 위에서 updateTextEffectNextButtonState() 호출로 대체
      // if (selectedTextEffects.length > 0) {
      //  textEffectNextButton.style.display = 'block';
      // } else {
      //  textEffectNextButton.style.display = 'none';
      // }

    } else { //추가 :  showEquipmentQuestion,showTextEffectQuestion 둘 다 false일 때
      distanceQuestion.style.display = 'block';
      resetQuestion('distance-question'); // distance-question 리셋 (입력값 유지)
      showQuestionWithAnimation(distanceQuestion);
      nextQuestionShown = true; // 다음 질문 표시 상태로 변경
    }

    anime({
      targets: spaceNextButton,
      opacity: [1, 0],
      duration: 1000,
      complete: () => {
        spaceNextButton.style.display = 'none'; // 숨김
        // pointerEvents 관련 코드 제거
      },
    });

    updateTotalPrice();
    scrollToBottom();
  }, 0);
});

textEffectNextButton.addEventListener('click', function(event) {
  setTimeout(function() {
    distanceQuestion.style.display = 'block';
    resetQuestion('distance-question'); // distance-question 리셋 (입력값 유지)
    showQuestionWithAnimation(distanceQuestion);

    anime({
      targets: textEffectNextButton,
      opacity: [1, 0],
      duration: 1000,
      complete: () => {
        textEffectNextButton.style.display = 'none'; // 숨김
        // pointerEvents 관련 코드 제거
      },
    });

    updateTotalPrice();
    scrollToBottom();
    updateContactButtonState();
  }, 0);
});

// 질문을 애니메이션과 함께 숨기는 함수
function hideQuestionWithAnimation(questionElement) {
    anime({
        targets: questionElement,
        translateY: [0, 20],
        opacity: [1, 0],
        duration: 500,
        easing: 'easeOutExpo',
        complete: () => {
            questionElement.style.display = 'none';

            // === 이동 거리 질문이 숨겨질 때 견적 초기화 ===
            if (questionElement.id === 'distance-question') {
                // distanceInput.value = ''; // 이 부분을 삭제하거나 주석처리!
                distanceResultButton.style.display = 'none'; // 결과 버튼 숨김
                isDistanceEntered = false; // 이동 거리 입력 상태 초기화
                updateTotalPrice(); // 견적 업데이트
            }
        }
    });
}

// 질문을 애니메이션과 함께 표시하는 함수
function showQuestionWithAnimation(questionElement) {
    anime({
        targets: questionElement,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        complete: () => {
            questionElement.style.pointerEvents = 'auto'; // 추가: 포인터 이벤트 활성화
        },
    });
}
  
// distanceButton에 대한 클릭 이벤트 리스너 (수정)
distanceButton.addEventListener('click', () => {
  if (distanceInput.value === '' || isNaN(distanceInput.value) || distanceInput.value < 0) {
    alert('올바른 거리를 입력해주세요.');
    distanceInput.focus();
    return;
  }

  const distance = parseInt(distanceInput.value, 10);
  let extraCost = 0;
  let extraCostInTenThousands = 0;

  if (distance > 30) {
    if (distance <= 100) {
      extraCost = (distance - 30) * 1500;
    } else {
      extraCost = (70 * 1500) + ((distance - 100) * 800);
    }

    extraCostInTenThousands = extraCost / 10000; // toFixed()를 적용하지 않음

    // extraCostInTenThousands 값 후처리 로직 (기존 로직)
    if (extraCostInTenThousands === Math.floor(extraCostInTenThousands)) {
      // 정수 부분만 있는 경우 (소수점이 없는 경우)
      extraCostInTenThousands = extraCostInTenThousands.toFixed(0);
    } else {
      // 소수점이 있는 경우
      extraCostInTenThousands = extraCostInTenThousands.toFixed(2); // 일단 소수점 둘째자리까지
      if (extraCostInTenThousands.endsWith(".00")) {
        extraCostInTenThousands = extraCostInTenThousands.slice(0, -3); // .00 제거
      } else if (extraCostInTenThousands.endsWith("0")) {
        extraCostInTenThousands = extraCostInTenThousands.slice(0, -1);  // 마지막 0 제거
      }
    }
  }


  distanceInput.style.display = 'none';
  document.querySelector('#distance-question .unit').style.display = 'none';
  distanceButton.style.display = 'none';

  distanceResultText.textContent = `${distance}Km`;
  distanceResultButton.querySelector('.price-circle').textContent = extraCostInTenThousands;
  distanceResultButton.style.display = 'block';

  anime({
    targets: distanceResultButton,
    opacity: [0, 1],
    duration: 600,
    easing: 'easeInOutExpo',
  });

  isDistanceEntered = true; // 입력 완료 상태 저장
  updateTotalPrice();
  updateContactButtonState(); // 수정된 함수 반영
});

// distanceResultButton에 대한 클릭 이벤트 리스너 (수정)
distanceResultButton.addEventListener('click', () => {
  distanceResultButton.style.display = 'none'; // 결과 버튼 숨김
  distanceInput.style.display = '';        // 입력 필드 보임
  document.querySelector('#distance-question .unit').style.display = ''; // "Km" 텍스트 보임
  distanceButton.style.display = '';        // 입력 버튼 보임

  distanceInput.focus(); // 입력 필드에 포커스
  distanceInput.select(); // 입력 필드의 내용 전체 선택

  // ******추가: 문의하기 버튼 비활성화******
  contactButton.disabled = true;
  contactButton.classList.add('disabled-button');
  contactButton.textContent = "선택을 모두 완료해주세요";
  contactButton.onclick = null; //클릭이벤트 제거
});

// handleEquipmentButtonClick 함수 (수정)
function handleEquipmentButtonClick(event) {
  const button = event.currentTarget;
  const isSelected = button.classList.contains('selected');

  equipmentButtons.forEach(b => b.classList.remove('selected'));

  if (!isSelected) { // 이미 선택된 상태가 아니었을 때만
    button.classList.add('selected');
    selectedEquipment = button.dataset.equipment; // 전역 변수에 저장
  } else {
      selectedEquipment = null; // 선택 해제 시 전역 변수 초기화
  }

    // 기존 로직 (텍스트 효과 질문 표시 등)
    if (!isSelected){ //
        textEffectQuestion.style.display = 'block';
        showQuestionWithAnimation(textEffectQuestion);
    } else {
        hideQuestionWithAnimation(textEffectQuestion);
        resetQuestion('text-effect-question');
    }

    updateTotalPrice();
    scrollToBottom();
    updateContactButtonState();
    textEffectQuestion.style.pointerEvents = 'auto'; // 추가: 포인터 이벤트 활성화
}

// handleTextEffectButtonClick 함수 (수정)
function handleTextEffectButtonClick(event) {
    const clickedButton = event.currentTarget;
    clickedButton.classList.toggle('selected');

    selectedTextEffects = Array.from(
        document.querySelectorAll('#text-effect-question button.selected')
    ).map(b => b.dataset.effect);

    updateTotalPrice();
    updateContactButtonState(); // 버튼 상태 업데이트

    // ✅ 이동거리 질문을 숨기는 코드 제거!
}

// 견적 업데이트 시 영수증에도 반영하는 함수 (수정)
function updateReceipt() {
  receiptTotalPrice.textContent = document.getElementById("total-price").textContent;

  const receiptItems = document.getElementById("receipt-items");
  receiptItems.innerHTML = ""; // 기존 내용 초기화

  const categoryGroups = {}; // 카테고리별 항목 그룹

  // 각 항목 추가 시 카테고리별 그룹에 저장
  function addReceiptItem(category, detail, price) {
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push({ detail, price });
  }

  // 1. 영상 방향
  const selectedVideoFormatButton = document.querySelector("#video-format-question button.selected");
  if (selectedVideoFormatButton) {
    addReceiptItem("영상 방향", selectedVideoFormatButton.dataset.label, (parseInt(selectedVideoFormatButton.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
  }

  // 2. 러닝 타임
  const selectedRunningTimeOption = runningTimeSelect.options[runningTimeSelect.selectedIndex];
  if (selectedRunningTimeOption && selectedRunningTimeOption.value) {
    const runningTimeText = selectedRunningTimeOption.dataset.label;
    const runningTimePrice = (parseFloat(selectedRunningTimeOption.value) * 10000).toLocaleString('ko-KR') + "원";
    addReceiptItem("러닝 타임", runningTimeText, runningTimePrice);
  }

  // 3. 촬영 공간
  const selectedSpaceButtons = document.querySelectorAll("#shooting-space-question button.selected");
  selectedSpaceButtons.forEach((button) => {
    addReceiptItem("촬영 공간", button.dataset.label, (parseInt(button.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
  });

  // 4. 무빙 퀄리티
  const selectedEquipmentButton = document.querySelector("#equipment-question button.selected");
  if (selectedEquipmentButton) {
    addReceiptItem("무빙 퀄리티", selectedEquipmentButton.dataset.label, (parseInt(selectedEquipmentButton.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
  }

  // 5. 텍스트 효과
  const selectedTextEffectButtons = document.querySelectorAll("#text-effect-question button.selected");
  selectedTextEffectButtons.forEach((button) => {
    if (button.id !== 'text-effect-next-button') {
      addReceiptItem("텍스트 효과", button.dataset.label, (parseInt(button.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
    }
  });

  // 6. 이동 거리 및 추가 비용 (수정된 부분)
  if (isDistanceEntered) {
    const distance = parseInt(distanceInput.value, 10) || 0;
    if (distance > 30) {
        let extraDistanceDetail = "";
        let extraCost = 0;

        if(distance <= 100){
          extraDistanceDetail = `(+${distance - 30}km)`;
          extraCost = (distance - 30) * 1500;
        } else {
          extraDistanceDetail = `(+70km, +${distance - 100}km)`; //30km초과 100km이하, 100km초과 거리 표시
          extraCost = (70 * 1500) + ((distance - 100) * 800);
        }

        addReceiptItem("이동 거리", `${distance}km ${extraDistanceDetail}`, `${extraCost.toLocaleString('ko-KR')}원`);

    } else if (distance <= 30 && distance > 0) {
      addReceiptItem("이동 거리", `${distance}km`, `0원`);
    }
  }

  // 그룹별 항목 표시 (기존 코드)
  for (const category in categoryGroups) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("receipt-item");

    let innerHTML = `<span class="item-category">${category}</span>`;
    const items = categoryGroups[category];

    if (items.length > 1) { // 항목이 2개 이상일 경우
      innerHTML += `<span class="item-detail">${items[0].detail}</span><span class="item-price">${items[0].price}</span>`; // 첫 번째 항목만 표시

      for (let i = 1; i < items.length; i++) {
        // 1열 텍스트만 숨김 처리
        innerHTML += `<span class="item-category hidden-text">${category}</span><span class="item-detail">${items[i].detail}</span><span class="item-price">${items[i].price}</span>`;
      }
    } else { // 항목이 1개일 경우
      innerHTML += `<span class="item-detail">${items[0].detail}</span><span class="item-price">${items[0].price}</span>`;
    }

    itemDiv.innerHTML = innerHTML;
    receiptItems.appendChild(itemDiv);
  }
}

// 총 견적 업데이트 함수
function updateTotalPrice() {
  let totalPrice = 0;

  // 영상 방향
  const selectedVideoFormatButton = document.querySelector('#video-format-question button.selected');
  if (selectedVideoFormatButton) {
    totalPrice += parseInt(selectedVideoFormatButton.dataset.price, 10) || 0;
  }

  // 러닝 타임
  totalPrice += parseFloat(runningTimeSelect.value) || 0;

  // 촬영 공간
  const selectedSpaceButtons = document.querySelectorAll('#shooting-space-question button.selected');
  selectedSpaceButtons.forEach(button => {
    totalPrice += parseInt(button.dataset.price, 10) || 0;
  });

  // 무빙 퀄리티
  const selectedEquipmentButton = document.querySelector('#equipment-question button.selected');
  if (selectedEquipmentButton) {
    totalPrice += parseInt(selectedEquipmentButton.dataset.price, 10) || 0;
  }

  // 텍스트 효과
  const selectedTextEffectButtons = document.querySelectorAll('#text-effect-question button.selected');
  selectedTextEffectButtons.forEach(button => {
    totalPrice += parseInt(button.dataset.price, 10) || 0;
  });

  // 이동 거리 추가 비용 계산 (수정된 부분)
  if (isDistanceEntered) {
    const distance = parseInt(distanceInput.value, 10) || 0;

    if (distance > 30) {
      let extraCost = 0;
      if (distance <= 100) {
        // 30km 초과, 100km 이하: km당 1500원
        extraCost = (distance - 30) * 1500;
      } else {
        // 100km 초과: 30~100km 구간 + 100km 초과 구간
        extraCost = (70 * 1500) + ((distance - 100) * 800);
      }
      totalPrice += extraCost / 10000; // 만원 단위로 변환하여 더함
    }
  }

  // 수정된 부분: * 10000 제거, toLocaleString 적용, 소수점 이하 제거
  document.getElementById('total-price').textContent = `${(totalPrice * 10000).toLocaleString('ko-KR', { minimumFractionDigits: 0 })}원`; // 만원 단위로 수정
  updateReceipt(); // 영수증 업데이트
}

// 2. resetQuestion('distance-question') 함수 수정
function resetQuestion(questionId) {
  switch (questionId) {
    case 'equipment-question':
      equipmentButtons.forEach(b => b.classList.remove('selected'));
      selectedEquipment = null;
      break;
    case 'text-effect-question':
      selectedTextEffects = [];
      textEffectButtons.forEach(button => {

        button.classList.remove('selected');
      });
      break;
    case 'distance-question':
      // distanceInput.value = '';  // 이 줄은 제거! 값을 유지합니다.
      // distanceInput.setAttribute('value', ''); // 이 줄도 제거!

      // 기존 요소들 다시 표시
      distanceInput.style.display = '';
      document.querySelector('#distance-question .unit').style.display = '';
      distanceButton.style.display = '';
      // 새 버튼 숨김
      distanceResultButton.style.display = 'none';
      isDistanceEntered = false; // 유지: isDistanceEntered를 false로 설정
      break;
  }
}

// 스크롤을 부드럽게 아래로 이동시키는 함수 (anime.js 사용)
function scrollToBottom() {

    const targetScrollTop = document.body.scrollHeight - window.innerHeight;
    anime({
        targets: 'html, body',
        scrollTop: targetScrollTop,
        duration: 1000,
        easing: 'easeOutExpo'
    });
}

// 페이지 상단으로 스크롤하는 함수
function scrollToTop(smooth) {
    if (smooth) {
        anime({
            targets: 'html, body',
            scrollTop: 0,
            duration: 1000,
            easing: 'easeOutExpo'
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });
    }
}

// handleTextEffectNextButtonClick 함수 추가
function handleTextEffectNextButtonClick() {
  // 다음 질문 (distanceQuestion) 표시 (showTextEffectQuestion 조건 제거)
  distanceQuestion.style.display = 'block';
  showQuestionWithAnimation(distanceQuestion);

  // textEffectNextButton 숨기기 (애니메이션 확인)
  anime({
	  targets: textEffectNextButton,
	  opacity: [1, 0],
	  duration: 1000,
	  easing: 'easeInOutExpo',
	  complete: () => {
		  textEffectNextButton.style.display = 'none'; // 애니메이션 완료 후 display: none
		  textEffectNextButton.style.pointerEvents = 'auto'; // 추가: 포인터 이벤트 활성화
	  },
  });

  updateTotalPrice();
  scrollToBottom();
  updateContactButtonState();
}

// 전역 변수: 각 텍스트 효과 버튼에 연결된 이벤트 리스너를 저장할 객체
const textEffectButtonListeners = {};

// handleTextEffectButtonClick 함수 (클로저 사용, 리스너 저장)
function handleTextEffectButtonClick(button) { // button 매개변수 추가
  return function(event) { // 클로저 반환
    const noneButton = textEffectQuestion.querySelector('[data-effect="none"]');
    const clickedButton = event.currentTarget;
    const clickedEffect = clickedButton.dataset.effect;

    if (clickedEffect === 'none') {
      if (clickedButton.classList.contains('selected')) {
        clickedButton.classList.remove('selected');
        selectedTextEffects = [];
      } else {
        clickedButton.classList.add('selected');
        textEffectButtons.forEach(b => {
          if (b !== noneButton) b.classList.remove('selected');
        });
        selectedTextEffects = ['none'];
      }
    } else {
      clickedButton.classList.toggle('selected');

      const hasNormalOrSpatial =
        textEffectQuestion.querySelector('[data-effect="normal"].selected') ||
        textEffectQuestion.querySelector('[data-effect="spatial"].selected');

      if (hasNormalOrSpatial) {
        noneButton.classList.remove('selected');
      }

      selectedTextEffects = Array.from(
        document.querySelectorAll('#text-effect-question button.selected')
      ).map(b => b.dataset.effect);
    }

    // 다음 버튼 표시/숨김 로직
    const hasSelected = selectedTextEffects.length > 0; // selectedTextEffects 사용
      if (hasSelected) {
        textEffectNextButton.style.display = 'block';
        anime.remove(textEffectNextButton);
        anime({
          targets: textEffectNextButton,
          opacity: [0, 1],
          duration: 300,
          easing: 'easeInOutExpo',
        });
      } else {
        anime.remove(textEffectNextButton);
        anime({
          targets: textEffectNextButton,
          opacity: [1, 0],
          duration: 300,
          easing: 'easeInOutExpo',
          complete: () => {
            textEffectNextButton.style.display = 'none';
          }
        });
      }


    if (distanceQuestion.style.display !== 'none') {
      hideQuestionWithAnimation(distanceQuestion);

    }

    updateTotalPrice();
    updateContactButtonState();
  }
}

// 모든 버튼이 선택 해제되었을 때 "다음 버튼" 숨기기
function updateTextEffectNextButton() {
    if (document.querySelectorAll('#text-effect-question button.selected').length === 0) {
        textEffectNextButton.style.display = 'none';
    }
}

// 이벤트 리스너 추가 (버튼 클릭 시 마다 `updateTextEffectNextButton` 실행)
textEffectButtons.forEach(button => {
    button.addEventListener('click', updateTextEffectNextButton);
});

// 이벤트 리스너 등록 (handleTextEffectButtonClick을 클로저로 사용)
textEffectButtons.forEach(button => {
  const listener = handleTextEffectButtonClick(button); // 클로저 생성 및 button 전달
  textEffectButtonListeners[button.dataset.effect] = listener; // 리스너 저장
  button.addEventListener('click', listener);
});

// 영수증 내용 업데이트 함수
function updateReceiptModal() {
    const receiptModalItems = document.getElementById("receipt-modal-items");
    receiptModalItems.innerHTML = ""; // 기존 내용 초기화

    const receiptModalLine = document.getElementById('receipt-modal-line');
    receiptModalLine.style.display = 'block'; // 확실하게 보이도록

    const receiptModalLine2 = document.getElementById('receipt-modal-line2'); // 추가
    receiptModalLine2.style.display = 'block'; // 추가: 두 번째 점선도 보이게

    const categoryGroups = {}; // 카테고리별 항목 그룹

    // 각 항목 추가 시 카테고리별 그룹에 저장
    function addReceiptItem(category, detail, price) {
        if (!categoryGroups[category]) {
            categoryGroups[category] = [];
        }
        categoryGroups[category].push({ detail, price });
    }

    // 1. 영상 방향
    const selectedVideoFormatButton = document.querySelector("#video-format-question button.selected");
    if (selectedVideoFormatButton) {
        addReceiptItem("영상 방향", selectedVideoFormatButton.dataset.label, (parseInt(selectedVideoFormatButton.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
    }

    // 2. 러닝 타임
    const selectedRunningTimeOption = runningTimeSelect.options[runningTimeSelect.selectedIndex];
    if (selectedRunningTimeOption && selectedRunningTimeOption.value) {
        const runningTimeText = selectedRunningTimeOption.dataset.label;
        const runningTimePrice = (parseFloat(selectedRunningTimeOption.value) * 10000).toLocaleString('ko-KR') + "원";
        addReceiptItem("러닝 타임", runningTimeText, runningTimePrice);
    }

    // 3. 촬영 공간
    const selectedSpaceButtons = document.querySelectorAll("#shooting-space-question button.selected");
    selectedSpaceButtons.forEach((button) => {
        addReceiptItem("촬영 공간", button.dataset.label, (parseInt(button.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
    });

    // 4. 무빙 퀄리티
    const selectedEquipmentButton = document.querySelector("#equipment-question button.selected");
    if (selectedEquipmentButton) {
        addReceiptItem("무빙 퀄리티", selectedEquipmentButton.dataset.label, (parseInt(selectedEquipmentButton.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
    }

    // 5. 텍스트 효과
	const selectedTextEffectButtons = document.querySelectorAll("#text-effect-question button.selected");
	selectedTextEffectButtons.forEach((button) => {
		// 다음 버튼(textEffectNextButton)은 무시하도록 조건 추가
		if (button.id !== 'text-effect-next-button') {
			addReceiptItem("텍스트 효과", button.dataset.label, (parseInt(button.dataset.price) * 10000).toLocaleString('ko-KR') + "원");
		}
	});

    // 6. 이동 거리 및 추가 비용 (수정된 부분)
    if (isDistanceEntered) {
        const distance = parseInt(distanceInput.value, 10) || 0;
        if (distance > 30) {
            let extraDistanceDetail = "";
            let extraCost = 0;
            if(distance <= 100){
                extraDistanceDetail = `(+${distance - 30}km)`;
                extraCost = (distance - 30) * 1500;
            }
            else{
                extraDistanceDetail = `(+70km, +${distance - 100}km)`; //30km초과 100km이하, 100km초과 거리 표시
                extraCost = (70 * 1500) + ((distance - 100) * 800);
            }
            addReceiptItem("이동 거리", `${distance}km ${extraDistanceDetail}`, `${extraCost.toLocaleString('ko-KR')}원`);
        }
        else if (distance <= 30 && distance > 0){
            addReceiptItem("이동 거리", `${distance}km`, `0원`);
        }
    }

    // 그룹별 항목 표시
    for (const category in categoryGroups) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("receipt-item");

        let innerHTML = `<span class="item-category">${category}</span>`;
        const items = categoryGroups[category];

        if (items.length > 1) {
            innerHTML += `<span class="item-detail">${items[0].detail}</span><span class="item-price">${items[0].price}</span>`;

            for (let i = 1; i < items.length; i++) {
                innerHTML += `<span class="item-category hidden-text">${category}</span><span class="item-detail">${items[i].detail}</span><span class="item-price">${items[i].price}</span>`;
            }
        } else {
            innerHTML += `<span class="item-detail">${items[0].detail}</span><span class="item-price">${items[0].price}</span>`;
        }

        itemDiv.innerHTML = innerHTML;
        receiptModalItems.appendChild(itemDiv);
    }

    // 총 견적 업데이트
    document.getElementById('receipt-modal-total-price').textContent = document.getElementById('total-price').textContent;

  // ****** 여기에 스크롤 애니메이션 코드 추가 ******
/*  anime({
    targets: receiptModalItems,
    scrollTop: receiptModalItems.scrollHeight,
    duration: 300,
    easing: 'easeInOutQuad'
  }); */
}


// 오버레이 클릭 시 모달 닫기
document.getElementById('overlay').addEventListener('click', function() {
  // 1. 오버레이 비활성화 (opacity, pointer-events) - 애니메이션 추가
  this.classList.remove('active');
  anime({
    targets: this,
    opacity: [1, 0],
    duration: 300,
    easing: "easeInOutQuad",
    complete: () => {
        isContactButtonClicked = false; // 기존 코드
    }
  })

  // 2. 영수증 모달 비활성화 (transform, opacity)
  const receiptModal = document.getElementById('receipt-modal');
  receiptModal.classList.remove('active');
  anime({
    targets: receiptModal,
    translateY: ["0%", "100%"],
    opacity: [1, 0],
    duration: 300,
    easing: "easeInOutQuad",
    complete: () => {
      receiptModal.style.display = 'none'; // 애니메이션 완료 후 숨김
      isModalOpen = false; // 모달이 닫힐 때 플래그를 false로 설정
    }
  });
});

// 상담신청 버튼 클릭 시 모달이 닫히지 않도록 이벤트 전파 중단
document.getElementById('modal-submit-button').addEventListener('click', function(event) {
    event.stopPropagation(); // 상위 요소로의 이벤트 전파 중단
});

document.addEventListener("DOMContentLoaded", () => {
    const gifs = document.querySelectorAll(".button-gif");
    const overlay = document.createElement("div");
    overlay.id = "gif-overlay";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.2s ease-in-out, backdrop-filter 0.5s ease-in-out";
    document.body.appendChild(overlay);

    gifs.forEach(gif => {
        gif.style.transition = "opacity 1.2s ease-in-out"; // 🔹 부드럽게 숨기기 위해 미리 설정
	    
        gif.addEventListener("click", (event) => {
            const img = event.target;
            const rect = img.getBoundingClientRect();
            const clonedImg = img.cloneNode(); // 원본을 복제

            // 🔹 다른 GIF 서서히 숨기기
            gifs.forEach(otherGif => {
                if (otherGif !== gif) {
                    otherGif.style.opacity = "0";
                }
            });
		
            // 원본 이미지에는 .zoomed 추가 X
            // 클론 이미지에만 .zoomed 추가
            clonedImg.classList.add("zoomed");
            clonedImg.style.position = "fixed";
            clonedImg.style.left = `${rect.left}px`;
            clonedImg.style.top = `${rect.top}px`;
            clonedImg.style.width = `${rect.width}px`;
            clonedImg.style.height = `${rect.height}px`;
            clonedImg.style.transition = "all 0.75s ease-in-out, filter 0.75s ease-in-out"; // filter 추가
            clonedImg.style.filter = "blur(50px)"; // 초기 블러 설정
            clonedImg.style.zIndex = "10001";
            clonedImg.style.objectFit = "contain";
            clonedImg.style.cursor = "pointer";
		
            overlay.innerHTML = "";
            overlay.appendChild(clonedImg);
            overlay.style.display = "block";
		
            setTimeout(() => {
                overlay.style.opacity = "1";
                overlay.style.backdropFilter = "blur(10px)";
                overlay.style.background = "rgba(0, 0, 0, 0.5)";
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
                overlay.style.zIndex = "10000";
                overlay.style.display = "flex";
                overlay.style.justifyContent = "center";
                overlay.style.alignItems = "center";
            }, 10);

            // 클론 이미지를 확대
            setTimeout(() => {
                clonedImg.style.left = "50%";
                clonedImg.style.top = "50%";
                clonedImg.style.transform = "translate(-50%, -50%)";
                clonedImg.style.width = "101vw";
                clonedImg.style.height = "101vh";
                clonedImg.style.filter = "blur(0px)"; // 블러 제거
            }, 100);
        });
    });

    // 오버레이 클릭 시 닫기 (zoomed 클래스 제거)
    overlay.addEventListener("click", () => {
        const clonedImg = overlay.querySelector("img");
        if (clonedImg) {
            clonedImg.classList.remove("zoomed"); // 커진 이미지에서만 제거            
            clonedImg.style.transition = "opacity 1s ease-in-out, filter 1s ease-in-out";
            clonedImg.style.opacity = "0";
            clonedImg.style.filter = "blur(50px)";
            overlay.style.transition = "opacity 1s ease-in-out";
            overlay.style.opacity = "0";
		
            // 1. 클론 이미지를 먼저 숨깁니다. (예: 100ms 후)
            setTimeout(() => {
                overlay.style.display = "none";
                overlay.innerHTML = "";
            }, 1000);
            
            // 2. 다른 GIF들을 딜레이를 주고 다시 보이게 합니다. (예: 1000ms 후)
            setTimeout(() => {
                gifs.forEach(gif => {
                    gif.style.opacity = "1";
                });
            }, 0); 
		
        }
    });
});

// ✅ 최종 질문 애니메이션 실행 함수
function showFinalMessage() {
    finalMessage.style.display = "block"; // 우선 표시
    finalMessage.classList.remove("show"); // 초기화 후 다시 실행
    setTimeout(() => {
        finalMessage.classList.add("show"); // 애니메이션 적용
    }, 500);

    // ✅ 더 정확한 스크롤 위치 계산하여 자연스럽게 이동
    setTimeout(() => {
        const finalMessagePosition = finalMessage.getBoundingClientRect().top + window.scrollY;
        const viewportHeight = window.innerHeight; // 현재 화면의 높이
        const scrollTarget = finalMessagePosition - (viewportHeight / 2); // 중앙에 위치하도록 조정
        const maxScroll = document.documentElement.scrollHeight - viewportHeight; // 최대 스크롤 값

        anime({
            targets: [document.documentElement, document.body], 
            scrollTop: Math.min(scrollTarget, maxScroll), // 페이지를 초과해서 스크롤되지 않도록 제한
            duration: 1600,  
            easing: 'easeInOutCubic'
        });
    }, 500); 
}

// ✅ distanceResultButton이 나타나면 finalMessage를 표시 (단, 문의하기 버튼이 활성화된 경우에만)
const observer = new MutationObserver(() => {
    if (
        window.getComputedStyle(distanceResultButton).display !== 'none' && // 이동거리 버튼이 나타나고
        !contactButton.disabled // 문의하기 버튼이 활성화된 경우만
    ) {
        showFinalMessage(); // 최종 질문 표시 + 애니메이션 실행
        observer.disconnect(); // 한 번만 실행되도록 감시 중단
    }
});

// distanceResultButton의 속성 변화를 감지
observer.observe(distanceResultButton, { attributes: true, attributeFilter: ['style'] });

// ✅ 문의하기 버튼 상태 변화 감지 → 활성화 시 애니메이션 적용
const contactButtonObserver = new MutationObserver(() => {
    if (!contactButton.disabled && window.getComputedStyle(distanceResultButton).display !== 'none') {
        showFinalMessage(); // 문의하기 버튼이 활성화될 때도 애니메이션 적용
    } else {
        finalMessage.style.display = "none"; // 비활성화 시 숨김
        finalMessage.classList.remove("show"); // 상태 초기화
    }
});

// 문의하기 버튼의 속성 변화를 감지
contactButtonObserver.observe(contactButton, { attributes: true, attributeFilter: ['disabled'] });

const webhookURL = "https://discord.com/api/webhooks/1347457847579119667/ZhMnuB_GQtH_1duycdaUixTLfrJDVpAMxqBTzjsQn1i7iK6P3UWdXWjrj2nXaW02uOKV";

// "상담신청" 버튼 가져오기
const consultationButton = document.getElementById("modal-submit-button");


if (consultationButton) {
    consultationButton.addEventListener("click", function() {
        // 사용자가 입력한 정보 가져오기
        const name = document.getElementById("modal-name").value;
        const position = document.getElementById("modal-position").value;
        const phone = document.getElementById("modal-phone").value;
        const email = document.getElementById("modal-email").value;
        const notes = document.getElementById("modal-notes").value.trim(); // 추가된 부분

        if (!name || !position || !phone || !email) {
            alert("⚠️ 정보를 모두 입력해주세요.");
            return;
        }

        // 사용자가 선택한 견적 정보 가져오기
        const selectedOptions = [];
        document.querySelectorAll("#receipt-modal-items .receipt-item").forEach(item => {
            const category = item.querySelector(".item-category").innerText;
            const detail = item.querySelector(".item-detail").innerText;
            const price = item.querySelector(".item-price").innerText;
            selectedOptions.push(`${category}: ${detail} (${price})`);
        });

        const totalPrice = document.getElementById("receipt-modal-total-price").innerText;

        // 디스코드로 보낼 데이터 준비
        const payload = {
            content: "**📢 새로운 상담 신청이 접수되었습니다!**",
            embeds: [{
                title: "📄 상담 신청 정보",
                color: 3447003,
                fields: [
                    { name: "👤 이름", value: name, inline: true },
                    { name: "🏢 직책", value: position, inline: true },
                    { name: "📞 연락처", value: phone, inline: true },
                    { name: "✉️ 이메일", value: email, inline: true },
                    { name: "💰 총 견적", value: totalPrice, inline: true },
                    { name: "📌 선택한 옵션", value: selectedOptions.join("\n"), inline: false }
                ],
                footer: {
                    text: "문의 시간: " + new Date().toLocaleString()
                }
            }]
        };

        // 사용자가 추가 내용을 입력했을 경우에만 웹훅 메시지에 포함
        if (notes !== "") {
            payload.embeds[0].fields.push({
                name: "📝 추가 전달내용 및 특이사항",
                value: notes,
                inline: false
            });
        }

        // fetch API를 이용하여 디스코드로 전송
        fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.ok) {
                alert("✅ 상담 신청이 완료되었습니다! 담당자가 확인 후 연락드리겠습니다.");
            } else {
                alert("⚠️ 상담 신청 전송에 실패했습니다. 다시 시도해주세요.");
            }
        }).catch(error => {
            console.error("Error sending webhook:", error);
            alert("❌ 상담 신청 중 오류가 발생했습니다.");
        });
    });
    
    // ✅ 터치 시 즉시 실행되도록 `touchstart` 이벤트 추가 (기존 기능 유지)
    consultationButton.addEventListener("touchstart", (event) => {
        event.preventDefault(); // 자동으로 발생하는 click 이벤트 방지
        consultationButton.click(); // 클릭 이벤트 강제 실행
    }, { passive: false });
    
    // ✅ 마우스 버튼을 누르는 순간 즉시 실행되도록 `mousedown` 이벤트 추가
    consultationButton.addEventListener("mousedown", (event) => {
        event.preventDefault(); // 자동으로 발생하는 click 이벤트 방지
        consultationButton.click(); // 클릭 이벤트 강제 실행
    });

} else {
    console.error("❌ '상담신청' 버튼을 찾을 수 없습니다! ID를 확인해주세요.");
}
