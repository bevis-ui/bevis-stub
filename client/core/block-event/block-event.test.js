modules.define(
    'test',
    [
        'block-event'
    ],
    function (
        provide,
        BlockEvent
    ) {

    describe('BlockEvent', function () {
        describe('new BlockEvent("type")', function () {
            var event;

            beforeEach(function () {
                event = new BlockEvent('foo');
            });

            it('should not stop propagation and not stop default action', function () {
                event.isPropagationStopped().should.be.false;
                event.isDefaultPrevented().should.be.false;
            });

            it('should have property `type`', function () {
                event.type.should.eq('foo');
            });
        });

        describe('new BlockEvent("type", true, false)', function () {
            it('should stop propagation', function () {
                var event = new BlockEvent('type', true, false);
                event.isPropagationStopped().should.be.true;
                event.isDefaultPrevented().should.be.false;
            });
        });

        describe('new BlockEvent("type", false, true)', function () {
            it('should prevent default action', function () {
                var event = new BlockEvent('type', false, true);
                event.isPropagationStopped().should.be.false;
                event.isDefaultPrevented().should.be.true;
            });
        });

        describe('preventDefault()', function () {
            it('should prevent default action of event', function () {
                var event = new BlockEvent('type');
                event.preventDefault();
                event.isDefaultPrevented().should.be.true;
            });
        });

        describe('stopPropagation()', function () {
            it('should stop propagation of event', function () {
                var event = new BlockEvent('type');
                event.stopPropagation();
                event.isPropagationStopped().should.be.true;
            });
        });
    });

    provide();
});
