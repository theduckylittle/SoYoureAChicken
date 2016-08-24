/*
 * Copyright (c) 2016, Dan "Ducky" Little All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */



var CONF = {
	height: 600,
	width: 800,
	kernel : {
		w: 30,
		h: 40
	}
};

function rand_int(max) {
	return Math.floor(Math.random() * max);
}


var POINT_ID = 0;
function random_pt() {
	POINT_ID++;
	return {id: POINT_ID, x: rand_int(CONF.width - CONF.kernel.w), y: rand_int(CONF.height - CONF.kernel.h)};
}


function within(x, min, max) {
	return (min <= x && x <= max);
}

function intersects(r1, r2) {
	var x_overlap = (within(r1.x1, r2.x1, r2.x2) || within(r1.x2, r2.x1, r2.x2));
	var y_overlap = (within(r1.y1, r2.y1, r2.y2) || within(r1.y2, r2.y1, r2.y2));
	return (x_overlap && y_overlap);
}

function add_corn(kernels) {
	var positions = [];
	for(var i = 0; i < kernels; i++) {
		positions.push(random_pt());
	}

	d3.select('#field')
		.selectAll('.kernel')
		.data(positions, function(d) { return d.id; })
		.enter()
		.append('image')
			.attr('xlink:href', 'images/corn.svg')
			.attr('class', 'kernel')
			.attr('width', 20)
			.attr('height', 30)
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			});
}

/** Make the chicken cluck
 */
function cluck() {
	document.getElementById('cluck').play();
}


/** Convert an element into a handy javascript
 *  rectangle object.
 *
 *  @param elem The d3 selected element.
 *
 */
function elem_to_rect(elem) {
	var rect = {
		x1: parseInt(elem.attr('x')),
		y1: parseInt(elem.attr('y')),
		x2: parseInt(elem.attr('width')),
		y2: parseInt(elem.attr('height'))
	};

	rect.x2 += rect.x1;
	rect.y2 += rect.y1;

	return rect;

}

/** Clear out all the poop
 *
 */
function clear_poop() {
	d3.selectAll('.poop')
		.remove();
}

/** Check to see if we 'ate' any corn
 */
function eat_corn() {
	var chicken = d3.select('#chicken');
	var chicken_rect = elem_to_rect(chicken);

	d3.selectAll('.kernel')
		.each(function() {
			var rect = elem_to_rect(d3.select(this));
			if(intersects(rect, chicken_rect)) {
				cluck();
				//d3.select(this).remove();
				d3.select(this)
					.attr('xlink:href', 'images/poop.svg')
					.classed(['poop'], true);
			}
		});

}

/** Moves the chicken around, once the chicken has
 *  landed, the chicken tried to eat corn.
 */
function drive_chicken(evt) {
	var pt = d3.mouse(this);

	d3.select('#chicken')
		.transition()
		.attr('x', pt[0] - 30)
		.attr('y', pt[1] - 10)
		.on('end', function() {
			eat_corn();
		});
}


/** Setup the events for the chicken.
 *
 */
function init_click_drive() {
	d3.select('#playground')
		.on('click', drive_chicken);
}


function start_game() {
	init_click_drive();
	add_corn(10);
	d3.selectAll('.hide').classed(['hide'], false);
}


/** Have some text come in from the bottom
 *  and fly out the top.
 */
function fly_text(string, delay) {
	var svg = d3.select('svg');

	var text = svg.append('text')
		.attr('class', 'title-text')
		.attr('x', CONF.width / 2.0)
		.attr('y', CONF.height + 50)
		.attr('text-anchor', 'middle')
		.text(string);

	
	text.transition()
		.duration(1000)
		.delay(delay)
		.attr('y', CONF.height / 2.0)
		.transition()
		.delay(500)
		.duration(1000)
		.attr('y', -50)
		.remove();
}

/** Play a demo. Like games should have.
 */
function demo() {

	fly_text("I've got an idea...", 0);
	fly_text("For a Video Game...", 2500);
	fly_text("So...", 5000);
	fly_text("You're a...", 7500);

	var chicken_width = CONF.width / 3;
	return d3.select('#big-chicken')
		.attr('class', '')
		.attr('width', chicken_width)
		.attr('height', chicken_width * 3/2)
		.attr('y', CONF.height+10)
		.attr('x', chicken_width)
		.transition()
		.duration(1000)
		.delay(10000)
			.attr('y', CONF.height - chicken_width)
			.transition()
			.delay(500)
			.duration(1500)
			.attr('y', CONF.height + 10)
			.remove();
}

function start_chicken() {

	// TODO: Demo/Intro here

	CONF.width = window.innerWidth;
	CONF.height = window.innerHeight;

	d3.select('#playground')
		.attr('width', CONF.width)
		.attr('height', CONF.height);

	demo().on('end', function() {
		start_game();
	});
}
