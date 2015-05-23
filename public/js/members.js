app.members = {
	// lookup a member by their id
	// and return full object
	lookup: function(id){
		var result = $.grep(app.memArr, function(e){ 
			return e._id === id;
		});

		if(result.length > 1)
			console.log('more than one during look up');

		return result[0];
	},

	// toggle merge button, on second click
	// confirm merging of members
	mergeToggle: function(id) {
		var currElement = $('[dashID="' + id + '"]');
		currElement.css('border-color', app.accentColor);

		app.mergeArr.push(id);

		if(app.mergeArr.length == 2) {
			// deselect if clicked twice
			if (app.mergeArr[0] == app.mergeArr[1]){
				currElement.removeAttr('style');
				app.mergeArr = [];
			} else {
				var first = app.members.lookup(app.mergeArr[0]);
				var second = app.members.lookup(app.mergeArr[1]);
				// prompt to confrim merge
				if(confirm('Merge ' + first.company + ' into ' + second.company +'?'))
					app.models.mergeMembers(first._id, second._id);

				for(var i = 0; i < app.mergeArr.length; i++){
					var el = $('[dashID="' + app.mergeArr[i] + '"]');
					el.removeAttr('style');
				}

				app.mergeArr = [];
			}
		}
	},

	// change month by one and re-sort
	sortByDir: function(dir){
		var dateObj = {};
		var month = $('#sorterMonth').text();
		var year = $('#sorterYear').text();
		dateObj.month = app.helpers.monthToInt(month);
		dateObj.year = parseInt(year);

		if(dir == 'left'){
			var newDate = app.helpers.getPrevMonth(dateObj);
		} else if (dir == 'right') {
			var newDate = app.helpers.getNextMonth(dateObj);
		}

		// replace text
		$('#sorterMonth').text(app.helpers.intToMonth(newDate.month));
		$('#sorterYear').text(newDate.year);

		// re-sort list
		app.dateArr = [];
		var sortArr = app.members.sortByMonth(app.memArr, newDate);
		app.members.cycle(sortArr);	
	},

	// uses global arrarys app.memArr & app.dateArr
	// use to refresh or resort full list of members
	cycle: function(optArr){
		// html content to fill members div
		var content = '';
		var dateCounter = 0;
		// set to true if the rest of the members don't match up with the date
		var nodata = false;
		var arr = optArr || app.memArr;

		$.each(arr, function(){
			// seperates the sorted months
			if (this.company == 'nextdate') {
				dateCounter++;
				content += '<div class="line">';
				content += app.helpers.intToFullMonth(app.dateArr[dateCounter].month);
				content += '</div>';
			} else if (this.company == 'nodata'){
				nodata = true;
			} else {
				content += app.render.printMember(this, app.dateArr[dateCounter], nodata);
			}
		});		

		var count = arr.length - 1;
		app.helpers.countUp('#memTot', count);
		// fill members div with printed content
		$('#members').html(content);

		// add event listeners
		var cnt = 0;
		$('.mem').each(function() {
			var comp = this.getElementsByClassName('comp');
			var compStr = $(comp).text();
			var id = $(this).attr('dashID');
			if(compStr.length - 1 > 16) {
				$(comp).attr('title', compStr);
				var compStr = compStr.substring(0, 16) + '...';
				$(comp).text(compStr);
			}

			this.addEventListener('mouseover', function(){
				//app.render.showEmails(this);
			});
			this.addEventListener('mouseout', function(){
				//app.render.hideEmails(this);
			});

			this.addEventListener('click', function(ev) {
				var target = ev.target;
				if($(target).attr('class') == 'emailcopy') {
					console.log('clicked email');
				} else 
					app.render.toggleHeight(this);
			});

			// copy the emails to clipboard on click
			var zeroClip = this.getElementsByClassName('emailcopy');
			for(var i = 0; i < zeroClip.length; i++){
				var client = new ZeroClipboard(zeroClip[i]);
				console.log(client);
				client.on( "ready", function( readyEvent ) {
					console.log('read');
				  client.on( "aftercopy", function( event ) {
				    // `this` === `client`
				    // `event.target` === the element that was clicked
				    event.target.style.display = "none";
				    console.log("Copied text to clipboard: " + event.data["text/plain"] );
				  } );
				} );
			}

			var count = cnt;
			var merge = this.getElementsByClassName('mergeBtn');
			merge[0].addEventListener('click', function(e){
				e.stopPropagation();
				app.members.mergeToggle(id);
			});

			var seeReqs = this.getElementsByClassName('seeReqs');
			seeReqs[0].addEventListener('click', function(e){
				e.stopPropagation();
				app.soloRequest.show = true;
				app.requestCurrent = 0;
				app.render.requestsTable(app.requestCurrent, id);

				$('html, body').animate({
			    	scrollTop: $(".requestsCont").offset().top
			    }, 2000);
			});

			cnt++;
		});

		//app.render.setTidbitsTranslate();
		// keep at bottom
		app.render.updateProgress();
	},


	// recursive function to sort the members
	sortByMonth: function(array, testDate, opt){
		var COUNTER = 0;
		var recent = [];
		var old = [];
		var newArr = [];

		if(opt === 'exit'){
			$.each(array, function(){
				newArr.push(this);
			});
		} else {
			$.each(array, function(){
				var hasMonth = false;
				// ignore blanks when the app.memArr is run through
				if(this.company != 'nodata' && this.company != 'nextdate'){
					if(this.years.hasOwnProperty(testDate.year)) {
						if(this.years[testDate.year].hasOwnProperty(testDate.month)){
							hasMonth = true;
							recent.push(this);
						} 
					} 

					if(!hasMonth) {
						old.push(this);
					}
				}
			});

			newArr = quickSort(recent, 0, recent.length - 1, testDate);
			app.dateArr.push(testDate);
		}
		

		if(old.length){
			var equal = false;

			// to stop recursiveness when nothing else is being
			// sorted out of the leftover array
			if(opt && old.length == opt.length){
				equal = true;
				for(var i = 0; i < old.length; i++){
					if(old[i].company != opt[i].company){
						equal = false;
					}
				}
			}

			// make sure old is not being passed around without finding any matches
			if(!equal){
				COUNTER++;
				
				var nextArr = app.members.sortByMonth(old, app.helpers.getPrevMonth(testDate), array);
				// to be able to test for breaks when printing
				newArr.push({
					company: 'nextdate'
				});
				newArr = newArr.concat(nextArr);

			} else {
				var nextArr = app.members.sortByMonth(old, app.helpers.getPrevMonth(testDate), 'exit');
				// push flag
				newArr.push({
					company: 'nodata'
				});
				newArr = newArr.concat(nextArr);
			}
		}
		

		return newArr;




		/// sortByMonth Helper Functions ///

		// called by sortByMonth
		// modified quicksort to sort based on given date
		function quickSort(members, l, r, dateObj) {
			var index;
			if(members.length > 1) {

				index = partition(members, l, r, dateObj);

				if(l < index - 1) {
					quickSort(members, l, index - 1, dateObj)
				}

				if(index < r){
					quickSort(members, index, r, dateObj);
				}
			}

			return members;
		}

		// called by quickSort
		// tests values around pivot point and swaps them
		function partition(members, l, r, dateObj) {
			var dte = dateObj;

			var pivot = members[Math.floor((l + r) / 2)];

			while (l <= r){
				while (members[l].years[dte.year][dte.month] > pivot.years[dte.year][dte.month]) {
					l++;
				}

				while (members[r].years[dte.year][dte.month] < pivot.years[dte.year][dte.month]) {
					r--;
				}

				if (l <= r) {
					swap(members, l, r);
					l++;
					r--;
				}
			}

			return l; 
		}

		// called by partition
		function swap(members, l, r) {
			var temp = members[l];
			members[l] = members[r];
			members[r] = temp;
		}

	}


}