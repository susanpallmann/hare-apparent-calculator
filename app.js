// Global constants
const tickRate = 30; // Animation speed - higher number = faster animation
const gravityMovement = 15; // Amount in pixels a rabbit moves due to gravity each "tick" - higher number = faster movement
const animationTime = 1000; // Time in ms in which all created rabbits will be created and dropped - higher number = longer animation duration. We may want to reassess if this should remain a constant if it turns out to be awkward when the number of rabbits greatly differs.
const rabbitWidth = 104; // Width of rabbits (must match CSS)
const rabbitHeight = 76; // Height of rabbits (must match CSS)
const heightBuffer = rabbitHeight * 0.46; // The amount 2 rabbits should overlap on y axis
const widthBuffer = rabbitWidth * 0.49; // The max 2 rabbits can overlap on x axis
const maxAnimatedRabbits = 500; // Maximum number of rabbits we'll ever create for the animation to avoid destroying someone's mobile browser
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
    "They're could hold a carrot convention.",
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
    if (tokensMade < 3) {
        $('#flavor-text').text(fewRabbits[Math.floor(Math.random() * fewRabbits.length)]);
    } else if (tokensMade < 15) {
        $('#flavor-text').text(someRabbits[Math.floor(Math.random() * someRabbits.length)]);
    } else {
        $('#flavor-text').text(manyRabbits[Math.floor(Math.random() * manyRabbits.length)]);
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
    });
    if(tokensMade < maxAnimatedRabbits) {
    	queueRabbitAnimation(tokensMade);
    } else {
	queueRabbitAnimation(maxAnimatedRabbits);
    }
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
	const dropInterval = animationTime / numberRabbits;
	
	// Generate x value "rows" for dropping rabbits
	rows = generateRows(containerWidth, numberRabbits, rows);
	
	// This variable is to track how many rabbits have been dropped. I'm not sure if this is actually necessary, so we'll come back and review this later.
	let rabbitsDropped = 0;
	
	// This variable tracks the current row for the generated x position rows
	let currentRowIndex = -1;
	
	// Tracks available x positions for the current row
	let availableXPositions = [];
	
	// Interval to track gravity for each rabbit across the full animation runtime. 
	let gravityTicker = setInterval(function() {

		function allRabbitsGrounded(rabbits) {
			// First assume all rabbits are grounded
			let allGrounded = true;
			
			for (let i = 0; i < rabbits.length; i++) {
				if (!rabbits[i].data('grounded')) { // If even one is NOT grounded
				  allGrounded = false; // Set the flag to false
				  break; // No need to continue checking
				}
			}
			return allGrounded;
		}
		
		// Check if all rabbits are grounded. If so, clear the interval
		if (allRabbitsGrounded(rabbits)) {
			clearInterval(gravityTicker);
		}
		
		// For each rabbit that currently exists (stored in our rabbits array)
		for (let i = 0; i < rabbits.length; i++) {
			// Defining the rabbit we want to currently handle, getting the DOM *reference* from the rabbits array
			const rabbit = rabbits[i];
			
			// Get the height of the rabbit DOM element for use in collision calculations
			const rabbitHeight = rabbit.height();
			
			// "continue" is new syntax to me, but I'm assuming this means if the rabbit we grabbed is grounded, we don't need to do any gravity calculations on it and we can skip to the next iteration in our for loop. Neat!
			if (rabbit.data('grounded')) continue;
			
			// Get existing rabbit yPos and our gravity amount
			let yPos = rabbit.data('yPos');
			let xPos = rabbit.data('xPos');
			let movement = gravityMovement;
			
			// Get a collisionY value by checking if this rabbit's intended movement would collide with a grounded rabbit's "hitbox"
			const collisionY =  assessCollision(rabbit, movement, rabbits);
			
			// This if statement checks if the rabbit's intended movement would cause it to collide with another rabbit first. This is because a rabbit collision should be "closer" to the rabbit's current position than the ground would be, if such a collision exists. If we were to check for a ground collision first, we could potentially miss that the current rabbit was supposed to collide with another rabbit
			if (collisionY !== false) {
				// Set our rabbit's yPos to the collision amount returned from the assessCollision function
				yPos = collisionY;
				// Updates rabbit data to signify that it is grounded and no longer falling
				rabbit.data('grounded', true);
                rabbit.data('falling', false);
				
				// TODO add bounce animation
				rabbit.attr('animation','bouncing');
				const animationTimeout = setTimeout(function(){
					rabbit.attr('animation','grounded');
				}, 500);
				
			// Next we check if the rabbit's intended movement would cause it to collide with the "ground" of the container
			} else if (yPos + movement >= containerHeight - rabbitHeight + heightBuffer/3) {
				// If it would collide with the ground, set the yPos of the rabbit to the height of the container minus the rabbit's height so it lands evenly on the ground
				yPos = containerHeight - rabbitHeight + heightBuffer/3;
				// Updates rabbit data to signify that it is grounded and no longer falling
				rabbit.data('grounded', true);
                rabbit.data('falling', false);
				
				// TODO add bounce animation
				rabbit.attr('animation','bouncing');
				const animationTimeout = setTimeout(function(){
					rabbit.attr('animation','grounded');
				}, 300);
				
			// If neither of the above cases happen, the rabbit can continue falling, so we add the intended movement to the rabbit's yPos
			} else {
				yPos += movement;
			}
			
			// After determining the new yPos through the if statement above, we can assign the new yPos to the rabbit's data, and also update the css "top" value on the DOM element
			rabbit.data('yPos', yPos);
			rabbit.css({'top': yPos, 'left': xPos});
		}
	}, tickRate); // tickRate was defined as a global constant at the start of the code
	
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
		xPos -= widthBuffer;
		
		// Creates a rabbit div element with an ID# for which rabbit it is, and adds some attributes to handle our animation states. I have a hunch that we don't need the xPos/yPos parts anymore though. TODO
		// May also refactor my CSS logic to use one attribute for all animation states since my code shouldn't be referencing these anymore
		const rabbit = $(`<div class="rabbit" id="rabbit${rabbitsDropped}" animation="falling" style="top:${-rabbitHeight}px;left:${xPos}px"></div>`);
		
		// Adds the created rabbit to the container in the DOM
		container.prepend(rabbit);
		
		// Adds some data attributes we'll use to track the rabbit's collision, positioning, and movement
		rabbit.data('xPos', xPos); // TODO: want to make the xPos random (or at least seem random) upon initializing
		rabbit.data('yPos', 0);
		rabbit.data('yPos', -rabbit.height()); // Adjusting the yPos so that the rabbit starts off-screen.
		rabbit.data('falling', true); // Rabbits start in a falling state
		rabbit.data('grounded', false);  // Rabbits start not grounded by definition
		
		// Add this newly created rabbit to our rabbits array
		rabbits.push(rabbit);
		
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

// Function to detemine if a provided rabbit (rabbit) and its intended movement (movement) will cause it to collide with any grounded rabbits in the provided array (allRabbits), and returns the point of collision that is closest, if any exist
function assessCollision(rabbit, movement, allRabbits) {
	// Defining the "top" of the rabbit's "hitbox" as yPos, adding the rabbit's height calculates the "bottom" of said hitbox
	// Defining "left" of the rabbit's "hitbox" as xPos, adding the rabbit's width calculates the "right" of said hitbox
	const yMin = rabbit.data('yPos');
	const yMax = rabbit.data('yPos') + rabbitHeight;
	const xMin = rabbit.data('xPos');
	const xMax = rabbit.data('xPos') + rabbitWidth;
	
	// Create a variable for containing the closest point of collision, if any are found. If not, this will stay "false"
	let collisionPoint = false;
	
	// For each rabbit in our passed in rabbits array
	for (let i = 0; i < allRabbits.length; i++) {
		// Reference current iteration's rabbit
		const otherRabbit =  allRabbits[i];
		
		// If the current iteration's rabbit is the same as the rabbit we're checking the collision of, or if the current iteration's rabbit is grounded, we ignore it and continue to the next iteration as there is no logic to do here
		if (otherRabbit === rabbit || !otherRabbit.data('grounded')) continue;
		
		// Getting the other rabbit's yPos. I don't think we need the other rabbit's max as our rabbit should stop if it would pass the top of the rabbit it's about to collide with
		otherYPos = otherRabbit.data('yPos');
		
		// Getting the left and right value for the other rabbit
		otherXMin = otherRabbit.data('xPos');
		otherXMax = otherRabbit.data('xPos') + rabbitWidth;
		
		// If the rabbit is out of horizontal range of the other rabbit, accounting for some buffer spacing, we can ignore it and continue to the next iteration
		if (xMin > otherXMax - widthBuffer || xMax < otherXMin + widthBuffer) continue;
		
		// If the rabbit is further down than the other rabbit, accounting for some buffer spacing, we can ignore it and continue to the next iteration
		if (yMax >= otherYPos + heightBuffer) continue;
		
		// If the bottom of the rabbit after moving would equal or pass the top of the other rabbit and the buffer spacing
		if (yMax + movement >= otherYPos + heightBuffer) {
			// If the new collision pointis closer (less than) any prior identified collision points, or if this is the first collision point we've identified, set the collisionPoint variable to this value
			if (otherYPos - rabbitHeight + heightBuffer < collisionPoint || !collisionPoint) {
				collisionPoint = otherYPos - rabbitHeight + heightBuffer;
			// Otherwise, continue iterating
			} else {
				continue;
			}
		// Otherwise, continue iterating
		} else {
			continue;
		}
	}
	
	// Return collisionPoint after all rabbits have been checked
	return collisionPoint;
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
			
			// Initialize a variable for a leading space
            let leadingSpace = 0;
			
			// If the current row is empty, we'll add a randomized leading space between -1*rabbit width buffer and +1*rabbit width buffer
            if (currentRow.length === 0) {
                leadingSpace = Math.floor(Math.random() * widthBuffer*2) - widthBuffer*2;
            }

			// Initialize a variable for storing the x position of the rabbit we're currently calculating for
			let rabbitX;
			
			// Add the row's sum so far and the leading space calculated above
			rabbitX = rowWidth + leadingSpace;
			
			// Add the calculated x value to the row array
            currentRow.push(rabbitX);
			
			// Update the row sum to include the calculated space and the added rabbit's width
            rowWidth += leadingSpace + rabbitWidth;

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
