'use strict';

define(function (require) {
    var Postmonger = require('postmonger');
    var $ = require('jquery.min');
    var connection = new Postmonger.Session();
    var payload = {};
    var authTokens = {};
    var webinars = [];
    var steps = [
        {"key": "selectwebinar", "label": "Select Webinar"},
        {"key": "summary", "label": "Summary"}
    ];
    var currentStep = steps[0].key;
    var eventDefinitionKey = '';
    var deFields = [];

    var webinarSelected = "";

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
    connection.on('requestedInteraction', requestedInteractionHandler);

    //connection.on('getWebinars', getWebinars);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');

        var $loading = $('#loadingDiv').hide();

        $('#webinar').change(function () {
            connection.trigger('updateButton', {button: 'next', enabled: Boolean($('#webinar').val() != 'null')});
        })

        $(document)
            .ajaxStart(function () {
                $loading.show();
            })
            .ajaxStop(function () {
                $loading.hide();
            });

    }


    function initialize(data) {
        if (data) {
            payload = data;
        }

        connection.trigger('updateButton', {button: 'next', enabled: false});

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};


        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {

                $('#' + key).val(val)

                if (key == 'webinar') {
                    $('#webinarSelected').val(val);
                }

            });

        });


        getWebinars();


    }

    function onGetTokens(tokens) {

        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {

    }

    function onClickedNext() {
        //save();
        connection.trigger('nextStep');

        if (currentStep.key === 'summary') { // Step 3
            save();
        } else if (currentStep.key === 'selectwebinar') { //Step 2
            fillSummaryStep($('#webinar').val())
            connection.trigger('nextStep');
        } else { //Step 1
            connection.trigger('nextStep');
        }
    }

    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step;

        switch (currentStep.key) {
            case 'selectwebinar':

                $('#step2').slideDown();
                connection.trigger('updateButton', {button: 'next', enabled: Boolean($('#webinar').val() != 'null')});
                //$('#step2 input').focus();
                break;
            case 'summary':

                $('#step2').slideUp();
                break;
        }
    }

    function requestedInteractionHandler(settings) {

        try {
            $('#EmailDE').val(settings.defaults.email[0])
            $('.selectpicker').selectpicker();
            $('.input-daterange').datepicker({})
            $('#webinar').append('<option value="null">-- Select a webinar --</option>')

            $('#loginGTW').click(function () {
                $('#loadingDiv').show();
            })

            $('#searchWebinars').click(function () {
                getWebinars()
            });

        } catch (e) {
            console.error(e);
        }
    }

    function getWebinars() {
        if ($('#startDate').val() != '' && $('#endDate').val() != '') {
            $.ajax({
                url: "/gtw/getWebinars",
                contentType: "application/json",
                Accept: "application/json",
                method: "GET",
                data: {
                    fromTime: $('#startDate').val(),
                    toTime: $('#endDate').val()
                },
                success: function (res) {

                    $('#webinar option').remove()
                    $('#webinar').append('<option value="null" selected>-- Select a webinar --</option>')
                    $('#webinarSelected').val("")
                    if (res.length > 0) {

                        webinars = res;
                        for (var webinar in webinars) {
                            $('#webinar').append('<option value="' + webinars[webinar].webinarKey + '">' + webinars[webinar].subject + ' (' + webinars[webinar].webinarKey + ')</option')
                        }
                        $('.selectpicker').prop('disabled', false);

                        if ($('#webinarSelected').val() != '') {
                            $('#webinar').selectpicker('refresh').selectpicker('val', $('#webinarSelected').val())
                            fillSummaryStep($('#webinar').val());
                        } else {
                            $('#webinar').val('null')
                        }
                    }

                    connection.trigger('updateButton', {
                        button: 'next',
                        enabled: Boolean($('#webinar').val() != 'null')
                    });
                    $('.selectpicker').selectpicker('refresh');
                },
                error: function (err) {

                    showStep(null, 1)
                    connection.trigger('updateButton', {button: 'next', enabled: false});

                    $('#error').text(err.responseText).show();

                    console.log(err)
                }
            })
        }

    }

    function save() {
        //payload.name="CA 1";
        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].execute = payload['arguments'].execute || {};

        let type = $('#type').val()
        payload['arguments'].execute.inArguments = [{
            "emailAddress": $('#EmailDE').val(),
            "webinar": $('#webinar').val(),
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "type": type
        }];


        payload['metaData'] = payload['metaData'] || {};

        if ($('#webinar').val() != "" && $('#webinar').val() != 'null') {
            payload['metaData'].isConfigured = true;
        } else {
            payload['metaData'].isConfigured = false;

        }

        if (type == 'Attendees') {
            payload.outcomes[0].metaData.label = 'Attendees'
            payload.outcomes[1].metaData.label = 'Unattendees'
            payload.name = 'GTW Split Attend'
        } else {
            payload.outcomes[0].metaData.label = 'Registered'
            payload.outcomes[1].metaData.label = 'Unregistered'
            payload.name = 'GTW Split Register'
        }


        connection.trigger('updateActivity', payload);
    }

    function fillSummaryStep(webinarKey) {
        $.ajax({
            url: "/gtw/getWebinar/" + webinarKey,
            contentType: "application/json",
            Accept: "application/json",
            method: "GET",
            data: {},
            success: function (webinar) {
                if (!Boolean(webinar.body && webinar.body.errorCode)) {

                    $('#summaryWebinar').val(webinar.subject)
                    $('#summaryNRegistrants').val(webinar.numberOfRegistrants)
                    $('#summaryStartDate').val(new Date(webinar.times[0].startTime))
                    $('#summaryEndDate').val(new Date(webinar.times[0].endTime))
                    $('#summaryDescription').val(webinar.description)
                    $('#summaryURLRegistration').val(webinar.registrationUrl)
                }
            },
            error: function (err) {
                $('#error').text(err.responseText).show();

                console.log(err)
            }
        })
    }

});
