class Jeopardy {
   constructor(element, options={}) {
      
      //Categories from https://jservice.io/search
      this.useCategoryIds = options.useCategoryIds || [88, 1892, 4483, 218, 6151]; 

      //Database
      this.categories = [];
      this.clues = {};
      
      //State
      this.currentClue = null;
      this.score = 100;
      
      //Elements
      this.boardElement = element.querySelector(".board");
      this.scoreCountElement = element.querySelector(".score-count");
      this.formElement = element.querySelector("form");
      this.inputElement = element.querySelector("input[name=user-answer]");
      this.modalElement = element.querySelector(".card-modal");
      this.clueTextElement = element.querySelector(".clue-text");
      this.resultElement = element.querySelector(".result");
      this.resultTextElement = element.querySelector(".result_correct-answer-text");
      this.successTextElement = element.querySelector(".result_success");
      this.failTextElement = element.querySelector(".result_fail");
   }

   initGame() {
      //Bind event handlers
      this.boardElement.addEventListener("click", event => {
         if (event.target.dataset.clueId) {
            this.handleClueClick(event);
         }
      });
      this.formElement.addEventListener("submit", event => {
         this.handleFormSubmit(event);
      });
      
      //Render initial state of score
      this.updateScore(0);
      this.minusScore(0);
      
      //call the fetchCategories function
      this.fetchCategories();
   }
   
   fetchCategories() {      
      //Fetch all the data from the API
      const categories = this.useCategoryIds.map(category_id => {
         return new Promise((resolve, reject) => {
            fetch(`https://jservice.io/api/category?id=${category_id}`)
               .then(response => response.json()).then(data => {
                  resolve(data);
               });
         });
      });
      
      //Sift through the data when all categories come back
      Promise.all(categories).then(results => {
         
         //Build up the list of categories
         results.forEach((result, categoryIndex) => {
            
            //Start with a blank category
            var category = {
               title: result.title,
               clues: []
            }
            
            //Add every clue within a category to the database of clues
            var clues = shuffle(result.clues).splice(0,5).forEach((clue, index) => {
               console.log(clue)
               
               //Create a unique ID for this clue
               var clueId = categoryIndex + "-" + index;
               category.clues.push(clueId);
               
               //Add clue to database
               this.clues[clueId] = {
                  question: clue.question,
                  answer: clue.answer,
                  value: (index + 1) * 100
               };
            })
            
            //Add this category to database of categories
            this.categories.push(category);
         });
         
         //Render each category to the DOM
         this.categories.forEach((c) => {
            this.renderCategory(c);
         });
      });
   }

   renderCategory(category) {      
      let column = document.createElement("div");
      column.classList.add("column");
      column.innerHTML = (
         `<header>${category.title}</header>
         <ul>
         </ul>`
      ).trim();
      
      var ul = column.querySelector("ul");
      category.clues.forEach(clueId => {
         var clue = this.clues[clueId];
         ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
      })
      
      //Add to DOM
      this.boardElement.appendChild(column);
   }

   updateScore(change) {
      this.score += change;
      this.scoreCountElement.textContent = this.score;
   }

   minusScore(change) {
      this.score -= change;
      this.scoreCountElement.textContent = this.score;
   }

   handleClueClick(event) {
      //Question disappears after a short while (60 seconds)
      setTimeout(() =>{
         this.modalElement.classList.remove("visible");
     }, 60000);

      var clue = this.clues[event.target.dataset.clueId];

      //Mark this button as used
      event.target.classList.add("used");
      
      //Clear out the input field
      this.inputElement.value = "";
      
      //Update current clue
      this.currentClue = clue;

      //Update the text
      this.clueTextElement.textContent = this.currentClue.question;
      this.resultTextElement.textContent = this.currentClue.answer;

      //Hide the result
      this.modalElement.classList.remove("showing-result");
      
      //Show the modal
      this.modalElement.classList.add("visible");
      this.inputElement.focus();
   }

   //Handle an answer from user
   handleFormSubmit(event) {
      event.preventDefault();

      var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
      if (isCorrect) {
         this.updateScore(this.currentClue.value);
      }
      else {
      this.minusScore(this.currentClue.value);
      }

      //Show answer
      this.revealAnswer(isCorrect);
   }
   
   //Standardize an answer string, so we can compare and accept variations
   cleanseAnswer(input="") {
      var friendlyAnswer = input.toLowerCase();
      friendlyAnswer = friendlyAnswer.replace("<i>", "");
      friendlyAnswer = friendlyAnswer.replace("</i>", "");
      friendlyAnswer = friendlyAnswer.replace(/ /g, "");
      friendlyAnswer = friendlyAnswer.replace(/"/g, "");
      friendlyAnswer = friendlyAnswer.replace(/^a /, "");
      friendlyAnswer = friendlyAnswer.replace(/^an /, "");      
      return friendlyAnswer.trim();
   }
   
   revealAnswer(isCorrect) {
      //Show the individual success/fail case
      this.successTextElement.style.display = isCorrect ? "block" : "none";
      this.failTextElement.style.display = !isCorrect ? "block" : "none";
      
      //Show the whole result container
      this.modalElement.classList.add("showing-result");
      
      //Answer disappears after a short while (30 seconds)
      setTimeout(() => {
         this.modalElement.classList.remove("visible");
     }, 3000);
   }
}

//Utils -----------------------------------
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const game = new Jeopardy( document.querySelector(".app"), {});
game.initGame();

function findPercentageScore()
{   
   document.getElementById("registration").reset(); //clears the form         

   /*enabling form fields*/
   document.getElementById("fname").disabled = false;
   document.getElementById("lname").disabled = false;
   document.getElementById("dob").disabled = false;
   document.getElementById("email").disabled = false;
   document.getElementById("male").disabled = false;
   document.getElementById("female").disabled = false;
   document.getElementById("addressstreet").disabled = false;
   document.getElementById("addresscity").disabled = false;
   document.getElementById("addresstown").disabled = false;
   document.getElementById("addresscountry").disabled = false;
   document.getElementById("primary").disabled = false;
   document.getElementById("secondary").disabled = false;
   document.getElementById("tertiary").disabled = false;
   document.getElementById("img").disabled = false;

   document.getElementById("playbutton").disabled = true; //disables the play button
   document.getElementById("quittbutton").disabled = true; //disables the end game button
   document.getElementById("registerbutton").disabled = false; //enables the register button
   
   /*removes the play area*/
   const playarea = document.getElementById("playarea");

   if(playarea.style.display === "block")
   {
      playarea.style.display="none";
   }
}

/*display all the data in the PlayersData array*/
function showAll()
{
   document.getElementById("showallplayers").value = " "; //clears the textarea
                
   /*displays all player data in the array*/                
   for(var i=0; i<PlayersData.length; i++)
   {   
      document.getElementById("showallplayers").value = PlayersData[i];
   }                     
}