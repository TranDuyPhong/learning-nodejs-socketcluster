$(function() {
    observe('bind', function() {

    });
    observe('start', function() {

    });
    observe('build-about', function() {
        $('section[data-route="about"]').show();
        setTimeout(() => {
            notify('finish-loading');
        }, 200);
    })
});