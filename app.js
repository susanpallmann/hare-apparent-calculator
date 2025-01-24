// V0.8.8

// Global constants
const gravitySpeed = 1.2;
const totalAnimationTime = 1200; // Time in ms in which all created rabbits will be created and dropped - higher number = longer animation duration. We may want to reassess if this should remain a constant if it turns out to be awkward when the number of rabbits greatly differs.
const rabbitWidth = 156; // Width of rabbits (must match CSS)
const rabbitHeight = 114; // Height of rabbits (must match CSS)
const heightBuffer = rabbitHeight * 0.46; // The amount 2 rabbits should overlap on y axis
const widthBuffer = rabbitWidth * 0.49; // The max 2 rabbits can overlap on x axis

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
		
		let calculator = $('#calculator');
		let answer = $('#answer');
		transitionSandwich (calculator, answer, function() {
			return new Promise(resolve => {
				let flavorText = chooseFlavorText(tokensMade);
				$('.flavor-text').text(flavorText);
				$('.rabbit').fadeOut(300, function () {
					$('#rabbit-container').empty();
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
					console.log('this is running 1');
					resolve();
				});
			});
		},function() {
			console.log('this is running 2');
			//dynamic maxanimated rabbits??
			//maximum number of possible rows given container Height
			let maxRowsPossible = Math.round(containerHeight / (rabbitHeight - (rabbitHeight-heightBuffer)));
			console.log(maxRowsPossible);
			//maximum number of possible rabbits in a row
			let maxRabbitsPerRow = Math.round(containerWidth / (rabbitWidth - widthBuffer));
			console.log(maxRabbitsPerRow);
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
		let answer = $('#answer');
		let calculator = $('#calculator');
		transitionSandwich (answer, calculator, function() {
			return new Promise(resolve => {
				$('.rabbit').fadeOut(300, function () {
					$('#rabbit-container').empty();
					$('#huge-answer-number').text(0);
					resolve();
				});
			});
		});
	});
});

// Given two elements, function fades one element out, executes the first callback, and then fades the other element in, and then executes the second callback
// Used for transitioning between layouts, and is objectively my best function name to date
function transitionSandwich (elementLeaving, elementEntering, callback1, callback2) {
	// Ensure provided elements are jQuery objects
	const $elementLeaving = $(elementLeaving);
	const $elementEntering = $(elementEntering);
	
	// Check if both elements exist in the DOM
	if ($elementLeaving.length && $elementEntering.length) {
		// Fade out first element
		$elementLeaving.fadeOut(300, function () {
			// Create promise to manage callback's asynchronous operations
			const callback1Promise = new Promise((resolve) => {
				// Check if first callback function was provided
				if (typeof callback1 === 'function') {
					
					// Call revole() when callback's asynchronous operations are complete
					const callbackResult1 = callback1(); // Execute callback and save the result
					
					// Check if callbackResult is a Promise
                    if (callbackResult1 && typeof callbackResult1.then === 'function') {
                        // If it is, wait for it to resolve
                        callbackResult1.then(resolve);
                    } else {
                        // If not, resolve immediately
                        resolve();
                    }
					
				} else {
					// Resolve immediately if there is no callback provided
					resolve();
				}
			});
			// After the callback's promise resolves, fade in the second element
			callback1Promise.then(() => {
				// Fade second element in, then execute the second callback
				$elementEntering.fadeIn(300, function() {
					// Check if second callback function was provided
					if (typeof callback2 === 'function') {
						// Execute callback
						callback2();
					}
				});
			});
			
        });
		
	// If one or both elements don't exist, log an error
	} else {
		console.log('Could not locate one or both elements in the DOM.');
	}
}

// Given a number of rabbits being created (rabbitsQuantity), chooses and returns appropriate flavor text
function chooseFlavorText (rabbitsQuantity) {
	
	// Flavor text options
	const textOptions = [
		// No rabbit tokens created
		{ range: [0, 0], texts: [
			"Not a single bunny in sight. It's unsettling",
			"Absolutely zero fluff. What a tragedy.",
			"No rabbits here. Maybe try checking under a hat?",
			"The field is suspiciously free of rabbits."
			]
		},
		// One rabbit token created
		{ range: [1, 1], texts: [
			"A single harbinger of fluff.",
			"A lone rabbit, bravely contemplating life.",
			"One tiny nose, twitching with curiosity.",
			"Perhaps the first of many?"
			]
		},
		// A few rabbit tokens created
		{ range: [2, 9], texts: [
			"A modest gathering of fluff.",
			"Just a few bunnies, minding their own business... for now.",
			"Sparse, but stylish; like a minimalist rabbit exhibit.",
			"The rabbit equivalent of a quiet afternoon.",
			"Not enough rabbits to swarm, but definitely enough to be plotting something.",
			"Just a smattering of cottontails."
			]
		},
		// Some rabbit tokens created
		{ range: [10, 29], texts: [
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
			]
		},
		// Many rabbit tokens created
		{ range: [30, Infinity], texts: [
			"It's a bunny-pocalypse!",
			"Carrots are a distant memory now. Panic is setting in.",
			"The ground is moving... it's all rabbits.",
			"They've formed a single, giant, pulsating mass of fur. It demands tribute.",
			"They've achieved critical fluff mass.",
			"The very air vibrates with the sound of chewing.",
			"The fuzzy hoard is large enough to have its own gravitational pull.",
			"The fluff has consumed everything. Resistance is futile.",
			"The earth is now 90% rabbit"
			]
		}
	];
	
	// If rabbitsQuantity is within the range for a given list of flavor texts, one is randomly chosen from the list and returned
	for (const option of textOptions) {
		if (rabbitsQuantity >= option.range[0] && rabbitsQuantity <= option.range[1]) {
			return option.texts[Math.floor(Math.random() * option.texts.length)];
		}
	}
	
	// Error for case where negative number is passed into this function
	return 'Invalid number of rabbits.';
}


function queueRabbitAnimation (numberRabbits) {
	console.log('this is running 3');
	// Declaring some more constants here, as these require the scene to have loaded to be retrieved
	// We first are grabbing the container DOM element and then getting the height and width from this element for use in later calculations
	const container = $('#rabbit-container');
	const containerHeight = container.height();
	console.log(container.height());
	const containerWidth = container.width();

	// Array to store randomized x positions for rabbit animation
	let rows = []; 
	
	// Now a constant calculated by dividing the animation time by our number of rabbits to drop so that the drops are equally spaced. We may want to add some additional math to account for the time it takes for a rabbit to drop as otherwise technically the animation time will be exceeded by at most the length of time it takes for a rabbit to fall completely.
	const dropInterval = totalAnimationTime/numberRabbits;
	
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
		console.log('dropRabbit ran');
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
		const startPoint = destination-containerHeight; 
		
		// Creates a rabbit div element with an ID# for which rabbit it is, and adds some attributes to handle our animation states. I have a hunch that we don't need the xPos/yPos parts anymore though. TODO
		// May also refactor my CSS logic to use one attribute for all animation states since my code shouldn't be referencing these anymore
		const rabbit = $(`<div class="rabbit" id="rabbit${rabbitsDropped}" animation="falling" style="top: ${startPoint}px; left: ${xPos}px; transition: top ${gravitySpeed}s linear;"></div>`);
		
		// Adds some data attributes we'll use to track the rabbit's collision, positioning, and movement
		rabbit.data('xPos', xPos); // TODO: want to make the xPos random (or at least seem random) upon initializing
		rabbit.data('yPos', 0);
		rabbit.data('yPos', startPoint); // Adjusting the yPos so that the rabbit starts off-screen.
		rabbit.data('falling', true); // Rabbits start in a falling state
		rabbit.data('grounded', false);  // Rabbits start not grounded by definition
		rabbit.data('row', currentRowIndex); // Track row current rabbit belongs to
		
		const rabbitPromise = new Promise((resolve, reject) => {
			container.prepend(rabbit);
			
			// Magic variable that breaks everything if removed :')
			let magicOffset = rabbit.offset().top;
			
			// Resolve the promise when the element is added successfully
			resolve(rabbit);
		});
		
		rabbitPromise.then((rabbit) => {
			rabbit.data('yPos', destination);
			
			
			rabbit.css({
				'top': destination + 'px',
				'left': xPos + 'px',
				'transition': `top ${gravitySpeed}s linear`,
			});
			
			const animTimeout1 = setTimeout(function () {
				rabbit.data('falling', false);
				rabbit.attr('animation', 'bouncing');
				const animTimeout1 = setTimeout(function () {
					rabbit.attr('animation', 'grounded');
					rabbit.data('grounded', true);
				}, 300);
			}, gravitySpeed * 1000);
			// Increase the number of rabbits dropped
			rabbitsDropped++;
		});
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
