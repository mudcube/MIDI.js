/*
    ----------------------------------------------------------
    MIDI.audioDetect : 0.3.2 : 2015-03-26
    ----------------------------------------------------------
    https://github.com/mscuthbert/midicube
    ----------------------------------------------------------
    Probably, Maybe, No... Absolutely!
    Test to see what types of <audio> MIME types are playable by the browser.
    ----------------------------------------------------------
*/

export const supports = {}; // object of supported file types

let pending = 0; // pending file types to process

export const canPlayThrough = src => { // check whether format plays through
    pending += 1;
    const body = document.body;
    const audio = new Audio();
    const mime = src.split(';')[0];
    audio.id = 'audio';
    audio.setAttribute('preload', 'auto');
    audio.setAttribute('audiobuffer', 'true');
    audio.addEventListener('error', () => {
        body.removeChild(audio);
        supports[mime] = false;
        pending -= 1;
    }, false);

    // fires when enough data has loaded that <audio> tag
    // can successfully play to end without stopping.
    audio.addEventListener('canplaythrough', () => {
        body.removeChild(audio);
        supports[mime] = true;
        pending -= 1;
    }, false);
    audio.src = 'data:' + src;
    body.appendChild(audio);
};

export function audioDetect(successCallback) {
    // detect jazz-midi plugin
    if (typeof navigator !== 'undefined' && navigator.requestMIDIAccess) {
        const isNative = Function.prototype.toString
            .call(navigator.requestMIDIAccess)
            .indexOf('[native code]');

        if (isNative) { // has native webmidi support
            supports.webmidi = true;
        } else if (typeof navigator !== 'undefined' && navigator.plugins !== undefined) {
            // check for jazz plugin webmidi support
            for (const plugin of Array.from(navigator.plugins)) {
                if (plugin.name.indexOf('Jazz-Plugin') >= 0) {
                    supports.webmidi = true;
                }
            }
        }
    }

    // check whether <audio> tag is supported
    if (typeof Audio === 'undefined') {
        return successCallback({});
    } else {
        supports.audiotag = true;
    }

    // check for webaudio api support
    // noinspection JSUnresolvedVariable
    const ctx_constructor = window.AudioContext || window.webkitAudioContext;
    if (ctx_constructor && !!ctx_constructor.prototype.createGain) {
        supports.webaudio = true;
    }

    // check whether canPlayType is supported
    const audio = new Audio();
    if (typeof (audio.canPlayType) === 'undefined') {
        return successCallback(supports);
    }

    // see what we can learn from the browser
    const vorbis_play_type = audio.canPlayType('audio/ogg; codecs="vorbis"');
    const vorbis = (vorbis_play_type === 'probably' || vorbis_play_type === 'maybe');
    const mpeg_play_type = audio.canPlayType('audio/mpeg');
    const mpeg = (mpeg_play_type === 'probably' || mpeg_play_type === 'maybe');

    // if one play_type is probably and the other is maybe, always go with
    // the probably despite what canPlayThrough reveals.
    // this is for Edge and other browsers where canPlayThrough for ogg
    // is successful but nothing plays.
    if (vorbis_play_type === 'probably') {
        supports.ogg_mp3_precedence = 'ogg';
    } else if (mpeg_play_type === 'probably') {
        supports.ogg_mp3_precedence = 'mp3';
    } else {  // it is not clear that either can play; so might as well try ogg.
        supports.ogg_mp3_precedence = 'ogg';
    }

    // maybe nothing is supported
    if (!vorbis && !mpeg) {
        return successCallback(supports);
    }

    // or maybe something is supported
    if (vorbis) {
        // noinspection SpellCheckingInspection
        canPlayThrough('audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA=');
    }
    if (mpeg) {
        // noinspection SpellCheckingInspection
        canPlayThrough('audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    }

    // lets find out!
    const time = (new Date()).getTime();
    const interval = window.setInterval(() => {
        const now = (new Date()).getTime();
        const maxExecution = now - time > 5000;
        if (!pending || maxExecution) {
            window.clearInterval(interval);
            successCallback(supports);
        }
    }, 1);
    return undefined;
}
