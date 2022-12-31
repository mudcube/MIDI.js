/* 
    ----------------------------------------------------------
    Color Space : 1.2 : 2012.11.06
    ----------------------------------------------------------
    https://github.com/mudcube/Color.Space.js
    ----------------------------------------------------------
    RGBA <-> HSLA  <-> W3
    RGBA <-> HSVA
    RGBA <-> CMY   <-> CMYK
    RGBA <-> HEX24 <-> W3
    RGBA <-> HEX32
    RGBA <-> W3
    ----------------------------------------------------------
    Examples
    ----------------------------------------------------------
    Color.Space(0x99ff0000, "HEX32>RGBA>HSLA>W3"); // outputs "hsla(60,100%,17%,0.6)"
    Color.Space(0xFF0000, "HEX24>RGB>HSL"); // convert hex24 to HSL object.
    ----------------------------------------------------------
    W3 values
    ----------------------------------------------------------
    rgb(255,0,0)
    rgba(255,0,0,1)
    rgb(100%,0%,0%)
    rgba(100%,0%,0%,1)
    hsl(120, 100%, 50%)
    hsla(120, 100%, 50%, 1)
    #000000
    ----------------------------------------------------------
*/

export const Color = {};
Color.Space = {};

// eslint-disable-next-line func-names
(function () {

    const functions = {
        // holds generated cached conversion functions.
    };

    const shortcuts = {
        'HEX24>HSL': 'HEX24>RGB>HSL',
        'HEX32>HSLA': 'HEX32>RGBA>HSLA',
        'HEX24>CMYK': 'HEX24>RGB>CMY>CMYK',
        'RGB>CMYK': 'RGB>CMY>CMYK',
    };

    // eslint-disable-next-line no-multi-assign,func-names
    const root = Color.Space = function (color, route) {
        if (shortcuts[route]) { // shortcut available
            route = shortcuts[route];
        }
        const r = route.split('>');
        // check whether color is an [], if so, convert to {}
        if (typeof (color) === 'object' && color[0] >= 0) { // array
            const type = r[0];
            const tmp = {};
            for (let i = 0; i < type.length; i++) {
                const str = type.substr(i, 1);
                tmp[str] = color[i];
            }
            color = tmp;
        }
        if (functions[route]) { // cached function available
            return functions[route](color);
        }
        for (let pos = 1, key = r[0]; pos < r.length; pos++) {
            if (pos > 1) { // recycle previous
                key = key.substr(key.indexOf('_') + 1);
            }
            key += (pos === 0 ? '' : '_') + r[pos];
            color = root[key](color);
        }
        return color;
    };

    // W3C - RGB + RGBA

    // eslint-disable-next-line func-names
    root.RGB_W3 = function (o) {
        return 'rgb(' + (o.R >> 0) + ',' + (o.G >> 0) + ',' + (o.B >> 0) + ')'; 
    };

    // eslint-disable-next-line func-names
    root.RGBA_W3 = function (o) {
        const alpha = typeof (o.A) === 'number' ? o.A / 255 : 1;
        return 'rgba(' + (o.R >> 0) + ',' + (o.G >> 0) + ',' + (o.B >> 0) + ',' + alpha + ')'; 
    };

    // eslint-disable-next-line func-names
    root.W3_RGB = function (o) {
        const o_arr = o.substr(4, o.length - 5).split(',');
        return {
            R: parseInt(o_arr[0]),
            G: parseInt(o_arr[1]),
            B: parseInt(o_arr[2]),
        };
    };

    // eslint-disable-next-line func-names
    root.W3_RGBA = function (o) {
        const o_arr = o.substr(5, o.length - 6).split(',');
        return {
            R: parseInt(o_arr[0]),
            G: parseInt(o_arr[1]),
            B: parseInt(o_arr[2]),
            A: parseFloat(o_arr[3]) * 255,
        };
    };

    // W3C - HSL + HSLA

    // eslint-disable-next-line func-names
    root.HSL_W3 = function (o) {
        return 'hsl(' + ((o.H + 0.5) >> 0) + ',' + ((o.S + 0.5) >> 0) + '%,' + ((o.L + 0.5) >> 0) + '%)'; 
    };

    // eslint-disable-next-line func-names
    root.HSLA_W3 = function (o) {
        const alpha = typeof (o.A) === 'number' ? o.A / 255 : 1;
        return 'hsla(' + ((o.H + 0.5) >> 0) + ',' + ((o.S + 0.5) >> 0) + '%,' + ((o.L + 0.5) >> 0) + '%,' + alpha + ')'; 
    };

    // eslint-disable-next-line func-names
    root.W3_HSL = function (o) {
        const o_arr = o.substr(4, o.length - 5).split(',');
        return {
            H: parseInt(o_arr[0]),
            S: parseInt(o_arr[1]),
            L: parseInt(o_arr[2]),
        };
    };

    // eslint-disable-next-line func-names
    root.W3_HSLA = function (o) {
        const o_arr = o.substr(5, o.length - 6).split(',');
        return {
            H: parseInt(o_arr[0]),
            S: parseInt(o_arr[1]),
            L: parseInt(o_arr[2]),
            A: parseFloat(o_arr[3]) * 255,
        };
    };

    // W3 HEX = "FFFFFF" | "FFFFFFFF"

    // eslint-disable-next-line no-multi-assign,func-names
    root.W3_HEX = root.W3_HEX24 = function (o) {
        if (o.substr(0, 1) === '#') {
            o = o.substr(1);
        }
        if (o.length === 3) {
            o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2];
        }
        return parseInt('0x' + o);
    };

    // eslint-disable-next-line func-names
    root.W3_HEX32 = function (o) {
        if (o.substr(0, 1) === '#') {
            o = o.substr(1);
        }
        if (o.length === 6) {
            return parseInt('0xFF' + o);
        } else {
            return parseInt('0x' + o);
        }
    };

    // HEX = 0x000000 -> 0xFFFFFF

    // eslint-disable-next-line no-multi-assign,func-names
    root.HEX_W3 = root.HEX24_W3 = function (o, maxLength) {
        if (!maxLength) {
            maxLength = 6;
        }
        if (!o) {
            o = 0;
        }
        let z = o.toString(16);

        // when string is lesser than maxLength
        let n = z.length;
        while (n < maxLength) {
            z = '0' + z;
            n += 1;
        }
        // when string is greater than maxLength
        n = z.length;
        while (n > maxLength) {
            z = z.substring(1);
            n -= 1;
        }
        return '#' + z;
    };

    // eslint-disable-next-line func-names
    root.HEX32_W3 = function (o) {
        return root.HEX_W3(o, 8);
    };

    // eslint-disable-next-line no-multi-assign,func-names
    root.HEX_RGB = root.HEX24_RGB = function (o) {
        return {
            R: (o >> 16),
            G: (o >> 8) & 0xFF,
            B: o & 0xFF,
        };
    };

    // HEX32 = 0x00000000 -> 0xFFFFFFFF

    // eslint-disable-next-line func-names
    root.HEX32_RGBA = function (o) {
        return {
            R: o >>> 16 & 0xFF,
            G: o >>> 8 & 0xFF,
            B: o & 0xFF,
            A: o >>> 24,
        };
    };

    // RGBA = R: Red / G: Green / B: Blue / A: Alpha

    // eslint-disable-next-line func-names
    root.RGBA_HEX32 = function (o) {
        return (o.A << 24 | o.R << 16 | o.G << 8 | o.B) >>> 0;
    };

    // RGB = R: Red / G: Green / B: Blue

    // eslint-disable-next-line no-multi-assign,func-names
    root.RGB_HEX24 = root.RGB_HEX = function (o) {
        if (o.R < 0) { o.R = 0; }
        if (o.G < 0) { o.G = 0; }
        if (o.B < 0) { o.B = 0; }
        if (o.R > 255) { o.R = 255; }
        if (o.G > 255) { o.G = 255; }
        if (o.B > 255) { o.B = 255; }
        return o.R << 16 | o.G << 8 | o.B;
    };

    // eslint-disable-next-line func-names
    root.RGB_CMY = function (o) {
        return {
            C: 1 - (o.R / 255),
            M: 1 - (o.G / 255),
            Y: 1 - (o.B / 255),
        };
    };

    // eslint-disable-next-line no-multi-assign,func-names
    root.RGBA_HSLA = root.RGB_HSL = function (o) { // RGB from 0 to 1
        const _R = o.R / 255;
        const _G = o.G / 255;
        const _B = o.B / 255;
        const min = Math.min(_R, _G, _B);
        const max = Math.max(_R, _G, _B);
        const D = max - min;
        let H;
        let S;
        const L = (max + min) / 2;
        if (D === 0) { // No chroma
            H = 0;
            S = 0;
        } else { // Chromatic data
            if (L < 0.5) { S = D / (max + min); }
            else { S = D / (2 - max - min); }
            const DR = (((max - _R) / 6) + (D / 2)) / D;
            const DG = (((max - _G) / 6) + (D / 2)) / D;
            const DB = (((max - _B) / 6) + (D / 2)) / D;
            if (_R === max) { H = DB - DG; }
            else if (_G === max) { H = (1 / 3) + DR - DB; }
            else if (_B === max) { H = (2 / 3) + DG - DR; }
            if (H < 0) { H += 1; }
            if (H > 1) { H -= 1; }
        }
        return {
            H: H * 360,
            S: S * 100,
            L: L * 100,
            A: o.A,
        };
    };

    // eslint-disable-next-line no-multi-assign,func-names
    root.RGBA_HSVA = root.RGB_HSV = function (o) { //- RGB from 0 to 255
        const _R = o.R / 255;
        const _G = o.G / 255;
        const _B = o.B / 255;
        const min = Math.min(_R, _G, _B);
        const max = Math.max(_R, _G, _B);
        const D = max - min;
        let H;
        let S;
        const V = max;
        if (D === 0) { // No chroma
            H = 0;
            S = 0;
        } else { // Chromatic data
            S = D / max;
            const DR = (((max - _R) / 6) + (D / 2)) / D;
            const DG = (((max - _G) / 6) + (D / 2)) / D;
            const DB = (((max - _B) / 6) + (D / 2)) / D;
            if (_R === max) { H = DB - DG; }
            else if (_G === max) { H = (1 / 3) + DR - DB; }
            else if (_B === max) { H = (2 / 3) + DG - DR; }
            if (H < 0) { H += 1; }
            if (H > 1) { H -= 1; }
        }
        return {
            H: H * 360,
            S: S * 100,
            V: V * 100,
            A: o.A,
        };
    };

    // CMY = C: Cyan / M: Magenta / Y: Yellow

    // eslint-disable-next-line func-names
    root.CMY_RGB = function (o) {
        return {
            R: Math.max(0, (1 - o.C) * 255),
            G: Math.max(0, (1 - o.M) * 255),
            B: Math.max(0, (1 - o.Y) * 255),
        };
    };

    // eslint-disable-next-line func-names
    root.CMY_CMYK = function (o) {
        let C = o.C;
        let M = o.M;
        let Y = o.Y;
        let K = Math.min(Y, Math.min(M, Math.min(C, 1)));
        C = Math.round((C - K) / (1 - K) * 100);
        M = Math.round((M - K) / (1 - K) * 100);
        Y = Math.round((Y - K) / (1 - K) * 100);
        K = Math.round(K * 100);
        return {
            C,
            M,
            Y,
            K,
        };
    };

    // CMYK = C: Cyan / M: Magenta / Y: Yellow / K: Key (black)

    // eslint-disable-next-line func-names
    root.CMYK_CMY = function (o) {
        return {
            C: (o.C * (1 - o.K) + o.K),
            M: (o.M * (1 - o.K) + o.K),
            Y: (o.Y * (1 - o.K) + o.K),
        };
    };

    // HSL (1978) = H: Hue / S: Saturation / L: Lightness
    // en.wikipedia.org/wiki/HSL_and_HSV

    // eslint-disable-next-line no-multi-assign,func-names
    root.HSLA_RGBA = root.HSL_RGB = function (o) {
        const H = o.H / 360;
        const S = o.S / 100;
        const L = o.L / 100;
        let R;
        let G;
        let B;
        let temp1;
        let temp2;
        let temp3;
        if (S === 0) {
            // eslint-disable-next-line no-multi-assign
            R = G = B = L;
        } else {
            if (L < 0.5) { temp2 = L * (1 + S); }
            else { temp2 = (L + S) - (S * L); }
            temp1 = 2 * L - temp2;
            // calculate red
            temp3 = H + (1 / 3);
            if (temp3 < 0) { temp3 += 1; }
            if (temp3 > 1) { temp3 -= 1; }
            if ((6 * temp3) < 1) { R = temp1 + (temp2 - temp1) * 6 * temp3; }
            else if ((2 * temp3) < 1) { R = temp2; }
            else if ((3 * temp3) < 2) { R = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6; }
            else { R = temp1; }
            // calculate green
            temp3 = H;
            if (temp3 < 0) { temp3 += 1; }
            if (temp3 > 1) { temp3 -= 1; }
            if ((6 * temp3) < 1) { G = temp1 + (temp2 - temp1) * 6 * temp3; }
            else if ((2 * temp3) < 1) { G = temp2; }
            else if ((3 * temp3) < 2) { G = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6; }
            else { G = temp1; }
            // calculate blue
            temp3 = H - (1 / 3);
            if (temp3 < 0) { temp3 += 1; }
            if (temp3 > 1) { temp3 -= 1; }
            if ((6 * temp3) < 1) { B = temp1 + (temp2 - temp1) * 6 * temp3; }
            else if ((2 * temp3) < 1) { B = temp2; }
            else if ((3 * temp3) < 2) { B = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6; }
            else { B = temp1; }
        }
        return {
            R: R * 255,
            G: G * 255,
            B: B * 255,
            A: o.A,
        };
    };

    // HSV (1978) = H: Hue / S: Saturation / V: Value
    // en.wikipedia.org/wiki/HSL_and_HSV

    // eslint-disable-next-line no-multi-assign,func-names
    root.HSVA_RGBA = root.HSV_RGB = function (o) {
        let H = o.H / 360;
        const S = o.S / 100;
        let V = o.V / 100;
        let R;
        let G;
        let B;
        let D;
        let A;
        let C;
        if (S === 0) {
            // eslint-disable-next-line no-multi-assign
            R = G = B = Math.round(V * 255);
        } else {
            if (H >= 1) {
                H = 0;
            }
            H *= 6;
            D = H - Math.floor(H);
            A = Math.round(255 * V * (1 - S));
            B = Math.round(255 * V * (1 - (S * D)));
            C = Math.round(255 * V * (1 - (S * (1 - D))));
            V = Math.round(255 * V);
            // eslint-disable-next-line default-case
            switch (Math.floor(H)) {
            case 0:
                R = V;
                G = C;
                B = A;
                break;
            case 1:
                R = B;
                G = V;
                B = A;
                break;
            case 2:
                R = A;
                G = V;
                B = C;
                break;
            case 3:
                R = A;
                G = B;
                B = V;
                break;
            case 4:
                R = C;
                G = A;
                B = V;
                break;
            case 5:
                R = V;
                G = A;
                // B = B;
                break;
            }
        }
        return {
            R,
            G,
            B,
            A: o.A,
        };
    };

}());
