$(function() {
    observe('bind', function() {
        function routerMiddleware() {
            notify('start-loading');
            $('section').hide();
            var hash = window.location.hash.slice(2);
            if (isNaN(hash[hash.length - 1])) {
                notify('build-' + hash);
            } else {

            }
        }
        var dashboard = () => {};
        var about = () => {};
        var users = () => {};
        var routes = {
            '/dashboard': dashboard,
            '/about': about,
            '/users': users
        };
        var router = Router(routes);
        router.configure({
            on: routerMiddleware
        });
        router.init();
    });
    observe('start-loading', function() {
        $('.whole-page').hide();
        $('.loading-page').show();
    });
    observe('finish-loading', function() {
        $('.loading-page').hide();
        $('.whole-page').show();
    });
});