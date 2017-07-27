/**
 * http://www.w3.org/TR/NOTE-datetime
 *
 * 2014-12-03 18:06:56
 *
 * YYYY = 2014
 *
 * M = 12
 * MM = 12
 *
 * D = 3
 * DD = 03
 *
 * h = 18
 * hh = 18
 *
 * m = 6
 * mm = 06
 *
 * s = 56
 * ss = 56
 *
 */

'use strict';

const pad2 = value => ('0' + value).substr(-2);
const pad3 = value => ('00' + value).substr(-3);

const dateFormatter = (date, format) => {
    // get date
    date = typeof date === 'number' ? new Date(date) : date;

    const _year = date.getUTCFullYear();
    const _month = date.getUTCMonth() + 1;
    const _date = date.getUTCDate();
    const _hour = date.getUTCHours();
    const _minute = date.getUTCMinutes();
    const _second = date.getUTCSeconds();
    const _ms = date.getUTCMilliseconds();

    // generate number
    const pairs = {
        YYYY: _year,
        M: _month,
        MM: pad2(_month),
        D: _date,
        DD: pad2(_date),
        h: _hour,
        hh: pad2(_hour),
        m: _minute,
        mm: pad2(_minute),
        s: _second,
        ss: pad2(_second),
        SSS: pad3(_ms)
    };

    // format date
    return format.replace(/YYYY|MM?|DD?|hh?|mm?|ss?|SSS/g, function(matched) {
        return pairs[matched];
    });
};

export default dateFormatter;
