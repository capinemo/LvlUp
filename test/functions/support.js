const assert = require('chai').assert;

function checkIt(item, index, def_fn, def_assert) {
    let fn = def_fn,
        check = item.assert ? item.assert : def_assert,
        task;

    task = '(' + (index + 1) + ') ' + 'CHECK: ' + fn.name + '(' + item.params.join(', ') + ')'
        + '\n\t' + 'RETURNS: '
        + ((check === 'throws') ? '(ERROR) ' + item.returns.source : JSON.stringify(item.returns));

    it(task, function() {
        if (check === 'throws') {
            assert[check](
                () => fn(...item.params),
                item.returns
            )
        } else {
            assert[check](fn(...item.params), item.returns);
        }
    });
}

exports.checkIt = checkIt;