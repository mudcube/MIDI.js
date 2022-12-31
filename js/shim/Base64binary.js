/**
 * @license -------------------------------------------------------------------
 *   module: Base64Binary
 *      src: http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/
 *  license: Simplified BSD License
 * -------------------------------------------------------------------
 * Copyright 2011, Daniel Guerrero. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     - Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     - Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// noinspection SpellCheckingInspection
/**
 * Modified by MSC to be a module.
 * @type {string}
 * @private
 */
const _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/* will return a  Uint8Array type */
export function decodeArrayBuffer(input) {
    const bytes = Math.ceil((3 * input.length) / 4.0);
    const ab = new ArrayBuffer(bytes);
    decode(input, ab);

    return ab;
}

export function decode(input, arrayBuffer) {
    //get last chars to see if are valid
    const lkey1 = _keyStr.indexOf(input.charAt(input.length - 1));
    const lkey2 = _keyStr.indexOf(input.charAt(input.length - 1));

    let bytes = Math.ceil((3 * input.length) / 4.0);
    if (lkey1 === 64) {
        bytes -= 1;
    } //padding chars, so skip
    if (lkey2 === 64) {
        bytes -= 1;
    } //padding chars, so skip

    let uarray;
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let j = 0;

    if (arrayBuffer) {
        uarray = new Uint8Array(arrayBuffer);
    } else {
        uarray = new Uint8Array(bytes);
    }

    input = input.replace(/[^A-Za-z0-9+/=]/g, '');

    for (let i = 0; i < bytes; i += 3) {
        // get the 3 octets in 4 ascii chars
        // eslint-disable-next-line no-plusplus
        enc1 = _keyStr.indexOf(input.charAt(j++));
        // eslint-disable-next-line no-plusplus
        enc2 = _keyStr.indexOf(input.charAt(j++));
        // eslint-disable-next-line no-plusplus
        enc3 = _keyStr.indexOf(input.charAt(j++));
        // eslint-disable-next-line no-plusplus
        enc4 = _keyStr.indexOf(input.charAt(j++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[i] = chr1;
        if (enc3 !== 64) {
            uarray[i+1] = chr2;
        }
        if (enc4 !== 64) {
            uarray[i+2] = chr3;
        }
    }

    return uarray;
}
