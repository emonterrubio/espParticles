# SETUP
document.body.style.cursor = "auto"
Framer.Defaults.Layer.force2d = true

# Reload page when screen is resized
window.addEventListener "resize", (event) ->
	location.reload()

# Project setup
{Integrator, Euler, ImprovedEuler, Verlet, Particle, Physics, Vector, Spring, Behaviour, Attraction, Collision, ConstantForce, EdgeBounce, EdgeWrap, Wander, Gravity} = require 'coffeePhysics'

# Colours

blue = new Color("rgba(0,150,212,1)")
black = new Color("rgba(0,0,0,1)")
lightGrey = new Color("rgba(239,239,239,1)")

colours = [blue, black]
colourCycler = Utils.cycle(colours)

background = new BackgroundLayer
	backgroundColor: "white"

# COMPONENTS
scroll = new ScrollComponent 
	width: Screen.width
	height: Screen.height
	scrollHorizontal: false
	
scroll.mouseWheelEnabled = true

ESP_Sandbox = new Layer
	parent: scroll.content
	width: 1225, height: 1260
	image: "images/ESP-Sandbox.svg"
	
casing = new Layer
	parent: ESP_Sandbox
	backgroundColor: null
	width: 98, height: 873
	x: 39, y: 230
# 	image: "images/casing.svg"

pump = new Layer
	parent: casing
	x: 18, y: 0
	width: 64, height: 797
	image: "images/pump.svg"
	
motor = new Layer
	parent: pump
	backgroundColor: null
	x: 12, y: 565
	opacity: 0
motor.html = """
<svg width="40px" height="231px" viewBox="0 0 40 231">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="esp" transform="translate(-200.000000, -705.000000)" fill="#D0021B">
            <path d="M231.627508,725.174145 C233.07728,726.232886 235.878126,728.41328 235.617339,729.736572 C235.920605,730.875432 235.778113,739.063066 235.617339,739.761545 C235.325522,741.106119 231.997509,743.592694 231.760381,743.658294 C231.628643,746.073665 231.591541,749.438623 231.846414,749.55423 C235.147016,751.051339 238.900955,753.49462 239.519465,757.210612 C239.06134,795.785573 239.66615,871.688564 239.296855,914.379113 C239.264593,918.108635 235.878689,919.44217 235.657667,919.571731 C235.436645,919.701292 235.839411,919.787888 235.525929,922.745804 C235.212447,925.703719 231.614125,926.381766 231.425928,927.355012 C231.237731,928.328258 231.350637,929.212273 231.273758,930.15054 C230.923447,934.425876 223.202267,935.721165 219.562541,935.731919 C215.922816,935.742673 208.75682,933.984915 208.162656,930.273137 C207.568492,926.561359 208.450866,925.876323 208.072322,926.7673 C207.693778,927.658277 203.698629,924.194919 203.672281,920.050288 C203.817462,920.0476 199.953244,919.01198 200.228549,914.347389 C200.238883,914.172306 200.123159,761.590758 200.228549,756.603006 C200.39954,752.741208 208.483199,747.834407 207.986289,749.544551 C207.896211,749.85456 208.211588,743.721205 207.986289,743.690556 C206.934002,743.547405 204.524544,741.441336 204.095455,739.456129 C203.915862,739.082962 204.101714,731.822563 204.073409,730.260297 C204.051364,729.04347 206.159705,726.566263 207.941435,725.659155 C207.990385,725.634234 207.990385,720.947749 207.941435,711.599701 C207.941435,708.360712 213.195012,705.731968 219.676901,705.731968 C226.158789,705.731968 231.627508,708.360712 231.627508,711.599701 L231.627508,725.174145 Z" id="Stroke-91"></path>
        </g>
    </g>
</svg>
"""

# particles
Utils.interval 0.1, ->
	ball = new Layer
		parent: pump
		borderRadius: 10
		backgroundColor: colourCycler()
		size: Utils.randomNumber(4, 10)
		opacity: Utils.randomNumber(0.6, 1)
		x: Utils.randomNumber(0, pump.width)
	
	# animate ball to fall down
	ball.animate
		y: pump.height
		options:
			curve: "linear"
			time: Utils.randomNumber(3, 6)
	
	# destroy ball after animation ends
	ball.onAnimationEnd ->
		this.destroy()
		
# PARTICLE ENGINE
pullLayer = new Layer
	parent: casing
	visible: false
	borderRadius: 100
	size: 50
	y: 0, x: 25

# Create a physics instance which uses the Verlet integration method
physics = new Physics()
physics.integrator = new Verlet()

# Allow particle collisions to make things interesting
collision = new Collision()

# Design some behaviours for particles
# avoid = new Attraction()
pullToCenter = new Attraction()
pullToCenter.target.x = pullLayer.x
pullToCenter.target.y = pullLayer.y
pullToCenter.strength = 100

# avoid.setRadius( 100 )
# avoid.strength = -1000

min = new Vector(0,0)
max = new Vector(casing.width, casing.height)
edges = new EdgeBounce(min, max)
# gravity = new Gravity()
wander = new Wander(.5,700,1)

ballCount = 0
balls = []
	
animateBalls = (ballCount) ->
	# Render the particles
	for i in [0...ballCount]
		# Create a particle
		particle = new Particle(Utils.randomNumber(.1,.5))
		position = new Vector(Utils.randomNumber( 0, casing.width ), Utils.randomNumber( 0, casing.height ))
		particle.setRadius( particle.mass * 10 )
		particle.moveTo( position )
	
		# Apply behaviours to the particle
		particle.behaviours.push( wander, edges, collision )
			
		# Make it collidable
		collision.pool.push( particle )
	
		# Add to the simulation
		physics.particles.push( particle )
		
		# Create a layer to show the particle on the screen
		ball = new Layer
			parent: casing
			x: particle.pos.x - particle.radius
			y: particle.pos.y - particle.radius
			size: particle.radius * 1.5
			borderRadius: particle.radius
			backgroundColor: colourCycler()
		
		# Add the particle instance to the layer
		ball.particle = particle
			
		balls.push(ball)
	
		# Set everything in motion
		################################################################################
	
		frameRate = 1 / 60
		
		Utils.interval frameRate, ->			
			# Step the simulation
			physics.step()
			
			# Update the position of the balls
			for ball, i in balls
				ball.x = ball.particle.pos.x - ball.particle.radius
				ball.y = ball.particle.pos.y - ball.particle.radius
		
animateBalls(50)
		
slider1 = new SliderComponent
	parent: ESP_Sandbox
	x: 244, y: 702
	width: 4, height: 316
	min: 100, max: 0
	value: 25
	knobSize: 24
slider1.knob.borderRadius = 5
slider1.knob.borderColor = "#2E546D"
slider1.knob.borderWidth = 1
slider1.knob.backgroundColor = lightGrey
slider1.knob.image = "images/knob.svg"

number1 = new TextLayer
	parent: slider1
	width: 45
	x: -34, y: 354
	text: slider1.value
	fontSize: 13
	color: black

# Listen for slider value updates
slider1.knob.onDrag ->
	scroll.scrollVertical = false
	motor.opacity = slider1.value / 200
	number1.text = Math.round(slider1.value)
	number2.text = Math.round(slider2.value)
	number3.text = Math.round(slider3.value)
	number4.text = Math.round(slider4.value)
	number5.text = Math.round(slider5.value)
	number6.text = Math.round(slider6.value)
	slider2.animate
		value: slider1.value / 2
		options:
			curve: "lineal"
			time: 0.1
	slider3.animate
		value: slider1.value / .6
		options:
			curve: "lineal"
			time: 0.1
	slider4.animate
		value: slider1.value / .5
		options:
			curve: "lineal"
			time: 0.1
	slider5.animate
		value: slider1.value / 1.5
		options:
			curve: "lineal"
			time: 0.1
	slider6.animate
		value: slider1.value / 1.2
		options:
			curve: "lineal"
			time: 0.1# Create text layer

	
slider2 = new SliderComponent
	parent: ESP_Sandbox
	x: 386, y: 702
	width: 4, height: 316
	min: 100, max: 0
	value: 12
	knobSize: 24
slider2.knob.borderRadius = 5
slider2.knob.borderColor = "#2E546D"
slider2.knob.borderWidth = 1
slider2.knob.backgroundColor = "#fff"
slider2.knob.image = "images/knob.svg"

number2 = new TextLayer
	parent: slider2
	width: 45
	x: -23, y: 354
	text: slider2.value
	fontSize: 13
	color: black
	
slider2.knob.onDrag ->
	scroll.scrollVertical = false
	number2.text = Math.round(slider2.value)

slider3 = new SliderComponent
	parent: ESP_Sandbox
	x: 533, y: 702
	width: 4, height: 316
	min: 90, max: 0
	value: 54.5
	knobSize: 10
	backgroundColor: null
slider3.fill.backgroundColor = null
slider3.knob.height = 2
slider3.knob.borderRadius = 0
slider3.knob.borderColor = null
slider3.knob.borderWidth = 0
slider3.knob.backgroundColor = "#505050"

slider3Tip = new Layer
	parent: slider3.knob
	width: 54, height: 26
	x: -54, y: -10
	backgroundColor: "#505050"
	borderRadius: 4

number3 = new TextLayer
	parent: slider3Tip
	x: 10, y: 5
	text: slider3.value
	fontSize: 13
	color: "#fff"
	
slider4 = new SliderComponent
	parent: ESP_Sandbox
	x: 680, y: 702
	width: 4, height: 316
	min: 100, max: 0
	value: 19
	knobSize: 10
	backgroundColor: null
slider4.fill.backgroundColor = null
slider4.knob.height = 2
slider4.knob.borderRadius = 0
slider4.knob.borderColor = null
slider4.knob.borderWidth = 0
slider4.knob.backgroundColor = "#505050"

slider4Tip = new Layer
	parent: slider4.knob
	width: 54, height: 26
	x: -54, y: -10
	backgroundColor: "#505050"
	borderRadius: 4

number4 = new TextLayer
	parent: slider4Tip
	x: 10, y: 5
	width: 45
	text: slider4.value
	fontSize: 13
	color: "#fff"
	
slider5 = new SliderComponent
	parent: ESP_Sandbox
	x: 824, y: 702
	width: 4, height: 316
	min: 100, max: 0
	value: 18
	knobSize: 10
	backgroundColor: null
slider5.fill.backgroundColor = null
slider5.knob.height = 2
slider5.knob.borderRadius = 0
slider5.knob.borderColor = null
slider5.knob.borderWidth = 0
slider5.knob.backgroundColor = "#505050"

slider5Tip = new Layer
	parent: slider5.knob
	width: 54, height: 26
	x: -54, y: -10
	backgroundColor: "#505050"
	borderRadius: 4

number5 = new TextLayer
	parent: slider5Tip
	x: 10, y: 5
	width: 45
	text: slider5.value
	fontSize: 13
	color: "#fff"
	
slider6 = new SliderComponent
	parent: ESP_Sandbox
	x: 970, y: 702
	width: 4, height: 316
	min: 100, max: 0
	value: 29
	knobSize: 10
	backgroundColor: null
slider6.fill.backgroundColor = null
slider6.knob.height = 2
slider6.knob.borderRadius = 0
slider6.knob.borderColor = null
slider6.knob.borderWidth = 0
slider6.knob.backgroundColor = "#505050"

slider6Tip = new Layer
	parent: slider6.knob
	width: 54, height: 26
	x: -54, y: -10
	backgroundColor: "#505050"
	borderRadius: 4

number6 = new TextLayer
	parent: slider6Tip
	x: 10, y: 5
	text: slider6.value
	fontSize: 13
	color: "#fff"

sliderValue = 0
slider1.on Events.TouchEnd, ->
	# if slider is going UP - ADD balls to array
	if sliderValue < slider1.value
		# calculate how many new balls need to be added to equal slider value 
		ballsToAdd = Math.floor(slider1.value - balls.length)
		# add new balls to array
		animateBalls(ballsToAdd)
		
# 		print "UP - array length = " + balls.length
		
		# set sliderValue to current slider position
		sliderValue = slider1.value
		
	# if slider is going DOWN - REMOVE balls from array
	if sliderValue > slider1.value
		# calculate how many new balls need to be removed to equal slider value 
		ballsToRemove = Math.floor(balls.length - slider1.value)
 		# remove balls from array
		balls.splice(0, ballsToRemove)
		animateBalls(ballCount)
		
# 		print "ballsToRemove = " + ballsToRemove
# 		print "DOWN - array length = " + balls.length
		
		# set sliderValue to current slider position
		sliderValue = slider1.value