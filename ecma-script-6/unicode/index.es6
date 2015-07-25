/**
 * @since 150521 19:15
 * @author vivaxy
 */

// same as ES5.1
'𠮷'.length == 2

// new RegExp behaviour, opt-in ‘u’
'𠮷'.match(/./u)[0].length == 2

// new form
'\u{20BB7}' == '𠮷' == '\uD842\uDFB7'

// new String ops
'𠮷'.codePointAt(0) == 0x20BB7

// for-of iterates code points
for(var c of '𠮷') {
    console.log(c);
}
