$(document).ready(function() {
    $('.onboard-wrapper').exists() && initOnboard();

    function initOnboard() {
        let onboardWrapper = $('.onboard-wrapper'),
            onboardSteps = onboardWrapper.children('li'),
			stepsCount = onboardSteps.length,
			overlay = $('.overlay'),
            stepInfo = $('.more-info');
            
        appendNavigation(onboardSteps, stepsCount);

        if (!localStorage.getItem("firstTime")) {
            console.log("First Time");

            onboardWrapper.addClass('active');
            showStep(onboardSteps.eq(0), overlay);
        }

        stepInfo.on('click', '.nav_next', function(event){
            //go to next step - if available
            function callback() {
                $('.setting').click();
            }
			( !$(event.target).hasClass('inactive') ) && changeStep(onboardSteps, overlay, 'next', callback);
        });
        
        stepInfo.on('click', '.nav-close', function(event){
			closeTour(onboardSteps, onboardWrapper, overlay);
		});

    }

    function appendNavigation(steps, n) {
        let navigateHtml = `
            <div class="nav">
                <span><b class="actual-step">1</b> of ${n}</span>
                <ul class="tour-nav">
                    <li><a href="#0" class="nav_next">Next &#187;</a></li>
                </ul>
            </div>
            <a href="#0" class="nav-close">Close</a>`;
        
        steps.each(function(index) {
            var step = $(this),
				stepNumber = index + 1,
				nextClass = ( stepNumber < n ) ? '' : 'inactive',
				prevClass = ( stepNumber == 1 ) ? 'inactive' : '';
			var nav = $(navigateHtml).find('.nav_next').addClass(nextClass).end().find('.nav_prev').addClass(prevClass).end().find('.actual-step').html(stepNumber).end().appendTo(step.children('.more-info'));
        });
    }

    function showStep(step, overlay) {
        step.addClass('selected');
		showOverlay(overlay);
    }
    
    function showOverlay(overlay) {
        overlay.addClass('show');
    }
    
    function changeStep(steps, layer, bool, callBack) {
		var visibleStep = steps.filter('.selected'),
			delay = 300; 
		visibleStep.removeClass('selected');

		setTimeout(function(){
			( bool == 'next' )
				? showStep(visibleStep.next(), layer)
				: showStep(visibleStep.prev(), layer);
        }, delay);
        callBack();
	}

	function closeTour(steps, wrapper, layer) {
		steps.removeClass('selected');
		wrapper.removeClass('active');
        layer.removeClass('show');
        localStorage.setItem("firstTime", true);
	}

});

jQuery.fn.exists = function(){ return this.length > 0; }