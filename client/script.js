import bot from './assets/bot.svg';
import user from './assets/user.svg';

const formEl = document.querySelector('form');

const chatContainer = document.getElementById('chat_container');

let loadInterval;

const loader = (ele)=>{
  ele.textContent = '';
  loadInterval = setInterval(()=>{
    // Update the text content of the loading indicator
    ele.textContent += '.';

     // If the loading indicator has reached three dots, reset it
    if (ele.textContent === '....') {
      ele.textContent = '';
    }
  },300);
}

const typeText = (ele, text)=>{
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          ele.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}


// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element

const generateId = ()=>{
  const timeStamp = Date.now();
  const randNum = Math.random();

  const hexadecimalString = randNum.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

const chatStrip = (isAi, val, uniqueId)=>{
  return (`
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
          <div class="profile">
              <img 
                src=${isAi ? bot : user} 
                alt="${isAi ? 'bot' : 'user'}" 
              />
          </div>
          <div class="message" id=${uniqueId}>${val}</div>
      </div>
    </div>
  `)

}

const handleSubmit = async(e)=>{
  e.preventDefault();
  const data = new FormData(formEl);
  // console.log(data);
  //user's chatstrip
  // const uniqueId = generateId();
  chatContainer.innerHTML +=chatStrip(false,data.get('prompt'));

   // to clear the textarea input 
   formEl.reset()

  //  bot's chatstrip
  const uniqueId = generateId();
  chatContainer.innerHTML +=chatStrip(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)
  // fetch data from server->bot's response
  const response = await fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        prompt: data.get('prompt')
    })
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
    // console.log(parsedData);
    typeText(messageDiv, parsedData)
  }else {

    const err = await response.text()

    messageDiv.innerHTML = "Something went wrong"
    alert(err)
}

}

formEl.addEventListener('submit', handleSubmit);
formEl.addEventListener('keyup',(e)=>{
  if(e.keyCode===13){
    handleSubmit(e);
  }
})
