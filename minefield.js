var buttons = [];
var mines = 10;
var max_mines = 10;
var dimensions = [10, 10];
var mouse_hover = false;
var dimentions_px = 0;
var check = [];
var dontcheck = [];
var game_over = false;
var timer_on = false;
var timer = 0;

/* Increment timer */
function increment_timer()
{
	if(!timer_on)
	{
		return false;
	}

	var m = 0;
	var s = 0;

	m = Math.floor(timer / 60);
	s = timer - (m * 60);

	if(s <= 9)
	{
		s = "0" + s;
	}

	$("#timer").html(m + ':' + s);
	timer = timer + 1;
	setTimeout("increment_timer()", 1000);

	return true;
}

/* Generate new board */
function new_game()
{
	var html = "";
	game_over = false;
	mines = max_mines;

	for (i=0; i<dimensions[0]; i++)
	{
		if(html != "")
		{
			html = html + '<div class="cl"></div>';
		}

		for (j=0; j<dimensions[1]; j++)
		{
			html = html + '<button name="m' + i + '-' + j + '"></button>';
		}
	}

	$("#mines").html(mines);
	$("#m").html(html);
	$("#m button").button().removeClass('clicked').click(mine_click).bind('contextmenu', mine_flag).bind('contextmenu' , function(){
		return false;
	});

	resize();

	timer = 0;
	timer_on = true;
	increment_timer();
}

/* Add flag to mine */
function mine_flag()
{
	var current = mine_id(this, true);
	if($('#m button[name="m' + current[0] + '-' + current[1] + '"] span').html() == '')
	{
		if(mines > 0 && !$(this).hasClass("clicked")) {
			mines = mines - 1;
			$('#m button[name="m' + current[0] + '-' + current[1] + '"]').addClass('flag');
			$('#m button[name="m' + current[0] + '-' + current[1] + '"] span').html('<img src="flag.png" alt="" />');
			$('#m button[name="m' + current[0] + '-' + current[1] + '"] img').css('width', dimentions_px + 'px').css('height', dimentions_px + 'px').css('margin-top', '-' + Math.floor(dimentions_px / 2) + 'px');
		}
	}
	else
	{
		mines = mines + 1;
		$('#m button[name="m' + current[0] + '-' + current[1] + '"]').removeClass('flag');
		$('#m button[name="m' + current[0] + '-' + current[1] + '"] span').html('');
	}
	$("#mines").html(mines);
}

/* Resize everything */
function resize()
{
	var height = $(window).height() - 60;
	var width = $(window).width() - 20;
	var size = 0;

	height = Math.floor(height / dimensions[0]);
	width = Math.floor(width / dimensions[1]);

	if(width < height)
	{
		size = width;
	}
	else
	{
		size = height;
	}

	if(size < 30)
	{
		size = 30;
	}

	dimentions_px = Math.floor(size / 1.5);

	$("#m button").css('width', size + 'px').css('height', size + 'px').css('font-size', Math.floor(size / 2.5) + 'px');
	$("#m button span").css('width', size + 'px');//.css('top', '-' + Math.floor(size / 3.5) + 'px');
	$("#m button img").css('width', dimentions_px + 'px').css('height', dimentions_px + 'px').css('margin-top', '-' + Math.floor(dimentions_px / 2) + 'px');
}

/* Open Menu */
function open_menu()
{
	$("#new").removeClass('ui-corner-left').addClass('ui-corner-tl');
	$("#select").removeClass('ui-corner-right').addClass('ui-corner-tr');
	$('#menu').slideDown('fast');
}

/* Close Menu */
function close_menu()
{
	$("#new").removeClass('ui-corner-tl').addClass('ui-corner-left');
	$("#select").removeClass('ui-corner-tr').addClass('ui-corner-right');
	$('#menu').slideUp('fast');
}

/* Mine Click */
function mine_click()
{
	var current = mine_id(this, true);

	// Need to generate mines on first click
	if(buttons.length == 0)
	{
		// Clean button states to zero
		buttons = [];
		for (i=0; i<dimensions[0]; i++)
		{
			buttons[i] = [];
			for (j=0; j<dimensions[1]; j++)
			{
				buttons[i][j] = 0;
			}
		}

		var mm = max_mines;

		// Generate random mines (but not where we clicked
		while(mm > 0)
		{
			var r1 = Math.floor(Math.random() * dimensions[0]);
			var r2 = Math.floor(Math.random() * dimensions[0]);

			if(buttons[r1][r2] == 0 && (r1 != current[0] || r2 != current[1]))
			{
				buttons[r1][r2] = -1;
				mm--;
			}
		}

		// Do the math for the rest of the squares
		for (i=0; i<dimensions[0]; i++)
		{
			for (j=0; j<dimensions[1]; j++)
			{
				if(buttons[i][j] != -1)
				{
					buttons[i][j]
					=	increment_mine(i - 1, j - 1)
					+ increment_mine(i - 1, j)
					+ increment_mine(i - 1, j + 1)
					+ increment_mine(i, j - 1)
					+ increment_mine(i, j)
					+ increment_mine(i, j + 1)
					+ increment_mine(i + 1, j - 1)
					+ increment_mine(i + 1, j)
					+ increment_mine(i + 1, j + 1);
				}
			}
		}
	}

	reveal(current[0], current[1]);

	while(check.length)
	{
		dontcheck.push(check[0]);
		var ch = check[0].split('-');
		reveal(ch[0], ch[1], true);
		check.splice(0, 1);
	}

	dontcheck = [];
	check = [];

	var num = $('#m button.clicked').length;
	mines = max_mines - $('#m button.flag').length;
	$("#mines").html(mines);

	// Winner!
	if((dimensions[0] * dimensions[1]) - num == max_mines)
	{
		$('#m button.flag span').html('');
		$('#m button').removeClass('flag');

		$('#m button:not(.clicked)').addClass('clicked');
		$('#m button:not(.clicked) span').html('<img src="mine.png" alt="" />');
		$('#m button img').css('width', dimentions_px + 'px').css('height', dimentions_px + 'px');

		for (i=0; i<dimensions[0]; i++)
		{
			for (j=0; j<dimensions[1]; j++)
			{
				check_space(i, j);
			}
		}

		while(check.length)
		{
			dontcheck.push(check[0]);
			var che = check[0].split('-');
			reveal(che[0], che[1]);
			check.splice(0, 1);
		}

		dontcheck = [];
		check = [];

		timer_on = false;
		game_over = true;
		$("#winner-dialog").dialog('open');
	}
}

/* Reveals given square */
function reveal(x, y, override)
{
	y = parseInt(y);
	x = parseInt(x);

	override = (typeof override == 'undefined') ? false : override;

	if(buttons[x] != undefined)
	{
		if(buttons[x][y] != undefined)
		{
			if($('#m button[name="m' + x + '-' + y + '"] span').html() == '' || override)
			{
				if($('#m button[name="m' + x + '-' + y + '"]').hasClass("flag"))
				{
					$('#m button[name="m' + x + '-' + y + '"]').removeClass('flag');
				}

				switch(buttons[x][y])
				{
					// Zero, reveal surroundxng squares too
					case 0:
						$('#m button[name="m' + x + '-' + y + '"] span').html('&nbsp;');
						check_space(x - 1, y - 1);
						check_space(x - 1, y);
						check_space(x - 1, y + 1);
						check_space(x, y - 1);
						check_space(x, y + 1);
						check_space(x + 1, y - 1);
						check_space(x + 1, y);
						check_space(x + 1, y + 1);
						break;

					// Game Over
					case -1:

						$('#m button[name="m' + x + '-' + y + '"] span').html('<img src="mine.png" alt="" />');
						$('#m button[name="m' + x + '-' + y + '"] img').css('width', dimentions_px + 'px').css('height', dimentions_px + 'px').css('margin-top', '-' + Math.floor(dimentions_px / 2) + 'px');

						if(!game_over)
						{
							timer_on = false;
							$('#m button.flag span').html('');
							$('#m button').removeClass('flag');

							for (i=0; i<dimensions[0]; i++)
							{
								for (j=0; j<dimensions[1]; j++)
								{
									game_over = true;
									check_space(i, j);
								}
							}
						}

						break;

					// Numbers
					default:
						$('#m button[name="m' + x + '-' + y + '"] span').html(buttons[x][y]);
						break;
				}

				$('#m button[name="m' + x + '-' + y + '"]').addClass('clicked');
			}
		}
	}
}

/* Adds to mine check array */
function check_space(x, y)
{
	if(buttons[x] == undefined)
	{
		return false;
	}

	if(buttons[x][y] == undefined)
	{
		return false;
	}

	if($.inArray(x + "-" + y, dontcheck) != -1)
	{
		return false;
	}

	if($.inArray(x + "-" + y, check) != -1)
	{
		return false;
	}

	check.push(x + "-" + y);
	return true;
}

/* Returns 1 when mine exists at point */
function increment_mine(x, y)
{
	if(buttons[x] !== undefined)
	{
		if(buttons[x][y] !== undefined)
		{
			if(buttons[x][y] == -1)
			{
				return 1;
			}
		}
	}
	return 0;
}

/* Mine ID */
function mine_id(e, r)
{
	r = (typeof r == 'undefined') ? false : r;
	var b = $(e).attr('name').substr(1).split('-');

	if(r == false)
	{
		return buttons[b[0]][b[1]];
	}
	else
	{
		return b;
	}
}

/* Reset Slider */
function reset_slider()
{
	$("#mine").slider("option", "max", $("#mine-col").slider("value") * $("#mine-row").slider("value") - 1);
	var avg = Math.floor(( $("#mine-col").slider("value") + $("#mine-row").slider("value")) / 2 );
	$("#mine").slider("value", avg);
	$("#mine-num").html(avg);
}

/* Init */
$(function(){

	// External links in new window
	$("a[rel=external]").attr('target', '_blank');

	// New Game Menu
	$("#new-dialog").dialog({
		resizable: false,
		autoOpen: false,
		width: 350,
		modal: true,
		buttons: {
			"Start New Game": function() {
				dimensions[1] = parseInt($("#mine-row").slider("value"));
				dimensions[0] = parseInt($("#mine-col").slider("value"));
				max_mines = parseInt($("#mine").slider("value"));
				buttons = [];
				new_game();
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});

	$("#mine-col").slider({
		value: 10,
		min: 5,
		max: 40,
		slide: function( event, ui ) {
			$("#mine-col-num").html(ui.value);
			reset_slider();
		}
	});
	$("#mine-col-num").html($("#mine-col").slider("value"));

	$("#mine-row").slider({
		value: 10,
		min: 5,
		max: 40,
		slide: function( event, ui ) {
			$("#mine-row-num").html(ui.value);
			reset_slider();
		}
	});
	$("#mine-row-num").html($("#mine-row").slider("value"));

	$("#mine").slider({
		value: 10,
		min: 1,
		max: 99,
		slide: function( event, ui ) {
			$("#mine-num").html(ui.value);
		}
	});
	$("#mine-num").html($("#mine").slider("value"));

	// Winner dialog
	$("#winner-dialog").dialog({
		resizable: false,
		autoOpen: false,
		width: 350,
		modal: true,
		buttons: {
			"Thanks!": function() {
				$(this).dialog("close");
			}
		}
	});

	// Winner dialog
	$("#about-dialog").dialog({
		resizable: false,
		autoOpen: false,
		width: 350,
		modal: true,
		buttons: {
			"Close": function() {
				$(this).dialog("close");
			}
		}
	});

	// Menu
	$("#new").button().click(function() {
		$("#new-dialog").dialog("open");
	});

	$("#select").button({
		text: false,
		icons: {
			primary: "ui-icon-triangle-1-s"
		}
	})
	.click(function() {
		if($('#menu').is(':visible') ) {
			close_menu();
		}
		else
		{
			open_menu();
		}
	});

	$("#header").buttonset();
	$("#menu button").button();

	$('#menu').hover(function(){
		mouse_hover = true;
	}, function(){
		mouse_hover = false;
	})
	.buttonset();

	$("#menu button").removeClass('ui-corner-all ui-corner-right ui-corner-left');
	$("#menu button:last").addClass('ui-corner-bottom');

	$('body').mouseup(function(){
		if(!mouse_hover)
		{
			close_menu();
		}
	});

	// Button
	$("#howtoplay, #scores").click(function(){
		alert('Coming soon!');
		close_menu();
	});
	$("#about").click(function(){
		$("#about-dialog").dialog('open');
		close_menu();
	})

	// Start Game
	new_game();
	$(window).resize(resize);
	$("#loading").hide();
	$("#header").show();
});