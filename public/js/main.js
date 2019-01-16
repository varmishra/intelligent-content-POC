'use strict';

requirejs.config({
    paths: {
						'jquery':'jquery.min',
						'bootstrap' : 'bootstrap.min',
						'bootstrap-select' : 'bootstrap-select.min',
						'bootstrap-datepicker': 'bootstrap-datepicker.min',
						postmonger:'postmonger',
						customActivity:'../customActivity',
						js:'../js'
					},
    shim: {
        'jquery.min': {
            exports: '$'
        },
  		'customActivity': {
  			deps: ['jquery.min', 'postmonger']
  		}
    }
});


requirejs( ['jquery.min', 'postmonger', 'customActivity', 'bootstrap','bootstrap-select','bootstrap-datepicker'], function( $, customActivity ) {
	
});

requirejs.onError = function (err) {
	if (err.requireType === 'timeout') {
		console.log('modules: ' + err.requireModules);
	}
	throw err;
};

