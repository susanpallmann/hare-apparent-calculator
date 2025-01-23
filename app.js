// Global constants
const animationSpeed = 1.5;
const tickRate = 30; // Animation speed - higher number = faster animation
const gravityMovement = 15; // Amount in pixels a rabbit moves due to gravity each "tick" - higher number = faster movement
const animationTime = 1000; // Time in ms in which all created rabbits will be created and dropped - higher number = longer animation duration. We may want to reassess if this should remain a constant if it turns out to be awkward when the number of rabbits greatly differs.
const rabbitWidth = 156; // Width of rabbits (must match CSS)
const rabbitHeight = 114; // Height of rabbits (must match CSS)
const heightBuffer = rabbitHeight * 0.46; // The amount 2 rabbits should overlap on y axis
const widthBuffer = rabbitWidth * 0.49; // The max 2 rabbits can overlap on x axis
const maxAnimatedRabbits = 150; // Maximum number of rabbits we'll ever create for the animation to avoid destroying someone's mobile browser
const fewRabbits = [
	"A modest gathering of fluff.",
	"Just a few bunnies, minding their own business... for now.",
	"Sparse, but stylish; like a minimalist rabbit exhibit.",
	"The rabbit equivalent of a quiet afternoon.",
	"Not enough rabbits to swarm, but definitely enough to be plotting something.",
	"Just a smattering of cottontails."
	];
const someRabbits = [
	"The bunny brigade is assembling.",
	"Things are starting to get hoppy around here.",
	"A decent-sized warren. Prepare for scattered droppings.",
	"Now we're talking. This is a respectable amount of rabbit.",
	"The lawn is theirs now.",
	"We're going to need more carrots.",
	"They could hold a carrot convention.",
	"A flurry of fur and twitching noses.",
	"Sufficiently fluffy.",
	"They're multiplying. It's only a matter of time."
	];
const manyRabbits = [
	"It's a bunny-pocalypse!",
	"Carrots are a distant memory now. Panic is setting in.",
	"The ground is moving... it's all rabbits.",
	"They've formed a single, giant, pulsating mass of fur. It demands tribute.",
	"They've achieved critical fluff mass.",
	"The very air vibrates with the sound of chewing.",
	"The fuzzy hoard is large enough to have its own gravitational pull.",
	"The fluff has consumed everything. Resistance is futile.",
	"The earth is now 90% rabbit"
	];

// Global variables
let existingHares = 0; // Number of Hare Apparents on the battlefield
let enteringHares = 0; // Number of Hare Apparents entering
let tokensMade = 0; // Number of rabbit tokens created

$(document).ready(function () {
	
	const container = $('#rabbit-container');
	const containerHeight = container.height();
	const containerWidth = container.width();
	
  $('#calculate-button').click(function(){
    existingHares = $('#existingHares').val();
    enteringHares = $('#enteringHares').val();
    existingHares = +existingHares;
    enteringHares = +enteringHares;
    for(i=0;i<enteringHares;i++){
      tokensMade = tokensMade + existingHares;
      existingHares++;
    }
    $('#huge-answer-number').text(0);
    if (tokensMade < 10) {
        $('.flavor-text').text(fewRabbits[Math.floor(Math.random() * fewRabbits.length)]);
    } else if (tokensMade < 30) {
        $('.flavor-text').text(someRabbits[Math.floor(Math.random() * someRabbits.length)]);
    } else {
		$('.flavor-text').text(manyRabbits[Math.floor(Math.random() * manyRabbits.length)]);
    }
    $('#calculator').fadeOut(300,function(){
      $('#answer').fadeIn(300);
      $('#rabbit-container').empty();
      $('#rabbit-container').fadeIn(300);
      $('#huge-answer-number').each(function () {
        var $this = $(this);
        jQuery({ Counter: 0 }).animate({ Counter: tokensMade }, {
          duration: 500,
          easing: 'linear',
          step: function (now) {
            $this.text(Math.ceil(now));
          }
        });
      });
	  
	  //dynamic maxanimated rabbits??
	  //maximum number of possible rows given container Height
	  let maxRowsPossible = Math.round(containerHeight / (rabbitHeight - (rabbitHeight-heightBuffer)));
	  console.log('max rows is ' + maxRowsPossible);
	  //maximum number of possible rabbits in a row
	  let maxRabbitsPerRow = Math.round(containerWidth / (rabbitWidth - widthBuffer));
	  console.log('max rabbits per row is ' + maxRabbitsPerRow);
	  //multiply the maximums
	  let rabbitCeiling = maxRowsPossible*maxRabbitsPerRow;
	  
      if(tokensMade < rabbitCeiling) {
	  queueRabbitAnimation(tokensMade);
      } else {
	  queueRabbitAnimation(rabbitCeiling);
      }
    });
  });
  $('#back-button').click(function(){
    existingHares = 0;
    enteringHares = 0;
    tokensMade = 0;
    $('#rabbit-container').fadeOut(300);
    $('#answer').fadeOut(300,function(){
      $('#rabbit-container').empty();
      $('#calculator').fadeIn(300,function(){
        $('#huge-answer-number').text(0);
      });
    });
  });
});

function queueRabbitAnimation(numberRabbits) {
  // Declaring some more constants here, as these require the scene to have loaded to be retrieved
	// We first are grabbing the container DOM element and then getting the height and width from this element for use in later calculations
	const container = $('#rabbit-container');
	const containerHeight = container.height();
	const containerWidth = container.width();

	// Array to store randomized x positions for rabbit animation
	let rows = []; 
	
	// Initializing an array for storing the rabbits we will be managing.
	const rabbits = [];
	
	// Now a constant calculated by dividing the animation time by our number of rabbits to drop so that the drops are equally spaced. We may want to add some additional math to account for the time it takes for a rabbit to drop as otherwise technically the animation time will be exceeded by at most the length of time it takes for a rabbit to fall completely.
	const dropInterval = animationSpeed*0.25*1000;
	
	// Generate x value "rows" for dropping rabbits
	rows = generateRows(containerWidth, numberRabbits, rows);
	
	// This variable is to track how many rabbits have been dropped. I'm not sure if this is actually necessary, so we'll come back and review this later.
	let rabbitsDropped = 0;
	
	// This variable tracks the current row for the generated x position rows
	let currentRowIndex = -1;
	
	// Tracks available x positions for the current row
	let availableXPositions = [];
	
	// Function "drops rabbits," creating the DOM element to represent a rabbit, initializing it with some data attributes, and adding it to the rabbits array
	function dropRabbit() {
		// More of a failsafe I think, but if the number of rabbits already dropped is larger than or equal to the number of rabbits we are expecting to drop, we can end this function. (Note: this number really should not ever be larger than the number of rabbits we are expecting to drop.) Also, if we add a maximum number of rabbits, we'll either need to account for that before setting the variable, or come back to this function later to update it. (TODO)
		if (rabbitsDropped >= numberRabbits) return;
		
		 // Start a new row if the available x positions array is empty
        if (availableXPositions.length === 0) {
			currentRowIndex++;
			if (currentRowIndex >= rows.length) return;
			availableXPositions = [...rows[currentRowIndex]];
		}

        // Select a random index from the *available* x positions
        const randomIndex = Math.floor(Math.random() * availableXPositions.length);
        let xPos = availableXPositions.splice(randomIndex, 1)[0]; // Remove the selected x position
		xPos += (containerWidth - (rows[currentRowIndex][(rows[currentRowIndex]).length-1] - rows[currentRowIndex][0] + rabbitWidth))/2;
		
		const destination = containerHeight - rabbitHeight - ((rabbitHeight-heightBuffer)*(currentRowIndex));
		const dropSpeed = (destination/containerHeight)*animationSpeed;
		
		// Creates a rabbit div element with an ID# for which rabbit it is, and adds some attributes to handle our animation states. I have a hunch that we don't need the xPos/yPos parts anymore though. TODO
		// May also refactor my CSS logic to use one attribute for all animation states since my code shouldn't be referencing these anymore
		const rabbit = $(`<div class="rabbit" id="rabbit${rabbitsDropped}" animation="falling" row="${currentRowIndex}" style="top:${-rabbitHeight}px;left:${xPos}px;transition: top ${dropSpeed}s linear;"></div>`);
		
		// Adds the created rabbit to the container in the DOM
		container.prepend(rabbit);
		
		// Adds some data attributes we'll use to track the rabbit's collision, positioning, and movement
		rabbit.data('xPos', xPos); // TODO: want to make the xPos random (or at least seem random) upon initializing
		rabbit.data('yPos', 0);
		rabbit.data('yPos', -rabbit.height()); // Adjusting the yPos so that the rabbit starts off-screen.
		rabbit.data('falling', true); // Rabbits start in a falling state
		rabbit.data('grounded', false);  // Rabbits start not grounded by definition
		rabbit.data('row', currentRowIndex); // Track row current rabbit belongs to
		
		// Add this newly created rabbit to our rabbits array
		rabbits.push(rabbit);
		
		rabbit.data('yPos', destination);
		rabbit.css({'top': destination, 'left': xPos, 'transition': 'top ' + dropSpeed + 's linear'});

		const animationTimeout = setTimeout(function(){
			rabbit.data('falling', false);
			rabbit.attr('animation','bouncing');
			const animationTimeout = setTimeout(function(){
				rabbit.attr('animation','grounded');
				rabbit.data('grounded', true);
			}, dropSpeed*300); 
		}, dropSpeed*1000); 
		
		// Increase the number of rabbits dropped
		rabbitsDropped++;
	}
	
	// Drop the first rabbit immediately once everything is initialized
	dropRabbit();
	
	// Then drop the remaining rabbits at intervals to space the rabbits evenly through the animation time
	let dropTimer = setInterval(function() {
		// Drops the next rabbit
		dropRabbit();
		// If the number of rabbits dropped is equal to or greater than the number of rabbits we expect to drop (though it should never be greater), we end this interval
		if (rabbitsDropped >= numberRabbits) {
			clearInterval(dropTimer);
		}
	}, dropInterval); // dropInterval was defined as a constant at the start of our document ready function
}

// Function to create one or more rows of x position values
function generateRows (containerWidth, numberRabbits, rows) {
	let rabbitsCalculated = 0;
	let currentRow = [];
	let rowMax = containerWidth + 2*widthBuffer;
	
	// If the number of rabbits we've calculated x positions for is less than the number of rabbits we're expecting to place, we can continue calculating rabbit x positions
	while (rabbitsCalculated < numberRabbits) {
		
		// Resets row width sum at the start of each new row
        let rowWidth = 0;
		
		// Resets currentRow at the start of each new row
        currentRow = [];

		// While the row is not full (the row width sum + the width of an additional rabbit would not exceed the container width)
        while (rowWidth + rabbitWidth <= rowMax && rabbitsCalculated < numberRabbits) {

			// Initialize a variable for storing the x position of the rabbit we're currently calculating for
			let rabbitX;
			
			// Add the row's sum so far and the leading space calculated above
			rabbitX = rowWidth;
			
			// Add the calculated x value to the row array
            currentRow.push(rabbitX);
			
			// Update the row sum to include the calculated space and the added rabbit's width
            rowWidth += rabbitWidth;

			// Initialize a randomized trailing space between -1*rabbit width buffer and +1*rabbit width buffer
            let bufferSpace = Math.floor(Math.random() * widthBuffer) - widthBuffer;
			
			// Add that trailing space to the row width total
            rowWidth += bufferSpace;
			
			// Increment rabbitsCalculated
            rabbitsCalculated++;
        }
		
		// Add the current row to our rows array
        rows.push(currentRow);
    }
	// Return the complete rows array
    return rows;
}
