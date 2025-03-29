
let btn = document.getElementById('left-right');
let monthlyBtn = document.getElementById('monthly-btn');
let quarterlyBtn = document.getElementById('quarterly-btn');
const monthlyCards = document.getElementById('monthly-cards');
const yearlyCards = document.getElementById('yearly-cards');


// Function to handle Monthly/Quarterly toggle
function leftClick() {
  btn.style.left = "0%";
  monthlyBtn.classList.add('active');
  quarterlyBtn.classList.remove('active');


  monthlyCards.style.display = 'flex';
  yearlyCards.style.display = 'none';
}

function rightClick() {
  btn.style.left = "50%";
  quarterlyBtn.classList.add('active');
  monthlyBtn.classList.remove('active');

  monthlyCards.style.display = 'none';
  yearlyCards.style.display = 'flex';
}


monthlyBtn.addEventListener('click', leftClick);
quarterlyBtn.addEventListener('click', rightClick);


monthlyCards.style.display = 'flex';
yearlyCards.style.display = 'none';
monthlyBtn.classList.add('active');
btn.style.left = "0%";



