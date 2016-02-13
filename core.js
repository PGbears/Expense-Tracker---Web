var expenseTracker = angular.module('expenseTracker', ['ngResource', 'angles']);

//Expense Factory
expenseTracker.factory('expenseFactory', function($resource){
	
	//Getting expense data
	var expenseFac = $resource("/api/expenses/:id", {id: "@id"}, {
		update: {
			method: 'PUT'
		}
	});
		
	return expenseFac;
});

//Goal Factory
expenseTracker.factory('goalFactory', function($resource){
	
	//Getting goal data
	var goalFac = $resource("/api/goals/:id", {id: "@id"}, {
		update: {
			method: 'PUT'
		}
	});
	
	return goalFac;
});

//Analytics Service
expenseTracker.service('analyticsService', function(){
	
	//Find sum of expenses
	this.findSum = function(data){
		var sum = 0;
		for(var i = 0; i < data.length; i++){
			sum += data[i].amount;
		}
		return sum;
	};
	
	//Find top expense and its amount
	this.findTopExpense = function(data){
		data.sort(function(object1, object2){
			return object2.amount - object1.amount;
		});
		
		var topExpense = data[0].place;
		var mostExpensiveAmount = data[0].amount;
		return [topExpense, mostExpensiveAmount];
	};
	
	//Find most frequent expense
	this.findMostFrequentExpense = function(data){
		var frequency = {};
		var max = 0;
		var result;
		
		for(var i = 0; i < data.length; i++){
			frequency[data[i].place] = (frequency[data[i].place] || 0) + 1;
			if(frequency[data[i].place] > max){
				max = frequency[data[i].place];
				result = data[i].place;
			};
		};
		
		var sumExpense = 0;
		for(var i = 0; i < data.length; i++){
			if(data[i].place === result){
				sumExpense += data[i].amount;
			};
		};
		
		return [sumExpense, result];	
	};
	
	//Find most popular category
	this.findMostPopularCategory = function(data){
		var frequency = {};
		var max = 0;
		var result;
		
		for(var i = 0; i < data.length; i++){
			frequency[data[i].category] = (frequency[data[i].category] || 0) + 1;
			if(frequency[data[i].category] > max){
				max = frequency[data[i].category];
				result = data[i].category;
			};
		};
		
		var sumCategory = 0;
		for(var i = 0; i < data.length; i++){
			if(data[i].category === result){
				sumCategory += data[i].amount;
			};
		};
		
		return [sumCategory, result];	
	};
	
	//Find most active time
	this.findMostActiveTime = function(data){
		var timeExpenseData = [];
		
		var morningRange = [];
		var afternoonRange = [];
		var eveningRange = [];
		
		var morningSum = 0;
		var afternoonSum = 0;
		var eveningSum = 0;
		
		for(var i = 0; i < data.length; i++){
			var newDate = new Date(data[i].date);
			var hours = newDate.getHours();
			
			if(hours >= 0 && hours < 12){
				morningSum += data[i].amount;
				morningRange.push(data[i]);
			}else if(hours >= 12 && hours < 18){
				afternoonSum += data[i].amount;
				afternoonRange.push(data[i]);
			}else if(hours >= 18 && hours <= 23){
				eveningSum += data[i].amount;
				eveningRange.push(data[i]);
			}
		};
		
		timeExpenseData.push(
			{
				value: morningSum,
				label: "Morning",
				color: "rgba(0,0,50,0.5)"
			},
			{
				value: afternoonSum,
				label: "Afternoon",
				color: "rgba(0,0,125,0.5)"
			},
			{
				value: eveningSum,
				label: "Evening",
				color: "rgba(0,0,220,0.5)"
			}
		);
		
		function compare(a, b){
			if(a.value < b.value)
				return -1;
			if(a.value > b.value)
				return 1;
			return 0;
		}
		
		timeExpenseData.sort(compare);
		var mostActiveTime = timeExpenseData[2].label;
		
		if(mostActiveTime === "Morning"){
			morningRange.sort(compare);
			var timeRange = new Date(morningRange[morningRange.length - 1].date).getHours();
		}else if(mostActiveTime === "Afternoon"){
			afternoonRange.sort(compare);
			var timeRange = new Date(afternoonRange[afternoonRange.length - 1].date).getHours();
		}else if(mostActiveTime === "Evening"){
			eveningRange.sort(compare);
			var timeRange = new Date(eveningRange[eveningRange.length - 1].date).getHours();
		}
		
		return [mostActiveTime, timeExpenseData, timeRange];
	};
	
	this.getExpenseChartData = function(data){
		var expenseChartData = [];
		for(var i = 0; i < data.length; i++){
			expenseChartData.push(
				{
					value: data[i].amount,
					label: data[i].place,
					color: "rgba(100,100,100,0.5)"
				}
			);
		};
		
		return expenseChartData;
	};
	
	this.getCategoryChartData = function(data){
		var categoryChartData = [];
		
		var gasSum = 0;
		var groceriesSum = 0;
		var shoppingSum = 0;
		var takeoutSum = 0;
		
		for(var i = 0; i < data.length; i++){
			if(data[i].category === "Gas"){
				gasSum += data[i].amount;
			}else if(data[i].category === "Groceries"){
				groceriesSum += data[i].amount;
			}else if(data[i].category === "Shopping"){
				shoppingSum += data[i].amount;
			}else if(data[i].category === "Take-out"){
				takeoutSum += data[i].amount;
			}
		};
		
		categoryChartData.push(
			{
				value: gasSum,
				label: "Gas",
				color: "rgba(50,0,0,0.5)"
			},
			{
				value: groceriesSum,
				label: "Groceries",
				color: "rgba(100,0,0,0.5)"
			},
			{
				value: shoppingSum,
				label: "Shopping",
				color: "rgba(150,0,0,0.5)"
			},
			{
				value: takeoutSum,
				label: "Take-out",
				color: "rgba(200,0,0,0.5)"
			}
		);
		
		return categoryChartData;
	};
	
	this.getExpenseByTimeData = function(data){
		var datas = [];
		var titles = [];
		
		function addZero(num) {
		    if (num < 10) {
		        num = "0" + num;
		    }
		    return num;
		};
		
		var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		
		//Sort dates
		data.sort(function(a, b){
			if(a.date < b.date)
				return -1;
			if(a.date > b.date)
				return 1;
			return 0;
		});
		
		for(var i = 0; i < data.length; i++){
			var metaDate = new Date(data[i].date);
			var dayOfWeek = days[metaDate.getDay()];
			var dayOfMonth = metaDate.getDate();
			var month = months[metaDate.getMonth()];
			var year = metaDate.getFullYear();
			var hours = metaDate.getHours();
			var minutes = addZero(metaDate.getMinutes());
			var suffix = " AM"
			
			if(hours > 12){
				hours = hours - 12;
				suffix = " PM"
			};
			
			var time = month + " " + dayOfMonth + " at " + hours + ":" + minutes + suffix;
			
			datas.push(data[i].amount);
			titles.push(time);
		};
		
		var expenseByTimeData = {
			labels:  titles,
		    datasets: [
		        {
					fillColor: "rgba(151,187,205,0.2)",
           		 	strokeColor: "rgba(151,187,205,1)",
            		pointColor: "rgba(151,187,205,1)",
            		pointStrokeColor: "#fff",
            		pointHighlightFill: "#fff",
            		pointHighlightStroke: "rgba(151,187,205,1)",
		            data: datas
		        }
		    ]
		};
		
		return expenseByTimeData;
	};
	
	this.getGoalChartData = function(data, goal){
		var sum = 0;
		for(var i = 0; i < data.length; i++){
			sum += data[i].amount;
		}
		
		if(sum >= goal.value){
			var goalHolder = sum;
		}else{
			var goalHolder = goal.value;
		}
			
		var goalChartData = [
			{
				value: sum,
				color: "rgba(0,0,100, 0.5)"
			},
			{
				value: goalHolder - sum,
				color: "rgba(255,255,255, 0.3)"
			}
		];
		
		return goalChartData;
	};
	
	//Linear Regression for modeling
	this.linearRegression = function(y, x){
		var lr = {};
		var n = y.length;
		var sum_x = 0;
		var sum_y = 0;
		var sum_xy = 0;
		var sum_xx = 0;
		var sum_yy = 0;
		
		for (var i = 0; i < y.length; i++) {
			
			sum_x += x[i];
			sum_y += y[i];
			sum_xy += (x[i]*y[i]);
			sum_xx += (x[i]*x[i]);
			sum_yy += (y[i]*y[i]);
		} 
		
		lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
		lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
		lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
		
		return lr;
	}
});

//Main Controller
expenseTracker.controller('mainController', function($scope, expenseFactory, goalFactory, analyticsService){
	//Todays Date
	$scope.todaysDate = new Date();
	
	//Chart options
	$scope.chartOptions = {
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%>$<%= value.toFixed(2) %>",
		animationSteps : 30,
		animationEasing : "easeOut"
	};
	$scope.goalChartOptions = {
		tooltipTemplate:  "",
		percentageInnerCutout : 80,
		animationSteps : 30,
		segmentShowStroke: false,
		animationEasing : "easeOut"
	};
	
	//On page-load Update
	$scope.updateList = function(data){
		$scope.expenses = data;
	}
	
	$scope.updateData = function(data){
		$scope.sum = analyticsService.findSum(data);	//Find sum
		$scope.topExpense = analyticsService.findTopExpense(data)[0];	//Find top expense
		$scope.mostExpensiveAmount = analyticsService.findTopExpense(data)[1];	//Find top expense amount
		$scope.mostFrequentExpense = analyticsService.findMostFrequentExpense(data)[1];	//Find most frequently bought item
		$scope.sumFrequentExpense = analyticsService.findMostFrequentExpense(data)[0];	//Find the total amount spent on most frequent expense
		$scope.mostPopularCategory = analyticsService.findMostPopularCategory(data)[1];	//Find most popular category
		$scope.sumPopularCategory = analyticsService.findMostPopularCategory(data)[0];	//Find amount spent on most popular category
		$scope.mostActiveTime = analyticsService.findMostActiveTime(data)[0];	//Find most active time
		$scope.timeRange = analyticsService.findMostActiveTime(data)[2];	//Find most active time-range
	}
	
	$scope.updateChartData = function(data, goal){
		$scope.timeExpenseData = analyticsService.findMostActiveTime(data)[1];	//Most active time
		
		$scope.expenseChartData = analyticsService.getExpenseChartData(data);	//Get all expenses
		$scope.categoryChartData = analyticsService.getCategoryChartData(data);	//Category totals
		$scope.expenseByTimeData = analyticsService.getExpenseByTimeData(data);	//Expense-time data
		$scope.goalChartData = analyticsService.getGoalChartData(data, goal);	//Goal chart data
	}
	
	//Display data for certain time period
	$scope.display = function(period){	
		var data = [],
			today = new Date().getTime();
		
		expenseFactory.query({}, function(data){
			$scope.expenses = data;
		});
				
		for(var i = 0; i < $scope.expenses.length; i++){
			var expenseDate = new Date($scope.expenses[i].date).getTime();
			
			if(period === 'today'){							
				if((today - expenseDate)/(1000*60*60) <= 24){
					data.push($scope.expenses[i]);
				}
				
				$scope.datePrefix = "";
				$scope.timeFrame = {
					label: "",
					value: 1
				}; 
				 				
			}else if(period === "week"){
				if((today - expenseDate)/(1000*60*60) <= 24*7){
					data.push($scope.expenses[i]);
				}
				
				$scope.datePrefix = "Week ending "; 
				$scope.timeFrame = {
					label: "per day",
					value: 7
				};
				
			}else if(period === 'month'){				
				if((today - expenseDate)/(1000*60*60) <= 24*30){
					data.push($scope.expenses[i]);
				}
				
				$scope.datePrefix = "Month ending ";
				$scope.timeFrame = {
					label: "per week",
					value: 4
				}; 
			}else if(period === 'year'){
				if((today - expenseDate)/(1000*60*60) <= 24*365){
					data.push($scope.expenses[i]);
				}
				
				$scope.datePrefix = "Month ending ";
				$scope.timeFrame = {
					label: "per month",
					value: 12
				}; 
			}
		}
		
		$scope.updateData(data);
		$scope.updateChartData(data, $scope.goal);
	}
	
	//Animate Navigation Buttons
	$('#navigationButtons').addClass('animated tada');
	
	//Animate expense form easing in
	$scope.showExpenseForm = function(){
		$('#showAnalyticsButton').removeClass('animated rubberBand');
		$('#showExpenseListButton').removeClass('animated rubberBand');
		
		$('#showExpenseFormButton').addClass('animated rubberBand');
		var hidden = $('#expense-form').data('hidden');
		$('#showExpenseFormButton').text(hidden ? '+' : '-');
		
		if(hidden){			
			$('#navigationButtons').animate({'margin-right': '-283px'}, 300);
			
			//Other div width
			$('#expense-list').animate({width: '710px'}, 300);
			$('#analytics').animate({width: '710px'}, 300);
			//
			//Font sizes
			$('#expenseTable').animate({'font-size': '15px'}, 300);
			$('#analytics').animate({'font-size': '15px'}, 300);
			//
			
			$('#expense-form').hide(300);
		}else{
			//Font Sizes
			$('#expenseTable').animate({'font-size': '12px'}, 300);
			$('#analytics').animate({'font-size': '12px'}, 300);
			//
			//Other div width
			$('#expense-list').animate({width: '430px'}, 300);		
			$('#analytics').animate({width: '430px'}, 300);
			//
			
			$('#navigationButtons').animate({'margin-right': '0px'}, 300, function(){
				$('#navigationButtons').animate({'margin-left': '-283px'}, 300);
			});
			
			$('#expense-form').animate({'margin-left': '-320px'}, 300, function(){
				$('#expense-form').show().addClass('animated slideInRight');
			});		
		}
		$('#expense-form').data("hidden", !hidden);
	}	
	
	//Show Analytics
	$scope.showAnalytics = function(){
		$('#analytics').hide();
		$('#showAnalyticsButton').addClass('animated rubberBand');
		
		$('#showExpenseFormButton').removeClass('animated rubberBand');
		$('#showExpenseListButton').removeClass('animated rubberBand');
		
		//Remove all predifined classes
		$('#expense-list').removeClass('animated slideInLeft');
		$('#expense-list').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideInLeft');
		
	//	$('#expense-list').addClass('animated slideOutLeft');
		$('#analytics').css({'margin-top': '-308px'});
		
		setTimeout(function(){
			$('#analytics').addClass('animated slideInLeft');
			$('#analytics').animate({'height': '308px'}, 200, function(){
				$('#analytics').show();
			});
		}, 100);
	}
	
	//Show Expense List
	$scope.showExpenseList = function(){
		$('#showExpenseFormButton').removeClass('animated rubberBand');
		$('#showAnalyticsButton').removeClass('animated rubberBand');
		
		$('#showExpenseListButton').addClass('animated rubberBand');
		
		//Remove all predefined classes
		$('#expense-list').removeClass('animated slideInLeft');
		$('#expense-list').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideInLeft');
		
		setTimeout(function(){
			$('#analytics').addClass('animated slideOutLeft');
			$('#analytics').hide();
		}, 300);
		
		setTimeout(function(){
			$('#expense-list').addClass('animated slideInLeft');
			$('#expense-list').css({'overflow-y': 'auto'});
		}, 300);
	}
	
	//Show Predictions Panel
	$scope.showPredictions = function(){
		$('#expense-list').removeClass('animated slideInLeft');
		$('#expense-list').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideOutLeft');
		$('#analytics').removeClass('animated slideInLeft');
		
	//	$('#analytics').hide();
		
	}
	
	//Get goal data from factory
	goalFactory.query({}, function(data){
		$scope.goal = data[0];
	});
	
	//Get expense data from factory
	expenseFactory.query({}, function(data){
		$scope.expenses = data;
		
		$scope.updateList(data);	//Update all fields on page-load
		$scope.updateData(data);
		$scope.updateChartData(data, $scope.goal);	
	});
	
	//Set expense categories
	$scope.categories = ["Gas", "Groceries", "Shopping", "Take-out"];
	
	//Add Expense
	$scope.addExpense = function(){
		expenseFactory.save($scope.expenseData);
		$scope.expenseData = {}; //clear form
		
		expenseFactory.query({}, function(data){
			$scope.updateList(data);
			$scope.updateData(data);
			$scope.updateChartData(data, $scope.goal);
		});
	}
	
	//Delete Expense
	$scope.deleteExpense = function(id){
		expenseFactory.delete({id: id});
		
		expenseFactory.query({}, function(data){
			$scope.updateList(data);
			$scope.updateData(data);
			$scope.updateChartData(data, $scope.goal);
		});
	}
	
	//Add Goal
	$scope.addGoal = function(){
		goalFactory.save($scope.goalData);
		$scope.goalData = {};
	}
});

//Capitalized first letter of every word
expenseTracker.filter('capitalize', function(){
	return function(input, all) {
		return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
	    }
});